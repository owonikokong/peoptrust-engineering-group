import { NextResponse } from "next/server";
import { findUserByEmail, publicUser } from "../../../../lib/store";
import { setSessionCookie, verifyPassword } from "../../../../lib/auth";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, password } = body || {};
  if (!email || !password) {
    return NextResponse.json(
      { error: "Please enter your email and password." },
      { status: 400 }
    );
  }

  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 }
    );
  }

  await setSessionCookie(user);
  const safe = publicUser(user);
  return NextResponse.json({ user: safe, role: safe.role });
}
