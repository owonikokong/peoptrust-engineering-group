import { NextResponse } from "next/server";
import { createUser, findUserByEmail, publicUser } from "../../../../lib/store";
import { hashPassword, setSessionCookie } from "../../../../lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { role, name, email, password } = body || {};

  if (role !== "professional" && role !== "employer") {
    return NextResponse.json(
      { error: "Please choose whether you are a professional or an employer." },
      { status: 400 }
    );
  }
  if (!email || !EMAIL_RE.test(String(email))) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (!password || String(password).length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters long." },
      { status: 400 }
    );
  }
  if (!name || !String(name).trim()) {
    return NextResponse.json(
      { error: "Please enter your full name." },
      { status: 400 }
    );
  }
  if (role === "employer" && (!body.companyName || !String(body.companyName).trim())) {
    return NextResponse.json(
      { error: "Please enter your company name." },
      { status: 400 }
    );
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists. Please log in." },
      { status: 409 }
    );
  }

  const base = {
    role,
    name: String(name).trim(),
    email: String(email).toLowerCase(),
    passwordHash: hashPassword(password),
    phone: body.phone ? String(body.phone).trim() : "",
    location: body.location ? String(body.location).trim() : "",
  };

  const user =
    role === "professional"
      ? await createUser({
          ...base,
          trade: body.trade ? String(body.trade).trim() : "",
          skills: body.skills ? String(body.skills).trim() : "",
          experience:
            body.experience === undefined || body.experience === ""
              ? null
              : Number(body.experience),
        })
      : await createUser({
          ...base,
          companyName: String(body.companyName).trim(),
          industry: body.industry ? String(body.industry).trim() : "",
        });

  await setSessionCookie(user);
  return NextResponse.json({ user: publicUser(user) }, { status: 201 });
}
