import { NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "../../../../lib/ratelimit";
import { getSessionUser } from "../../../../lib/auth";
import {
  findUserById,
  isVerified,
  publicUser,
  updateUserFields,
} from "../../../../lib/store";
import { codeMatches } from "../../../../lib/verify";
import { accountState } from "../../../../lib/states";

export async function POST(request) {
  const rl = await rateLimit(request, "verify");
  if (!rl.ok) return tooManyRequests(rl.retryAfter);
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json(
      { error: "Please log in first.", code: "NOT_SIGNED_IN" },
      { status: 401 }
    );
  }
  const user = await findUserById(sessionUser.id);
  if (!user) {
    return NextResponse.json(
      { error: "Account not found.", code: "ACCOUNT_NOT_FOUND" },
      { status: 404 }
    );
  }
  if (isVerified(user)) {
    return NextResponse.json({ user: publicUser(user), verified: true });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body.", code: "INVALID_BODY" },
      { status: 400 }
    );
  }
  const code = String(body?.code || "").trim();
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "Please enter the 6-digit code from your email.", code: "VALIDATION" },
      { status: 400 }
    );
  }

  // One derivation of the account's verification state (lib/states):
  // same checks, same order, same messages as the inline version.
  const state = accountState(user);
  if (state === "no-code") {
    return NextResponse.json(
      { error: "No active code for this account. Please request a new code.", code: "NO_ACTIVE_CODE" },
      { status: 400 }
    );
  }
  if (state === "expired") {
    return NextResponse.json(
      { error: "This code has expired. Please request a new code.", code: "CODE_EXPIRED" },
      { status: 400 }
    );
  }
  if (state === "exhausted") {
    return NextResponse.json(
      { error: "Too many incorrect attempts. Please request a new code.", code: "CODE_EXHAUSTED" },
      { status: 429 }
    );
  }

  if (!codeMatches(user.id, code, user.verifyCodeHash)) {
    await updateUserFields(user.id, {
      verifyAttempts: (user.verifyAttempts || 0) + 1,
    });
    return NextResponse.json(
      { error: "That code is not correct. Please check your email and try again.", code: "CODE_MISMATCH" },
      { status: 400 }
    );
  }

  await updateUserFields(user.id, {
    emailVerified: true,
    verifyCodeHash: null,
    verifyExpiresAt: null,
    verifyAttempts: 0,
  });
  const updated = await findUserById(user.id);
  return NextResponse.json({ user: publicUser(updated), verified: true });
}
