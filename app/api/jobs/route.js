import { NextResponse } from "next/server";
import { createJob, isVerified, listJobs } from "../../../lib/store";
import { getSessionUser } from "../../../lib/auth";
import { rateLimit, tooManyRequests } from "../../../lib/ratelimit";
import { services } from "../../../lib/data";

const CATEGORIES = services.map((s) => s.title);
const TYPES = ["Full-time", "Contract", "Part-time"];

export async function GET() {
  const jobs = await listJobs();
  return NextResponse.json({ jobs });
}

export async function POST(request) {
  // Anti-spam brake on job posting (audit pass): 10 posts per IP per 2 min
  // is far above any real employer, far below a bot.
  const rl = await rateLimit(request, "post-job", 10);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in first.", code: "NOT_SIGNED_IN" }, { status: 401 });
  }
  if (user.role !== "employer") {
    return NextResponse.json(
      { error: "Only employers can post jobs.", code: "ROLE_FORBIDDEN" },
      { status: 403 }
    );
  }
  if (!isVerified(user)) {
    return NextResponse.json(
      { error: "Please verify your email address before posting a job. Enter the 6-digit code sent to your email on the verification page.", code: "EMAIL_UNVERIFIED" },
      { status: 403 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body.", code: "INVALID_BODY" }, { status: 400 });
  }

  const { title, category, location, type, description, requirements } = body || {};
  if (!title || !String(title).trim()) {
    return NextResponse.json({ error: "Please enter a job title.", code: "VALIDATION" }, { status: 400 });
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: "Please choose a valid job category.", code: "VALIDATION" },
      { status: 400 }
    );
  }
  if (!location || !String(location).trim()) {
    return NextResponse.json({ error: "Please enter the job location.", code: "VALIDATION" }, { status: 400 });
  }
  if (!TYPES.includes(type)) {
    return NextResponse.json(
      { error: "Please choose a valid job type.", code: "VALIDATION" },
      { status: 400 }
    );
  }
  if (!description || !String(description).trim()) {
    return NextResponse.json(
      { error: "Please describe the job.", code: "VALIDATION" },
      { status: 400 }
    );
  }

  const job = await createJob({
    employerId: user.id,
    title: String(title).trim(),
    category,
    location: String(location).trim(),
    type,
    description: String(description).trim(),
    requirements: requirements ? String(requirements).trim() : "",
  });

  return NextResponse.json(
    { job: { ...job, companyName: user.companyName } },
    { status: 201 }
  );
}
