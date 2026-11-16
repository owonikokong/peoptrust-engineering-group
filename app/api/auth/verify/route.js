import { NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "../../../../lib/ratelimit";
import { getSessionUser } from "../../../../lib/auth";
import { findUserById, isVerified, publicUser } from "../../../../lib/store";
import { consumeVerificationCode } from "../../../../lib/transitions";
import { ERROR_CODES } from "../../../../lib/error-codes";

export async function POST(request) {
  const rl = await rateLimit(request, "verify");
  if (!rl.ok) return tooManyRequests(rl.retryAfter);
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json(
      { error: "Please log in first.", code: ERROR_CODES.NOT_SIGNED_IN },
      { status: 401 }
    );
  }
  const user = await findUserById(sessionUser.id);
  if (!user) {
    return NextResponse.json(
      { error: "Account not found.", code: ERROR_CODES.ACCOUNT_NOT_FOUND },
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
      { error: "Invalid request body.", code: ERROR_CODES.INVALID_BODY },
      { status: 400 }
    );
  }
  const code = String(body?.code || "").trim();
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "Please enter the 6-digit code from your email.", code: ERROR_CODES.VALIDATION },
      { status: 400 }
    );
  }

  // The pending → verified transition owns the state derivation, the
  // code check, and the writes; this route maps its typed result to the
  // same responses as before.
  const result = await consumeVerificationCode(user, code);
  if (!result.ok) {
    if (result.reason === "no-code") {
      return NextResponse.json(
        { error: "No active code for this account. Please request a new code.", code: ERROR_CODES.NO_ACTIVE_CODE },
        { status: 400 }
      );
    }
    if (result.reason === "expired") {
      return NextResponse.json(
        { error: "This code has expired. Please request a new code.", code: ERROR_CODES.CODE_EXPIRED },
        { status: 400 }
      );
    }
    if (result.reason === "exhausted") {
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please request a new code.", code: ERROR_CODES.CODE_EXHAUSTED },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "That code is not correct. Please check your email and try again.", code: ERROR_CODES.CODE_MISMATCH },
      { status: 400 }
    );
  }

  return NextResponse.json({ user: result.user, verified: true });
}
