// Single definitions for the app's domain state machines (state-machines
// review, 2026-11-16; Step 1: pure helpers + additive error codes,
// Step 2: transitions in lib/transitions.js).
//
// Standing rule: one machine, one definition, one owner. These helpers are
// PURE — no I/O, no writes — they only name the state a user is in and
// answer guard questions. The transitions that change state live in
// lib/transitions.js and derive through these helpers.
//
// Server-only: isVerified comes from lib/store, which uses Node APIs. Do
// not import this module from client components; clients read the additive
// `code` field on API error responses instead (see ApplyForm/PostJobForm).

import { MAX_CODE_ATTEMPTS, RESEND_COOLDOWN_MS } from "./verify";
import { isVerified } from "./store";

/**
 * Account verification state, derived once from the user's verification
 * fields. Exactly one of:
 * - "verified": email confirmed (includes legacy accounts created before
 *   verification existed — see isVerified in lib/store).
 * - "pending": a code is active (hash present, not expired, attempts left).
 * - "expired": a code hash is present but its expiry has passed. Checked
 *   BEFORE attempts, matching the verify route's historical order: an
 *   expired code reads as expired even when attempts are also exhausted.
 * - "exhausted": attempts reached MAX_CODE_ATTEMPTS with a live code.
 * - "no-code": no code hash/expiry stored (never issued, or already used).
 * A null/undefined user has no code, so it reads as "no-code".
 */
export function accountState(user, now = Date.now()) {
  if (isVerified(user)) return "verified";
  if (!user || !user.verifyCodeHash || !user.verifyExpiresAt) return "no-code";
  if (new Date(user.verifyExpiresAt).getTime() < now) return "expired";
  if ((user.verifyAttempts || 0) >= MAX_CODE_ATTEMPTS) return "exhausted";
  return "pending";
}

/**
 * Resend-cooldown status for a fresh verification code. Mirrors the
 * resend-code route: allowed unless a code was sent less than
 * RESEND_COOLDOWN_MS ago. waitSeconds is 0 when allowed.
 */
export function resendStatus(user, now = Date.now()) {
  if (user?.verifySentAt) {
    const elapsed = now - new Date(user.verifySentAt).getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      return {
        allowed: false,
        waitSeconds: Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000),
      };
    }
  }
  return { allowed: true, waitSeconds: 0 };
}

/**
 * Application status vocabulary. Today only "Submitted" is ever written
 * (see createApplication in lib/store); future review transitions
 * (shortlist/reject/hire) extend this list.
 */
export const APPLICATION_STATUSES = ["Submitted"];

/**
 * Guards — same decisions as today's routes (role + verified). Defined
 * here so the rules have one owner. Routes check the role first (keeping
 * their distinct ROLE_FORBIDDEN message), then the guard (keeping their
 * distinct EMAIL_UNVERIFIED message); since the role check already
 * passed, the guard result equals the verified check it replaces.
 */
export function canPost(user) {
  return Boolean(user) && user.role === "employer" && isVerified(user);
}

export function canApply(user) {
  return Boolean(user) && user.role === "professional" && isVerified(user);
}

/**
 * Dossier visibility, same rule as the professional page: the full
 * experience / CV / certifications dossier is visible only to employers
 * and to the professional themselves.
 */
export function canViewDossier(viewer, pro) {
  if (!viewer || !pro) return false;
  return viewer.role === "employer" || viewer.id === pro.id;
}

// ---------------------------------------------------------------------------
// Job lifecycle (Step 2 scope revision, 2026-11-16: close/edit/delete IS
// wanted). States: "open" / "closed" / "deleted". Jobs are created open —
// there is no draft state, because creation today is immediate and the
// lifecycle keeps it that way. Deletion is soft: the row stays, only its
// status changes, so applications are never deleted or hidden from the
// employer by any job transition. Machine definition + transitions only;
// API routes and employer buttons come in the following step.
// ---------------------------------------------------------------------------

/**
 * Job status vocabulary. The database enforces the same list (CHECK
 * constraint in supabase/schema.sql).
 */
export const JOB_STATUSES = ["open", "closed", "deleted"];

/**
 * A job's lifecycle state. Rows created before the status column existed
 * (or read from a backend without it) have no status stored; they read
 * as "open", which is what they effectively are. Unknown values also
 * read as "open" rather than inventing a fourth state.
 */
export function jobState(job) {
  const status = job?.status;
  if (status === "closed" || status === "deleted") return status;
  return "open";
}

function isJobOwner(user, job) {
  return Boolean(user) && Boolean(job) && user.id === job.employerId;
}

/** Close: open → closed. Employer-owner only. */
export function canCloseJob(user, job) {
  return isJobOwner(user, job) && jobState(job) === "open";
}

/** Reopen: closed → open. Employer-owner only. */
export function canReopenJob(user, job) {
  return isJobOwner(user, job) && jobState(job) === "closed";
}

/** Edit: only while open. Employer-owner only. */
export function canEditJob(user, job) {
  return isJobOwner(user, job) && jobState(job) === "open";
}

/**
 * Soft-delete: open or closed → deleted. Employer-owner only. A deleted
 * job cannot be deleted again, closed, reopened, or edited.
 */
export function canDeleteJob(user, job) {
  const state = jobState(job);
  return isJobOwner(user, job) && (state === "open" || state === "closed");
}
