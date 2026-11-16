// Single definitions for the app's domain state machines (state-machines
// review, 2026-11-16, Step 1: pure helpers + additive error codes).
//
// Standing rule: one machine, one definition, one owner. These helpers are
// PURE — no I/O, no writes — they only name the state a user is in and
// answer guard questions. Routes keep owning the writes; Step 2 moves the
// transitions here too.
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
 * here so the rules have one owner; routes still return their own distinct
 * error message per failing check, so wiring the guards into the routes
 * happens in Step 2, when the transitions move here too.
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
