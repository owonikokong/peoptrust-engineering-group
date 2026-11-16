"use client";

import { useState } from "react";
import { AVAILABILITY, COMPANY_SIZES, INDUSTRIES, TRADES } from "../../lib/options";

export default function AccountForm({ user }) {
  const isEmployer = user.role === "employer";
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
    location: user.location || "",
    trade: user.trade || TRADES[0],
    experience:
      user.experience === null || user.experience === undefined
        ? ""
        : String(user.experience),
    skills: user.skills || "",
    availability: user.availability || AVAILABILITY[0],
    summary: user.summary || "",
    previousExperience: user.previousExperience || "",
    certifications: user.certifications || "",
    cvUrl: user.cvUrl || "",
    companyName: user.companyName || "",
    industry: user.industry || INDUSTRIES[0],
    companySize: user.companySize || COMPANY_SIZES[0],
    website: user.website || "",
    description: user.description || "",
  });
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const [message, setMessage] = useState("");

  function set(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (status === "saved") setStatus("idle");
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("saving");
    setMessage("");
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("saved");
      setMessage("Your changes are saved.");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  const bio = isEmployer ? form.description : form.summary;

  return (
    <form className="account-form" onSubmit={onSubmit}>

      {status === "saved" ? (
        <div className="alert alert-success" role="status">{message}</div>
      ) : null}
      {status === "error" ? (
        <div className="alert alert-error" role="alert">{message}</div>
      ) : null}

      {isEmployer ? (
        <div className="field">
          <label htmlFor="companyName">Company name</label>
          <input id="companyName" value={form.companyName} onChange={set("companyName")} required />
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="name">{isEmployer ? "Your full name (contact person)" : "Full name"}</label>
        <input id="name" value={form.name} onChange={set("name")} required />
      </div>

      <div className="field">
        <label htmlFor="email">Email address</label>
        <input id="email" value={user.email} disabled readOnly />
        <p className="field-note">Your email is your login and cannot be changed here.</p>
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="phone">Phone number</label>
          <input id="phone" value={form.phone} onChange={set("phone")} required />
        </div>
        <div className="field">
          <label htmlFor="location">Location</label>
          <input id="location" value={form.location} onChange={set("location")} required />
        </div>
      </div>

      {isEmployer ? (
        <>
          <div className="form-row">
            <div className="field">
              <label htmlFor="industry">Industry</label>
              <select id="industry" value={form.industry} onChange={set("industry")}>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="companySize">Company size</label>
              <select id="companySize" value={form.companySize} onChange={set("companySize")}>
                {COMPANY_SIZES.map((s) => (
                  <option key={s} value={s}>{s} people</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="website">Website (optional)</label>
            <input id="website" value={form.website} onChange={set("website")} placeholder="https://example.com" />
          </div>
          <div className="field">
            <label htmlFor="description">Company description</label>
            <textarea id="description" rows={4} maxLength={600} value={form.description} onChange={set("description")} required />
            <p className="field-note">{bio.length}/600 characters</p>
          </div>
        </>
      ) : (
        <>
          <div className="form-row">
            <div className="field">
              <label htmlFor="trade">Trade / skill area</label>
              <select id="trade" value={form.trade} onChange={set("trade")}>
                {TRADES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="experience">Years of experience</label>
              <input id="experience" type="number" min="0" max="60" step="1" value={form.experience} onChange={set("experience")} required />
            </div>
          </div>
          <div className="field">
            <label htmlFor="skills">Key skills</label>
            <input id="skills" value={form.skills} onChange={set("skills")} required />
          </div>
          <div className="field">
            <label htmlFor="availability">Availability</label>
            <select id="availability" value={form.availability} onChange={set("availability")}>
              {AVAILABILITY.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="summary">Professional summary</label>
            <textarea id="summary" rows={4} maxLength={600} value={form.summary} onChange={set("summary")} required />
            <p className="field-note">{bio.length}/600 characters</p>
          </div>
          <div className="field">
            <label htmlFor="previousExperience">Previous experience (optional)</label>
            <textarea id="previousExperience" rows={5} maxLength={2000} value={form.previousExperience} onChange={set("previousExperience")} placeholder={"e.g.\nSenior Welder — Dangote Refinery, 2021–2024\nFabricator — Julius Berger, 2018–2021"} />
            <p className="field-note">Previous roles, employers and projects — one per line. Employers see this on your profile page. {form.previousExperience.length}/2,000 characters</p>
          </div>
          <div className="field">
            <label htmlFor="certifications">Certifications (optional)</label>
            <textarea id="certifications" rows={3} maxLength={1000} value={form.certifications} onChange={set("certifications")} placeholder={"e.g.\nCOREN registered\nHSE Level 3\nAWS D1.1 welding certification"} />
            <p className="field-note">One certification per line. Employers see these on your profile page.</p>
          </div>
          <div className="field">
            <label htmlFor="cvUrl">CV link (optional)</label>
            <input id="cvUrl" type="url" maxLength={500} value={form.cvUrl} onChange={set("cvUrl")} placeholder="https://drive.google.com/…" />
            <p className="field-note">Link to your CV (Google Drive, Dropbox, etc). Make sure anyone with the link can view it — employers open it from your profile page.</p>
          </div>
        </>
      )}

      <button type="submit" className="btn btn-primary" disabled={status === "saving"}>
        {status === "saving" ? "Saving\u2026" : "Save changes"}
      </button>
    </form>
  );
}
