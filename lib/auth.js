import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { findUserById, publicUser } from "./store";

export const SESSION_COOKIE = "pt_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function secret() {
  return process.env.AUTH_SECRET || "peoptrust-dev-secret";
}

// ---- Passwords (scrypt, per-user salt, stored as "salt:hash") ----

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, expected] = stored.split(":");
  const actual = scryptSync(String(password), salt, 64);
  const expectedBuf = Buffer.from(expected, "hex");
  return (
    actual.length === expectedBuf.length && timingSafeEqual(actual, expectedBuf)
  );
}

// ---- Signed session tokens (HMAC-SHA256) ----

function hmac(data) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function signSession(payload) {
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + SESSION_TTL_MS }),
  ).toString("base64url");
  return `${body}.${hmac(body)}`;
}

/**
 * Session validation with a failure reason (state-machines review,
 * 2026-11-16, Step 2). Exactly one of:
 * - { status: "valid", payload }: signature good, not expired.
 * - { status: "no-token" }: no token at all (signed-out visit).
 * - { status: "bad-signature" }: token present but untrustworthy —
 *   malformed structure, signature mismatch, or an unparseable payload.
 * - { status: "expired" }: signature good, expiry in the past.
 * The expiry comparison matches the historical check exactly: a token
 * expiring at this instant still validates (exp < now fails, exp == now
 * passes). A payload without an expiry is untrustworthy, not expired.
 */
export function verifySessionDetailed(token) {
  if (!token) return { status: "no-token", payload: null };
  if (!token.includes(".")) return { status: "bad-signature", payload: null };
  const [body, signature] = token.split(".");
  const expected = hmac(body);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return { status: "bad-signature", payload: null };
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.exp) return { status: "bad-signature", payload: null };
    if (payload.exp < Date.now()) return { status: "expired", payload: null };
    return { status: "valid", payload };
  } catch {
    return { status: "bad-signature", payload: null };
  }
}

export function verifySession(token) {
  const result = verifySessionDetailed(token);
  return result.status === "valid" ? result.payload : null;
}

// ---- Cookie helpers (route handlers / server actions) ----

export async function setSessionCookie(user) {
  const token = signSession({ userId: user.id, role: user.role });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// ---- Current user from the session cookie ----

/**
 * Current session with its failure reason. Returns { user, reason } where
 * reason is "valid", or one of the verifySessionDetailed statuses, or:
 * - "user-deleted": the token validates but its user no longer exists.
 * - "bad-signature": a validating token with no userId (untrustworthy).
 * Callers that need only the user keep using getSessionUser; callers
 * that distinguish "never signed in" from "session stopped validating"
 * (the dashboard's ?expired=1 redirect) read the reason instead of
 * re-inferring it from raw cookie presence.
 */
export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const result = verifySessionDetailed(token);
  if (result.status !== "valid") return { user: null, reason: result.status };
  if (!result.payload?.userId) return { user: null, reason: "bad-signature" };
  const user = await findUserById(result.payload.userId);
  if (!user) return { user: null, reason: "user-deleted" };
  return { user: publicUser(user), reason: "valid" };
}

export async function getSessionUser() {
  const { user } = await getSession();
  return user;
}
