import { NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "../../../../lib/ratelimit";
import { findUserByEmail, publicUser } from "../../../../lib/store";
import { setSessionCookie, verifyPassword } from "../../../../lib/auth";

export async function POST(request) {
  const rl = await rateLimit(request, "login");
  if (!rl.ok) return tooManyRequests(rl.retryAfter);
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body.", code: "INVALID_BODY" }, { status: 400 });
  }

  const { email, password } = body || {};
  if (!email || !password) {
    return NextResponse.json(
      { error: "Please enter your email and password.", code: "VALIDATION" },
      { status: 400 }
    );
  }

  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      { error: "Incorrect email or password.", code: "BAD_CREDENTIALS" },
      { status: 401 }
    );
  }

  await setSessionCookie(user);
  const safe = publicUser(user);
  return NextResponse.json({ user: safe, role: safe.role });
}
