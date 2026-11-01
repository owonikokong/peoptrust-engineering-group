"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplyForm({ jobId }) {
  const router = useRouter();
  const [coverNote, setCoverNote] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit your application.");
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="alert alert-success">
        Application submitted. The employer can now see it in their dashboard.
      </p>
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
          onChange={(e) => setCoverNote(e.target.value)}
          placeholder="Briefly say why you are a good fit for this job…"
        />
      </div>
      {error && <p className="alert alert-error">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Submitting…" : "Apply for this job"}
      </button>
    </form>
  );
}
