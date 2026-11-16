import { NextResponse } from "next/server";
import { loadJobForWrite } from "../../../../../lib/job-routes";
import { closeJob } from "../../../../../lib/transitions";
import { ERROR_CODES } from "../../../../../lib/error-codes";

// Close a job: open → closed. The job leaves the public Jobs page and
// stops accepting applications; its applications stay visible to the
// employer in their dashboard.
export async function POST(request, { params }) {
  const loaded = await loadJobForWrite(request, params);
  if (loaded.response) return loaded.response;
  const { user, job } = loaded;

  const result = await closeJob({ user, job });
  if (!result.ok) {
    if (result.reason === "not-owner") {
      return NextResponse.json(
        { error: "Only the employer who posted this job can change it.", code: ERROR_CODES.NOT_JOB_OWNER },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: "Only open jobs can be closed.", code: ERROR_CODES.JOB_WRONG_STATE },
      { status: 409 }
    );
  }
  return NextResponse.json({ job: result.job });
}
