// Shared preamble for the job lifecycle write endpoints (PATCH/DELETE
// /api/jobs/[id], POST /api/jobs/[id]/close, POST /api/jobs/[id]/reopen).
// One definition: same rate-limit scope as posting, same 401/404
// responses as the other jobs routes. Ownership and state checks stay
// in the transitions (lib/transitions.js) — this helper only loads
// the session and the job.

import { NextResponse } from "next/server";
import { getJob } from "./store";
import { getSessionUser } from "./auth";
import { rateLimit, tooManyRequests } from "./ratelimit";
import { ERROR_CODES } from "./error-codes";

/**
 * Rate-limit, resolve the session user, and load the job named by the
 * route params. Returns { user, job } on success, or { response } with
 * the error response the route should return as-is.
 */
export async function loadJobForWrite(request, params) {
  // Same anti-spam brake as job posting: 10 writes per IP per 2 min.
  const rl = await rateLimit(request, "post-job", 10);
  if (!rl.ok) return { response: tooManyRequests(rl.retryAfter) };
  const user = await getSessionUser();
  if (!user) {
    return {
      response: NextResponse.json(
        { error: "Please log in first.", code: ERROR_CODES.NOT_SIGNED_IN },
        { status: 401 }
      ),
    };
  }
  const { id } = await params;
  const job = await getJob(id);
  if (!job) {
    return {
      response: NextResponse.json(
        { error: "This job no longer exists.", code: ERROR_CODES.JOB_NOT_FOUND },
        { status: 404 }
      ),
    };
  }
  return { user, job };
}
