// Shared job-field validation for posting and editing (job lifecycle
// step, 2026-11-16). One definition: POST /api/jobs and PATCH
// /api/jobs/[id] enforce exactly these rules, in this order, with
// these messages. Server-only: imports lib/data.
//
// This is the server-side shape check. The client-side field hints in
// app/components/JobFields.js (validateJobForm) mirror these rules for
// inline feedback; the server is the enforcement.

import { services } from "./data";

export const JOB_CATEGORIES = services.map((s) => s.title);
export const JOB_TYPES = ["Full-time", "Contract", "Part-time"];

/**
 * Validate a job payload. Returns { fields } with trimmed values on
 * success, or { error } carrying the human message for the first
 * failing check. Extra keys in the payload — including `status` — are
 * ignored here, and the transition allow-list in lib/transitions.js
 * ignores them again, so an edit can never smuggle a state change.
 */
export function validateJobFields(body) {
  const { title, category, location, type, description, requirements } =
    body || {};
  if (!title || !String(title).trim()) {
    return { error: "Please enter a job title." };
  }
  if (!JOB_CATEGORIES.includes(category)) {
    return { error: "Please choose a valid job category." };
  }
  if (!location || !String(location).trim()) {
    return { error: "Please enter the job location." };
  }
  if (!JOB_TYPES.includes(type)) {
    return { error: "Please choose a valid job type." };
  }
  if (!description || !String(description).trim()) {
    return { error: "Please describe the job." };
  }
  return {
    fields: {
      title: String(title).trim(),
      category,
      location: String(location).trim(),
      type,
      description: String(description).trim(),
      requirements: requirements ? String(requirements).trim() : "",
    },
  };
}
