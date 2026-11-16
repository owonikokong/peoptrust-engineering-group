import { createHash, randomInt, timingSafeEqual } from "crypto";

// Email verification codes: 6 digits, unique per user, 30-minute expiry,
// hashed at rest (sha256 of "userId:code"), max 5 attempts, 60s resend
// cooldown.

export const CODE_TTL_MS = 30 * 60 * 1000;
export const MAX_CODE_ATTEMPTS = 5;
export const RESEND_COOLDOWN_MS = 60 * 1000;

export function generateCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashCode(userId, code) {
  return createHash("sha256").update(`${userId}:${code}`).digest("hex");
}

export function codeMatches(userId, code, storedHash) {
  if (!storedHash) return false;
  const candidate = Buffer.from(hashCode(userId, String(code)));
  const stored = Buffer.from(storedHash);
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
}

/** Fields to persist when issuing a fresh code for a user. */
export function newCodeFields(userId) {
  const code = generateCode();
  const now = Date.now();
  return {
    code,
    fields: {
      verifyCodeHash: hashCode(userId, code),
      verifyExpiresAt: new Date(now + CODE_TTL_MS).toISOString(),
      verifyAttempts: 0,
      verifySentAt: new Date(now).toISOString(),
    },
  };
}
