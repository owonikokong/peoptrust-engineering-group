import { NextResponse } from "next/server";
import { createApplication, findApplication, getJob, isVerified } from "../../../../../lib/store";
import { getSessionUser } from "../../../../../lib/auth";
import { rateLimit, tooManyRequests } from "../../../../../lib/ratelimit";

export async function POST(request, { params }) {
  // Anti-spam brake on applications (audit pass): 20 per IP per 2 min.
  const rl = await rateLimit(request, "apply", 20);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }
  if (user.role !== "professional") {
    return NextResponse.json(
      { error: "Only skilled professionals can apply for jobs." },
      { status: 403 }
    );
  }
  if (!isVerified(user)) {
    return NextResponse.json(
      { error: "Please verify your email address before applying. Enter the 6-digit code sent to your email on the verification page." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const job = await getJob(id);
  if (!job) {
    return NextResponse.json({ error: "This job no longer exists." }, { status: 404 });
  }

  const existing = await findApplication(user.id, job.id);
  if (existing) {
    return NextResponse.json(
      { error: "You have already applied for this job." },
      { status: 409 }
    );
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const application = await createApplication({
    jobId: job.id,
    userId: user.id,
    employerId: job.employerId,
    coverNote: body.coverNote ? String(body.coverNote).trim() : "",
  });

  return NextResponse.json({ application }, { status: 201 });
}
