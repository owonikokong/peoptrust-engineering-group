import { NextResponse } from "next/server";
import { getJob } from "../../../../../lib/store";
import { getSessionUser } from "../../../../../lib/auth";
import { rateLimit, tooManyRequests } from "../../../../../lib/ratelimit";
import { canApply } from "../../../../../lib/states";
import { submitApplication } from "../../../../../lib/transitions";
import { ERROR_CODES } from "../../../../../lib/error-codes";

export async function POST(request, { params }) {
  // Anti-spam brake on applications (audit pass): 20 per IP per 2 min.
  const rl = await rateLimit(request, "apply", 20);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in first.", code: ERROR_CODES.NOT_SIGNED_IN }, { status: 401 });
  }
  if (user.role !== "professional") {
    return NextResponse.json(
      { error: "Only skilled professionals can apply for jobs.", code: ERROR_CODES.ROLE_FORBIDDEN },
      { status: 403 }
    );
  }
  // Guard (lib/states): the role check above already passed, so this is
  // exactly the verified check it replaces — same message, same status.
  if (!canApply(user)) {
    return NextResponse.json(
      { error: "Please verify your email address before applying. Enter the 6-digit code sent to your email on the verification page.", code: ERROR_CODES.EMAIL_UNVERIFIED },
      { status: 403 }
    );
  }

  const { id } = await params;
  const job = await getJob(id);
  if (!job) {
    return NextResponse.json({ error: "This job no longer exists.", code: ERROR_CODES.JOB_NOT_FOUND }, { status: 404 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // The submission transition owns the duplicate check and the write.
  const result = await submitApplication({
    user,
    job,
    coverNote: body.coverNote ? String(body.coverNote).trim() : "",
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: "You have already applied for this job.", code: ERROR_CODES.ALREADY_APPLIED },
      { status: 409 }
    );
  }

  return NextResponse.json({ application: result.application }, { status: 201 });
}
