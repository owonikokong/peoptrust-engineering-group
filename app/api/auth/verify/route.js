import { NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "../../../../lib/ratelimit";
import { getSessionUser } from "../../../../lib/auth";
import {
  findUserById,
  isVerified,
  publicUser,
  updateUserFields,
} from "../../../../lib/store";
import { codeMatches, MAX_CODE_ATTEMPTS } from "../../../../lib/verify";

export async function POST(request) {
  const rl = await rateLimit(request, "verify");
  if (!rl.ok) return tooManyRequests(rl.retryAfter);
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }
  const user = await findUserById(sessionUser.id);
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }
  if (isVerified(user)) {
    return NextResponse.json({ user: publicUser(user), verified: true });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const code = String(body?.code || "").trim();
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "Please enter the 6-digit code from your email." },
      { status: 400 }
    );
  }

  if (!user.verifyCodeHash || !user.verifyExpiresAt) {
    return NextResponse.json(
      { error: "No active code for this account. Please request a new code." },
      { status: 400 }
    );
  }
  if (new Date(user.verifyExpiresAt).getTime() < Date.now()) {
    return NextResponse.json(
      { error: "This code has expired. Please request a new code." },
      { status: 400 }
    );
  }
  if ((user.verifyAttempts || 0) >= MAX_CODE_ATTEMPTS) {
    return NextResponse.json(
      { error: "Too many incorrect attempts. Please request a new code." },
      { status: 429 }
    );
  }

  if (!codeMatches(user.id, code, user.verifyCodeHash)) {
    await updateUserFields(user.id, {
      verifyAttempts: (user.verifyAttempts || 0) + 1,
    });
    return NextResponse.json(
      { error: "That code is not correct. Please check your email and try again." },
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
