import { NextResponse } from "next/server";
import { getSessionUser } from "../../../lib/auth";
import { findUserById, publicUser, updateUserFields } from "../../../lib/store";
import { rateLimit, tooManyRequests } from "../../../lib/ratelimit";

function bad(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function required(body, field) {
  const value = body?.[field];
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }
  return String(value).trim();
}

/**
 * Update the signed-in user's own profile. Only the fields collected at
 * registration are editable, and only for the caller's own account; the
 * email (their login and verification identity) and role never change here.
 * Validation mirrors /api/auth/register.
 */
export async function PATCH(request) {
  // Anti-spam brake on profile writes (audit pass): 20 per IP per 2 min.
  const rl = await rateLimit(request, "account", 20);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = required(body, "name");
  if (!name) return bad("Please enter your full name.");
  const phone = required(body, "phone");
  if (!phone) return bad("Please enter your phone number.");
  const location = required(body, "location");
  if (!location) return bad("Please enter your location.");

  const fields = { name, phone, location };

  if (sessionUser.role === "professional") {
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
    if (!skills) return bad("Please list your key skills (e.g. TIG welding, rigging, panel wiring).");
    const availability = required(body, "availability");
    if (!availability) return bad("Please choose your availability.");
    const summary = required(body, "summary");
    if (!summary) return bad("Please write a short professional summary.");
    if (summary.length > 600) return bad("Please keep your summary under 600 characters.");
    // Optional employer-facing dossier fields (visible to employers on the
    // professional's page, only where provided). Empty clears them.
    const previousExperience = body.previousExperience ? String(body.previousExperience).trim() : "";
    if (previousExperience.length > 2000) return bad("Please keep your previous experience under 2,000 characters.");
    const certifications = body.certifications ? String(body.certifications).trim() : "";
    if (certifications.length > 1000) return bad("Please keep your certifications under 1,000 characters.");
    const cvUrl = body.cvUrl ? String(body.cvUrl).trim() : "";
    if (cvUrl && !/^https?:\/\/[^\s]+$/i.test(cvUrl)) return bad("Please enter a valid CV link starting with https://");
    if (cvUrl.length > 500) return bad("Please keep your CV link under 500 characters.");
    Object.assign(fields, {
      trade,
      skills,
      availability,
      summary,
      previousExperience,
      certifications,
      cvUrl,
      experience: Number(body.experience),
    });
  } else {
    const companyName = required(body, "companyName");
    if (!companyName) return bad("Please enter your company name.");
    const industry = required(body, "industry");
    if (!industry) return bad("Please choose your industry.");
    const companySize = required(body, "companySize");
    if (!companySize) return bad("Please choose your company size.");
    const description = required(body, "description");
    if (!description) return bad("Please write a short company description.");
    if (description.length > 600) return bad("Please keep the company description under 600 characters.");
    Object.assign(fields, {
      companyName,
      industry,
      companySize,
      website: body.website ? String(body.website).trim() : "",
      description,
    });
  }

  await updateUserFields(sessionUser.id, fields);
  const updated = await findUserById(sessionUser.id);
  return NextResponse.json({ user: publicUser(updated) });
}
