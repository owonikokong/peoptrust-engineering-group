"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { services } from "../../lib/data";

const TYPES = ["Full-time", "Contract", "Part-time"];

export default function PostJobForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    category: services[0].title,
    location: "",
    type: "Full-time",
    description: "",
    requirements: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not post the job.");
      setForm({
        title: "",
        category: services[0].title,
        location: "",
        type: "Full-time",
        description: "",
        requirements: "",
      });
      setSuccess("Job posted. It is now listed on the Jobs page.");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="field">
        <label htmlFor="job-title">Job title</label>
        <input
          id="job-title"
          required
          value={form.title}
          onChange={update("title")}
          placeholder="e.g. Site Mechanical Engineer"
        />
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="job-category">Category</label>
          <select id="job-category" value={form.category} onChange={update("category")}>
            {services.map((s) => (
              <option key={s.title} value={s.title}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="job-type">Type</label>
          <select id="job-type" value={form.type} onChange={update("type")}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="job-location">Location</label>
        <input
          id="job-location"
          required
          value={form.location}
          onChange={update("location")}
          placeholder="e.g. Lagos, Nigeria"
        />
      </div>
      <div className="field">
        <label htmlFor="job-description">Description</label>
        <textarea
          id="job-description"
          required
          rows={4}
          value={form.description}
          onChange={update("description")}
          placeholder="What the role involves, responsibilities, duration…"
        />
      </div>
      <div className="field">
        <label htmlFor="job-requirements">Requirements (optional)</label>
        <textarea
          id="job-requirements"
          rows={3}
          value={form.requirements}
          onChange={update("requirements")}
          placeholder="Experience, certifications, tools…"
        />
      </div>
      {error && <p className="alert alert-error">{error}</p>}
      {success && <p className="alert alert-success">{success}</p>}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Posting…" : "Post job"}
      </button>
    </form>
  );
}
