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
    actual.length === expectedBuf.length &&
    timingSafeEqual(actual, expectedBuf)
  );
}

// ---- Signed session tokens (HMAC-SHA256) ----

function hmac(data) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function signSession(payload) {
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + SESSION_TTL_MS })
  ).toString("base64url");
  return `${body}.${hmac(body)}`;
}

export function verifySession(token) {
  if (!token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  const expected = hmac(body);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// ---- Cookie helpers (route handlers / server actions) ----

export async function setSessionCookie(user) {
  const token = signSession({ userId: user.id, role: user.role });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
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

export async function getSessionUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const payload = verifySession(token);
  if (!payload?.userId) return null;
  const user = await findUserById(payload.userId);
  return publicUser(user);
}
