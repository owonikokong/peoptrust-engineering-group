"use client";

import { services } from "../../lib/data";

const TYPES = ["Full-time", "Contract", "Part-time"];

// Client-side field validation for the job forms — the same rules
// PostJobForm has always used, shared with the edit form so both give
// identical inline feedback. The server (lib/job-fields.js) is the
// enforcement; these messages only say how to fix a field.
export function validateJobForm(form) {
  const errs = {};
  if (form.title.trim().length < 3) {
    errs.title = "Give the role a clear title — at least 3 characters, e.g. “Site Mechanical Engineer”.";
  }
  if (!form.location.trim()) {
    errs.location = "Add where the job is based, e.g. “Lagos, Nigeria” — or “Remote”.";
  }
  if (form.description.trim().length < 20) {
    errs.description = "Describe the role in a sentence or two (at least 20 characters) so professionals know what the work is.";
  }
  return errs;
}

// The five job fields, shared by PostJobForm and EditJobForm so the
// two forms can never drift apart. `update(field)` returns the change
// handler; `idPrefix` keeps element ids unique when both forms render
// on the same page (the dashboard renders the post form and, while
// editing, an edit form).
export default function JobFields({ form, fieldErrors, update, idPrefix = "" }) {
  const id = (name) => `${idPrefix}job-${name}`;
  return (
    <>
      <div className="field">
        <label htmlFor={id("title")}>Job title</label>
        <input
          id={id("title")}
          required
          value={form.title}
          aria-invalid={Boolean(fieldErrors.title)}
          onChange={update("title")}
          placeholder="e.g. Site Mechanical Engineer"
        />
        {fieldErrors.title && <p className="field-error">{fieldErrors.title}</p>}
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor={id("category")}>Category</label>
          <select id={id("category")} value={form.category} onChange={update("category")}>
            {services.map((s) => (
              <option key={s.title} value={s.title}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={id("type")}>Type</label>
          <select id={id("type")} value={form.type} onChange={update("type")}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor={id("location")}>Location</label>
        <input
          id={id("location")}
          required
          value={form.location}
          aria-invalid={Boolean(fieldErrors.location)}
          onChange={update("location")}
          placeholder="e.g. Lagos, Nigeria"
        />
        {fieldErrors.location && <p className="field-error">{fieldErrors.location}</p>}
      </div>
      <div className="field">
        <label htmlFor={id("description")}>Description</label>
        <textarea
          id={id("description")}
          required
          rows={4}
          value={form.description}
          aria-invalid={Boolean(fieldErrors.description)}
          onChange={update("description")}
          placeholder="What the role involves, responsibilities, duration…"
        />
        {fieldErrors.description && <p className="field-error">{fieldErrors.description}</p>}
      </div>
      <div className="field">
        <label htmlFor={id("requirements")}>Requirements (optional)</label>
        <textarea
          id={id("requirements")}
          rows={3}
          value={form.requirements}
          onChange={update("requirements")}
          placeholder="Experience, certifications, tools…"
        />
      </div>
    </>
  );
}
