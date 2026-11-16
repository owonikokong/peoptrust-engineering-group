// Per-IP rate limiting for the auth endpoints: at most LIMIT requests
// per WINDOW_MS from one IP address, per endpoint scope.
//
// Counters live in the Supabase `rate_events` table (one row per hit),
// because serverless instances don't share memory — an in-memory map
// never trips when requests spread across instances. When Supabase is
// not configured (local dev), it falls back to a per-process map.
import { NextResponse } from "next/server";

export const RATE_LIMIT = 5;
export const RATE_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbEnabled = Boolean(SUPABASE_URL && SERVICE_KEY);

export function clientIp(request) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

// ---- fallback: in-memory (local dev only) ----
const memHits = new Map();
function memLimit(key, limit, windowMs) {
  const now = Date.now();
  const recent = (memHits.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    memHits.set(key, recent);
    return { ok: false, retryAfter: Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 1000)) };
  }
  recent.push(now);
  memHits.set(key, recent);
  return { ok: true };
}

// ---- Supabase-backed counting ----
async function sb(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
  return res;
}

async function dbLimit(key, limit, windowMs) {
  const now = Date.now();
  const sinceIso = new Date(now - windowMs).toISOString();
  // Record this hit first, then count the window (insert-then-count is
  // race-safe enough for a brake: totals can only overshoot by the
  // number of truly simultaneous requests).
  await sb("rate_events", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ key }),
  });
  const enc = encodeURIComponent;
  const countRes = await sb(
    `rate_events?key=eq.${enc(key)}&created_at=gt.${enc(sinceIso)}&select=id&order=created_at.asc&limit=1`,
    { headers: { Prefer: "count=exact" } }
  );
  const range = countRes.headers.get("content-range") || "";
  const total = Number(range.split("/")[1]);
  if (Number.isFinite(total) && total > limit) {
    return { ok: false, retryAfter: Math.ceil(windowMs / 1000) };
  }
  // Opportunistic cleanup of expired rows (about 1 request in 25).
  if (Math.random() < 0.04) {
    const cutoff = new Date(now - windowMs).toISOString();
    await sb(`rate_events?created_at=lt.${enc(cutoff)}`, { method: "DELETE" }).catch(() => {});
  }
  return { ok: true };
}

/** Returns { ok: true } or { ok: false, retryAfter } (seconds). */
export async function rateLimit(request, scope, limit = RATE_LIMIT, windowMs = RATE_WINDOW_MS) {
  const key = `${scope}:${clientIp(request)}`;
  try {
    if (dbEnabled) return await dbLimit(key, limit, windowMs);
  } catch {
    // If the counter store hiccups, fall through to the local map
    // rather than locking everyone out.
  }
  return memLimit(key, limit, windowMs);
}

/** Standard 429 response for a blocked request. */
export function tooManyRequests(retryAfter) {
  return NextResponse.json(
    { error: `Too many requests. Please wait ${retryAfter} seconds and try again.`, code: "RATE_LIMITED" },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
