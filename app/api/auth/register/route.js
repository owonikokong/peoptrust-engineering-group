import { NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "../../../../lib/ratelimit";
import { createUser, findUserByEmail, publicUser } from "../../../../lib/store";
import { hashPassword, setSessionCookie } from "../../../../lib/auth";
import { issueVerificationCode } from "../../../../lib/transitions";
import { sendVerificationEmail } from "../../../../lib/mail";
import { ERROR_CODES } from "../../../../lib/error-codes";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bad(message) {
  return NextResponse.json(
    { error: message, code: ERROR_CODES.VALIDATION },
    { status: 400 },
  );
}

function required(body, field, label) {
  const value = body?.[field];
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }
  return String(value).trim();
}

export async function POST(request) {
  const rl = await rateLimit(request, "register");
  if (!rl.ok) return tooManyRequests(rl.retryAfter);
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body.", code: ERROR_CODES.INVALID_BODY },
      { status: 400 },
    );
  }

  const { role, name, email, password } = body || {};

  if (role !== "professional" && role !== "employer") {
    return bad("Please choose whether you are a professional or an employer.");
  }
  if (!email || !EMAIL_RE.test(String(email))) {
    return bad("Please enter a valid email address.");
  }
  if (!password || String(password).length < 8) {
    return bad("Password must be at least 8 characters long.");
  }
  if (!name || !String(name).trim()) {
    return bad("Please enter your full name.");
  }

  const phone = required(body, "phone", "Phone number");
  if (!phone) return bad("Please enter your phone number.");
  const location = required(body, "location", "Location");
  if (!location) return bad("Please enter your location.");

  const base = {
    role,
    name: String(name).trim(),
    email: String(email).toLowerCase(),
    passwordHash: hashPassword(password),
    phone,
    location,
  };

  let fields;
  if (role === "professional") {
    const trade = required(body, "trade");
    if (!trade) return bad("Please choose your trade or skill area.");
    if (
      body.experience === undefined ||
      body.experience === null ||
      body.experience === "" ||
      Number.isNaN(Number(body.experience))
    ) {
      return bad("Please enter your years of experience.");
    }
    const skills = required(body, "skills");
    if (!skills)
      return bad(
        "Please list your key skills (e.g. TIG welding, rigging, panel wiring).",
      );
    const availability = required(body, "availability");
    if (!availability) return bad("Please choose your availability.");
    const summary = required(body, "summary");
    if (!summary) return bad("Please write a short professional summary.");
    if (summary.length > 600)
      return bad("Please keep your summary under 600 characters.");
    // Optional employer-facing dossier fields — shown to employers on the
    // professional's page only where provided.
    const previousExperience = body.previousExperience
      ? String(body.previousExperience).trim()
      : "";
    if (previousExperience.length > 2000)
      return bad(
        "Please keep your previous experience under 2,000 characters.",
      );
    const certifications = body.certifications
      ? String(body.certifications).trim()
      : "";
    if (certifications.length > 1000)
      return bad("Please keep your certifications under 1,000 characters.");
    const cvUrl = body.cvUrl ? String(body.cvUrl).trim() : "";
    if (cvUrl && !/^https?:\/\/[^\s]+$/i.test(cvUrl))
      return bad("Please enter a valid CV link starting with https://");
    if (cvUrl.length > 500)
      return bad("Please keep your CV link under 500 characters.");
    fields = {
      ...base,
      trade,
      skills,
      availability,
      summary,
      previousExperience,
      certifications,
      cvUrl,
      experience: Number(body.experience),
    };
  } else {
    const companyName = required(body, "companyName");
    if (!companyName) return bad("Please enter your company name.");
    const industry = required(body, "industry");
    if (!industry) return bad("Please choose your industry.");
    const companySize = required(body, "companySize");
    if (!companySize) return bad("Please choose your company size.");
    const description = required(body, "description");
    if (!description) return bad("Please write a short company description.");
    if (description.length > 600)
      return bad("Please keep the company description under 600 characters.");
    fields = {
      ...base,
      companyName,
      industry,
      companySize,
      website: body.website ? String(body.website).trim() : "",
      description,
    };
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      {
        error: "An account with this email already exists. Please log in.",
        code: ERROR_CODES.EMAIL_TAKEN,
      },
      { status: 409 },
    );
  }

  const user = await createUser({ ...fields, emailVerified: false });

  // Issue the per-user confirmation code and email it.
  const { code } = await issueVerificationCode(user);
  const mail = await sendVerificationEmail({
    email: user.email,
    name: user.name,
    code,
  });

  await setSessionCookie(user);
  return NextResponse.json(
    {
      user: publicUser({ ...user, emailVerified: false }),
      needsVerification: true,
      mailSent: mail.sent,
    },
    { status: 201 },
  );
}
