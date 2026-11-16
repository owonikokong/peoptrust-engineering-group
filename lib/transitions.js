// Domain transitions (state-machines review, 2026-11-16, Step 2).
//
// Standing rule: one machine, one definition, one owner. These functions
// OWN the state-changing writes for the verification, application,
// job-posting, and job-lifecycle machines: they derive the current state
// (lib/states), enforce the transition's preconditions, and perform the
// write. Routes validate request shape, enforce rate limits, and map
// typed results to HTTP responses — they never hand-roll these field
// updates themselves.
//
// Every transition preserves the exact pre-Step-2 behaviour: same checks,
// same order, same writes. Mail delivery stays in the routes: sending the
// email is delivery, not a state change, and registration proceeds
// whether or not delivery succeeds.
//
// Server-only: imports the store and Node crypto (via lib/verify).

import {
  createApplication,
  createJob,
  findApplication,
  findUserById,
  getJob,
  publicUser,
  updateJobFields,
  updateUserFields,
} from "./store";
import { codeMatches, newCodeFields } from "./verify";
import {
  accountState,
  canCloseJob,
  canDeleteJob,
  canEditJob,
  canReopenJob,
} from "./states";

/**
 * Issue a fresh verification code for a user: generates the code, hashes
 * it at rest, resets attempts, and stamps the send time. Returns the
 * plaintext code so the caller can email it. Used by registration (new
 * accounts) and resend-code (existing unverified accounts) alike.
 */
export async function issueVerificationCode(user) {
  const { code, fields } = newCodeFields(user.id);
  await updateUserFields(user.id, fields);
  return { code };
}

/**
 * Consume a verification code: the pending → verified transition.
 *
 * Returns { ok: true, user } with the freshly read, public-safe user on
 * success, or { ok: false, reason } where reason is one of:
 * - "no-code": no code hash/expiry stored for this account.
 * - "expired": the stored code's expiry has passed (checked BEFORE
 *   attempts, matching the historical route order).
 * - "exhausted": attempts reached the maximum with a live code.
 * - "mismatch": the code did not match; the attempt was recorded
 *   (verifyAttempts incremented) before returning.
 * The caller maps each reason to its existing HTTP response.
 */
export async function consumeVerificationCode(user, code) {
  const state = accountState(user);
  if (state === "no-code") return { ok: false, reason: "no-code" };
  if (state === "expired") return { ok: false, reason: "expired" };
  if (state === "exhausted") return { ok: false, reason: "exhausted" };

  if (!codeMatches(user.id, code, user.verifyCodeHash)) {
    await updateUserFields(user.id, {
      verifyAttempts: (user.verifyAttempts || 0) + 1,
    });
    return { ok: false, reason: "mismatch" };
  }

  await updateUserFields(user.id, {
    emailVerified: true,
    verifyCodeHash: null,
    verifyExpiresAt: null,
    verifyAttempts: 0,
  });
  const updated = await findUserById(user.id);
  return { ok: true, user: publicUser(updated) };
}

/**
 * Submit an application: the only application-writing transition.
 * Enforces the one-application-per-job rule, then writes the application
 * with status "Submitted" — the only status in the vocabulary today (see
 * APPLICATION_STATUSES in lib/states and the CHECK constraint in
 * supabase/schema.sql). The caller owns the role/verified guards and the
 * job lookup; this transition owns the duplicate check and the write.
 *
 * Returns { ok: true, application } or { ok: false, reason:
 * "already-applied" }.
 */
export async function submitApplication({ user, job, coverNote }) {
  const existing = await findApplication(user.id, job.id);
  if (existing) return { ok: false, reason: "already-applied" };
  const application = await createApplication({
    jobId: job.id,
    userId: user.id,
    employerId: job.employerId,
    coverNote: coverNote || "",
  });
  return { ok: true, application };
}

/**
 * Post a job: the only job-writing transition for creation. Jobs are
 * created open — there is no draft state. The caller owns the
 * role/verified guards and field validation.
 */
export async function postJob({ user, fields }) {
  const job = await createJob({ ...fields, employerId: user.id, status: "open" });
  return { job };
}

// ---------------------------------------------------------------------------
// Job lifecycle (Step 2 scope revision: close/edit/delete IS wanted).
// Machine definition + transitions only — no API route or UI calls these
// yet; endpoints and employer buttons come in the following step, after
// the schema migration (supabase/schema.sql) is applied to the live
// database. Every transition is employer-owner-only and returns a typed
// result; the future routes map reasons to HTTP responses. No transition
// here touches applications: closing, editing, or soft-deleting a job
// never deletes or hides its applications from the employer.
// ---------------------------------------------------------------------------

/**
 * Close a job: open → closed. Reasons: "not-owner", "not-open".
 */
export async function closeJob({ user, job }) {
  if (!user || user.id !== job.employerId) return { ok: false, reason: "not-owner" };
  if (!canCloseJob(user, job)) return { ok: false, reason: "not-open" };
  await updateJobFields(job.id, { status: "closed" });
  return { ok: true, job: await getJob(job.id) };
}

/**
 * Reopen a job: closed → open. Reasons: "not-owner", "not-closed".
 */
export async function reopenJob({ user, job }) {
  if (!user || user.id !== job.employerId) return { ok: false, reason: "not-owner" };
  if (!canReopenJob(user, job)) return { ok: false, reason: "not-closed" };
  await updateJobFields(job.id, { status: "open" });
  return { ok: true, job: await getJob(job.id) };
}

/**
 * Edit a job: only while open. `fields` carries the already-validated
 * editable fields (title, category, location, type, description,
 * requirements) — validation lives in the future route, as it does for
 * posting. Reasons: "not-owner", "not-open".
 */
export async function updateJob({ user, job, fields }) {
  if (!user || user.id !== job.employerId) return { ok: false, reason: "not-owner" };
  if (!canEditJob(user, job)) return { ok: false, reason: "not-open" };
  const editable = {};
  for (const key of ["title", "category", "location", "type", "description", "requirements"]) {
    if (key in fields) editable[key] = fields[key];
  }
  await updateJobFields(job.id, editable);
  return { ok: true, job: await getJob(job.id) };
}

/**
 * Soft-delete a job: open or closed → deleted. The row stays, so the
 * employer's applications for the job stay readable; only the status
 * changes. A deleted job cannot be deleted again. Reasons: "not-owner",
 * "already-deleted".
 */
export async function deleteJob({ user, job }) {
  if (!user || user.id !== job.employerId) return { ok: false, reason: "not-owner" };
  if (!canDeleteJob(user, job)) return { ok: false, reason: "already-deleted" };
  await updateJobFields(job.id, { status: "deleted" });
  return { ok: true, job: await getJob(job.id) };
}
