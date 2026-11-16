// Shared API error codes — the single vocabulary for error responses.
//
// Every API error response carries a stable `code` alongside the human
// message (state-machines review, 2026-11-16, Step 2). Clients classify
// errors by code, never by parsing message text.
//
// This module has NO imports: it is safe to import from client components
// and server code alike. Code values are part of the API contract — never
// rename a value, only add new ones.

export const ERROR_CODES = Object.freeze({
  // Auth / session
  NOT_SIGNED_IN: "NOT_SIGNED_IN",
  ACCOUNT_NOT_FOUND: "ACCOUNT_NOT_FOUND",
  BAD_CREDENTIALS: "BAD_CREDENTIALS",
  // Request shape
  INVALID_BODY: "INVALID_BODY",
  VALIDATION: "VALIDATION",
  // Registration
  EMAIL_TAKEN: "EMAIL_TAKEN",
  // Guards
  ROLE_FORBIDDEN: "ROLE_FORBIDDEN",
  EMAIL_UNVERIFIED: "EMAIL_UNVERIFIED",
  // Jobs / applications
  JOB_NOT_FOUND: "JOB_NOT_FOUND",
  ALREADY_APPLIED: "ALREADY_APPLIED",
  // Verification codes
  NO_ACTIVE_CODE: "NO_ACTIVE_CODE",
  CODE_EXPIRED: "CODE_EXPIRED",
  CODE_EXHAUSTED: "CODE_EXHAUSTED",
  CODE_MISMATCH: "CODE_MISMATCH",
  RESEND_COOLDOWN: "RESEND_COOLDOWN",
  // Rate limiting
  RATE_LIMITED: "RATE_LIMITED",
});
