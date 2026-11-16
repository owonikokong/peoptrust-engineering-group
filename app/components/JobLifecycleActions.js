"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ERROR_CODES } from "../../lib/error-codes";
import EditJobForm from "./EditJobForm";

// Lifecycle actions for one posted job in the employer dashboard.
// Renders only the actions valid for the job's current state (the
// server is the enforcement — these buttons are just the honest UI):
// Close + Edit + Delete while open, Reopen + Delete while closed,
// nothing once deleted. Delete is two-step inline: the first click
// asks, the second confirms. After any action the dashboard refreshes
// (router.refresh, the same pattern PostJobForm uses) so the card
// shows the new state without a full-page reload.
export default function JobLifecycleActions({ job }) {
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [errorKind, setErrorKind] = useState(""); // "" | "expired"
  const [busy, setBusy] = useState("");

  // Mirrors jobState in lib/states (server-only): the server already
  // normalizes missing status to "open"; anything not closed/deleted
  // reads as open here too.
  const state =
    job.status === "closed" || job.status === "deleted" ? job.status : "open";

  if (state === "deleted") return null;

  async function act(kind, method, path) {
    setError("");
    setErrorKind("");
    setBusy(kind);
    try {
      const res = await fetch(path, { method });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setErrorKind("expired");
          throw new Error(
            "Your session expired. Log in again and try once more.",
          );
        }
        // Classify by the API's stable error code (shared vocabulary in
        // lib/error-codes); fall back to the old message match only when
        // a response carries no code (e.g. a stale deployment still
        // serving pre-code responses). A wrong-state rejection means
        // the job changed state elsewhere — refresh so the card shows
        // the true state.
        if (
          res.status === 409 &&
          (data.code === ERROR_CODES.JOB_WRONG_STATE ||
            (!data.code && /already|open|closed/i.test(data.error || "")))
        ) {
          router.refresh();
          throw new Error(
            data.error ||
              "This job changed state. The card now shows its current state.",
          );
        }
        throw new Error(data.error || "Could not do that. Please try again.");
      }
      setConfirmingDelete(false);
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "We could not reach PeopTrust — check your internet connection and try again."
          : err.message,
      );
    } finally {
      setBusy("");
    }
  }

  function cancelEdit() {
    setEditing(false);
    router.refresh();
  }

  return (
    <div>
      <div className="job-actions">
        {state === "open" && (
          <>
            <button
              type="button"
              className="btn btn-outline"
              disabled={busy !== "" || editing}
              onClick={() => act("close", "POST", `/api/jobs/${job.id}/close`)}
            >
              {busy === "close" ? "Closing…" : "Close"}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              disabled={busy !== ""}
              onClick={() => setEditing((open) => !open)}
            >
              {editing ? "Hide edit form" : "Edit"}
            </button>
          </>
        )}
        {state === "closed" && (
          <button
            type="button"
            className="btn btn-outline"
            disabled={busy !== ""}
            onClick={() => act("reopen", "POST", `/api/jobs/${job.id}/reopen`)}
          >
            {busy === "reopen" ? "Reopening…" : "Reopen"}
          </button>
        )}
        {!confirmingDelete && (
          <button
            type="button"
            className="btn btn-outline"
            disabled={busy !== "" || editing}
            onClick={() => setConfirmingDelete(true)}
          >
            Delete
          </button>
        )}
      </div>

      {confirmingDelete && (
        <div className="job-actions job-action-confirm">
          <span>
            Delete this job? It will leave the Jobs page, but its applications
            stay visible here.
          </span>
          <button
            type="button"
            className="btn btn-danger"
            disabled={busy !== ""}
            onClick={() => act("delete", "DELETE", `/api/jobs/${job.id}`)}
          >
            {busy === "delete" ? "Deleting…" : "Delete job"}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            disabled={busy !== ""}
            onClick={() => setConfirmingDelete(false)}
          >
            Keep it
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginTop: 12 }}>
          <p>{error}</p>
          {errorKind === "expired" && (
            <p className="success-actions">
              <Link href="/login?expired=1&next=/dashboard">
                Log in again to continue
              </Link>
            </p>
          )}
        </div>
      )}

      {editing && state === "open" && (
        <div className="job-edit-wrap">
          <EditJobForm
            job={job}
            onSaved={() => {
              setEditing(false);
              router.refresh();
            }}
            onCancel={cancelEdit}
          />
        </div>
      )}
    </div>
  );
}
