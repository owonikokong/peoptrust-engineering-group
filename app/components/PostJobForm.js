"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { services } from "../../lib/data";
import { ERROR_CODES } from "../../lib/error-codes";
import JobFields, { validateJobForm } from "./JobFields";

const EMPTY_FORM = {
  title: "",
  category: services[0].title,
  location: "",
  type: "Full-time",
  description: "",
  requirements: "",
};
const DRAFT_KEY = "pt-draft-postjob";

export default function PostJobForm() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [errorKind, setErrorKind] = useState(""); // "" | "expired" | "verify"
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  // State 8 — restore an unsent job draft kept in this tab (e.g. after a
  // session expiry sent the employer to log in and back).
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(DRAFT_KEY);
      if (saved) setForm({ ...EMPTY_FORM, ...JSON.parse(saved) });
    } catch {}
  }, []);

  function persist(next) {
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    } catch {}
  }

  function update(field) {
    return (e) => {
      setForm((f) => {
        const next = { ...f, [field]: e.target.value };
        persist(next);
        return next;
      });
      setFieldErrors((errs) => ({ ...errs, [field]: undefined }));
    };
  }

  // State 9 — inline validation: the message sits next to the field and
  // says how to fix it, not just that something is wrong somewhere.
  // Rules shared with the edit form (JobFields).
  function validate() {
    const errs = validateJobForm(form);
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setErrorKind("");
    setSuccess("");
    if (!validate()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setErrorKind("expired");
          throw new Error(
            "Your session expired before this was posted. Your draft is saved in this tab — log in again, come back here, and press Post job."
          );
        }
        // Classify by the API's stable error code (shared vocabulary in
        // lib/error-codes); fall back to the old message match only when
        // a response carries no code (e.g. a stale deployment still
        // serving pre-code responses).
        if (
          res.status === 403 &&
          (data.code === ERROR_CODES.EMAIL_UNVERIFIED ||
            (!data.code && /verify/i.test(data.error || "")))
        ) {
          setErrorKind("verify");
          throw new Error(data.error);
        }
        throw new Error(data.error || "Could not post the job.");
      }
      try {
        window.sessionStorage.removeItem(DRAFT_KEY);
      } catch {}
      setForm(EMPTY_FORM);
      // State 10 — success says what happened and where to see it.
      setSuccess("posted");
      router.refresh();
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "We could not reach PeopTrust — check your internet connection and try again. Your draft is saved in this tab."
          : err.message
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <JobFields form={form} fieldErrors={fieldErrors} update={update} />
      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
          {errorKind === "expired" && (
            <p className="success-actions">
              <Link href="/login?expired=1&next=/dashboard">Log in again to continue</Link>
            </p>
          )}
          {errorKind === "verify" && (
            <p className="success-actions">
              <Link href="/verify">Verify your email now</Link> — it takes less
              than a minute with the code in your inbox.
            </p>
          )}
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <p>Job posted. It is now listed on the Jobs page for every professional to see.</p>
          <p className="success-actions">
            <Link href="/jobs">View it on the Jobs page</Link>
          </p>
        </div>
      )}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Posting…" : "Post job"}
      </button>
    </form>
  );
}
