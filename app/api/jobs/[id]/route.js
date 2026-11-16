import { NextResponse } from "next/server";
import { loadJobForWrite } from "../../../../lib/job-routes";
import { validateJobFields } from "../../../../lib/job-fields";
import { deleteJob, updateJob } from "../../../../lib/transitions";
import { ERROR_CODES } from "../../../../lib/error-codes";

// Edit a job: owner-only, open-only. Field validation is the same
// definition as posting (lib/job-fields); the transition's allow-list
// is the enforcement, so a `status` key in the input is ignored and
// an edit can never change the job's state.
export async function PATCH(request, { params }) {
  const loaded = await loadJobForWrite(request, params);
  if (loaded.response) return loaded.response;
  const { user, job } = loaded;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body.", code: ERROR_CODES.INVALID_BODY },
      { status: 400 },
    );
  }
  const { error, fields } = validateJobFields(body);
  if (error) {
    return NextResponse.json(
      { error, code: ERROR_CODES.VALIDATION },
      { status: 400 },
    );
  }

  const result = await updateJob({ user, job, fields });
  if (!result.ok) {
    if (result.reason === "not-owner") {
      return NextResponse.json(
        {
          error: "Only the employer who posted this job can change it.",
          code: ERROR_CODES.NOT_JOB_OWNER,
        },
        { status: 403 },
      );
    }
    return NextResponse.json(
      {
        error: "Only open jobs can be edited.",
        code: ERROR_CODES.JOB_WRONG_STATE,
      },
      { status: 409 },
    );
  }
  return NextResponse.json({ job: result.job });
}

// Soft-delete a job: open or closed → deleted. The row stays, so the
// employer's applications for the job stay readable; only the status
// changes. Deleted jobs do not exist publicly.
export async function DELETE(request, { params }) {
  const loaded = await loadJobForWrite(request, params);
  if (loaded.response) return loaded.response;
  const { user, job } = loaded;

  const result = await deleteJob({ user, job });
  if (!result.ok) {
    if (result.reason === "not-owner") {
      return NextResponse.json(
        {
          error: "Only the employer who posted this job can change it.",
          code: ERROR_CODES.NOT_JOB_OWNER,
        },
        { status: 403 },
      );
    }
    return NextResponse.json(
      {
        error: "This job has already been deleted.",
        code: ERROR_CODES.JOB_WRONG_STATE,
      },
      { status: 409 },
    );
  }
  return NextResponse.json({ job: result.job });
}
