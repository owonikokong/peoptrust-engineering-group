"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ERROR_CODES } from "../../lib/error-codes";

export default function ApplyForm({ jobId }) {
  const router = useRouter();
  const [coverNote, setCoverNote] = useState("");
  const [error, setError] = useState("");
  const [errorKind, setErrorKind] = useState(""); // "" | "expired" | "verify"
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const draftKey = `pt-draft-apply-${jobId}`;

  // State 8 — session expired must not cost the user their writing:
  // the cover note is kept in this tab and restored when they return.
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(draftKey);
      if (saved) setCoverNote(saved);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateNote(value) {
    setCoverNote(value);
    try {
      window.sessionStorage.setItem(draftKey, value);
    } catch {}
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setErrorKind("");
    setBusy(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverNote }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setErrorKind("expired");
          throw new Error(
            "Your session expired before this was sent. Your cover note is saved in this tab — log in again, come back here, and press Apply."
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
        throw new Error(data.error || "Could not submit your application.");
      }
      try {
        window.sessionStorage.removeItem(draftKey);
      } catch {}
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "We could not reach PeopTrust — check your internet connection and try again. Your cover note is saved in this tab."
          : err.message
      );
    } finally {
      setBusy(false);
    }
  }

  // State 10 — success confirms what happened AND what to do next.
  if (done) {
    return (
      <div className="alert alert-success">
        <p>
          Application submitted. The employer can now see it in their
          dashboard, and we will show any update on yours.
        </p>
        <p className="success-actions">
          <Link href="/dashboard">Track it in your dashboard</Link>
          {" · "}
          <Link href="/jobs">Browse more jobs</Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="apply-form">
      <div className="field">
        <label htmlFor="coverNote">Cover note (optional)</label>
        <textarea
          id="coverNote"
          rows={4}
          value={coverNote}
          onChange={(e) => updateNote(e.target.value)}
          placeholder="Briefly say why you are a good fit for this job…"
        />
      </div>
      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
          {errorKind === "expired" && (
            <p className="success-actions">
              <Link href={`/login?expired=1&next=/jobs/${jobId}`}>
                Log in again to continue
              </Link>
            </p>
          )}
          {errorKind === "verify" && (
            <p className="success-actions">
              <Link href="/verify">Verify your email now</Link> — it takes
              less than a minute with the code in your inbox.
            </p>
          )}
        </div>
      )}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Submitting…" : "Apply for this job"}
      </button>
    </form>
  );
}
