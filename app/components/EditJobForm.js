"use client";

import { useState } from "react";
import Link from "next/link";
import { ERROR_CODES } from "../../lib/error-codes";
import JobFields, { validateJobForm } from "./JobFields";

// Edit form for one posted job, rendered inline in the employer's
// dashboard job card. Prefilled from the job; saving calls PATCH
// /api/jobs/[id]. Only open jobs can be edited — the Edit button that
// opens this form only renders for open jobs, and the API rejects
// edits to closed or deleted jobs. No draft persistence: the job
// already exists, so cancelling loses nothing but unsaved edits.
export default function EditJobForm({ job, onSaved, onCancel }) {
  const [form, setForm] = useState({
    title: job.title || "",
    category: job.category || "",
    location: job.location || "",
    type: job.type || "Full-time",
    description: job.description || "",
    requirements: job.requirements || "",
  });
  const [error, setError] = useState("");
  const [errorKind, setErrorKind] = useState(""); // "" | "expired"
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setFieldErrors((errs) => ({ ...errs, [field]: undefined }));
    };
  }

  function validate() {
    const errs = validateJobForm(form);
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setErrorKind("");
    if (!validate()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setErrorKind("expired");
          throw new Error(
            "Your session expired before these changes were saved. Log in again, come back here, and edit the job once more."
          );
        }
        // Classify by the API's stable error code (shared vocabulary in
        // lib/error-codes); fall back to the old message match only when
        // a response carries no code (e.g. a stale deployment still
        // serving pre-code responses). A wrong-state rejection means
        // the job stopped being open (e.g. closed in another tab) —
        // the message says so, and cancelling refreshes the card.
        if (
          res.status === 409 &&
          (data.code === ERROR_CODES.JOB_WRONG_STATE ||
            (!data.code && /open/i.test(data.error || "")))
        ) {
          throw new Error(data.error || "Only open jobs can be edited.");
        }
        throw new Error(data.error || "Could not save these changes.");
      }
      onSaved();
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "We could not reach PeopTrust — check your internet connection and try again."
          : err.message
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <JobFields
        form={form}
        fieldErrors={fieldErrors}
        update={update}
        idPrefix={`edit-${job.id}-`}
      />
      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
          {errorKind === "expired" && (
            <p className="success-actions">
              <Link href="/login?expired=1&next=/dashboard">Log in again to continue</Link>
            </p>
          )}
        </div>
      )}
      <div className="job-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </form>
  );
}
