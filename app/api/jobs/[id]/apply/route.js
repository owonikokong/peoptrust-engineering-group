import { NextResponse } from "next/server";
import { createApplication, findApplication, getJob } from "../../../../../lib/store";
import { getSessionUser } from "../../../../../lib/auth";

export async function POST(request, { params }) {
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
