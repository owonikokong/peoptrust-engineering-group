import { NextResponse } from "next/server";
import { listJobs } from "../../../lib/store";
import { getSessionUser } from "../../../lib/auth";
import { rateLimit, tooManyRequests } from "../../../lib/ratelimit";
import { services } from "../../../lib/data";
import { canPost } from "../../../lib/states";
import { postJob } from "../../../lib/transitions";
import { ERROR_CODES } from "../../../lib/error-codes";

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
    return NextResponse.json({ error: "Please log in first.", code: ERROR_CODES.NOT_SIGNED_IN }, { status: 401 });
  }
  if (user.role !== "employer") {
    return NextResponse.json(
      { error: "Only employers can post jobs.", code: ERROR_CODES.ROLE_FORBIDDEN },
      { status: 403 }
    );
  }
  // Guard (lib/states): the role check above already passed, so this is
  // exactly the verified check it replaces — same message, same status.
  if (!canPost(user)) {
    return NextResponse.json(
      { error: "Please verify your email address before posting a job. Enter the 6-digit code sent to your email on the verification page.", code: ERROR_CODES.EMAIL_UNVERIFIED },
      { status: 403 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body.", code: ERROR_CODES.INVALID_BODY }, { status: 400 });
  }

  const { title, category, location, type, description, requirements } = body || {};
  if (!title || !String(title).trim()) {
    return NextResponse.json({ error: "Please enter a job title.", code: ERROR_CODES.VALIDATION }, { status: 400 });
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: "Please choose a valid job category.", code: ERROR_CODES.VALIDATION },
      { status: 400 }
    );
  }
  if (!location || !String(location).trim()) {
    return NextResponse.json({ error: "Please enter the job location.", code: ERROR_CODES.VALIDATION }, { status: 400 });
  }
  if (!TYPES.includes(type)) {
    return NextResponse.json(
      { error: "Please choose a valid job type.", code: ERROR_CODES.VALIDATION },
      { status: 400 }
    );
  }
  if (!description || !String(description).trim()) {
    return NextResponse.json(
      { error: "Please describe the job.", code: ERROR_CODES.VALIDATION },
      { status: 400 }
    );
  }

  const { job } = await postJob({
    user,
    fields: {
      title: String(title).trim(),
      category,
      location: String(location).trim(),
      type,
      description: String(description).trim(),
      requirements: requirements ? String(requirements).trim() : "",
    },
  });

  return NextResponse.json(
    { job: { ...job, companyName: user.companyName } },
    { status: 201 }
  );
}
