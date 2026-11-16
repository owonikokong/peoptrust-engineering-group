import { NextResponse } from "next/server";
import { loadJobForWrite } from "../../../../../lib/job-routes";
import { reopenJob } from "../../../../../lib/transitions";
import { ERROR_CODES } from "../../../../../lib/error-codes";

// Reopen a job: closed → open. The job returns to the public Jobs page
// and accepts applications again.
export async function POST(request, { params }) {
  const loaded = await loadJobForWrite(request, params);
  if (loaded.response) return loaded.response;
  const { user, job } = loaded;

  const result = await reopenJob({ user, job });
  if (!result.ok) {
    if (result.reason === "not-owner") {
      return NextResponse.json(
        { error: "Only the employer who posted this job can change it.", code: ERROR_CODES.NOT_JOB_OWNER },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: "Only closed jobs can be reopened.", code: ERROR_CODES.JOB_WRONG_STATE },
      { status: 409 }
    );
  }
  return NextResponse.json({ job: result.job });
}
