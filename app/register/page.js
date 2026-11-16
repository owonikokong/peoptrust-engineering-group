"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { services } from "../../lib/data";

import {
  AVAILABILITY,
  COMPANY_SIZES,
  INDUSTRIES,
  TRADES,
} from "../../lib/options";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState("professional");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    trade: TRADES[0],
    experience: "",
    skills: "",
    availability: AVAILABILITY[0],
    summary: "",
    previousExperience: "",
    certifications: "",
    cvUrl: "",
    companyName: "",
    industry: INDUSTRIES[0],
    companySize: COMPANY_SIZES[0],
    website: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  // State 9 — inline validation next to the field, with the fix.
  function validate() {
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email =
        "Enter a valid email address — it should look like you@example.com. Your confirmation code goes here.";
    }
    if (form.password.length < 8) {
      errs.password = "Use at least 8 characters for your password.";
    }
    if (form.phone.replace(/\D/g, "").length < 7) {
      errs.phone =
        "Enter a reachable phone number, including the country code if outside Nigeria.";
    }
    if (role === "professional") {
      const exp = Number(form.experience);
      if (form.experience === "" || Number.isNaN(exp) || exp < 0 || exp > 60) {
        errs.experience =
          "Enter your years of experience as a number between 0 and 60.";
      }
      if (form.cvUrl && !/^https?:\/\/.+/i.test(form.cvUrl.trim())) {
        errs.cvUrl =
          "Paste the full link, starting with https:// — e.g. a Google Drive share link.";
      }
    }
    if (
      role === "employer" &&
      form.website &&
      !/^https?:\/\/.+/i.test(form.website.trim())
    ) {
      errs.website =
        "Enter the full website address, starting with https:// — or leave it blank.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // Already signed in? Go straight to the dashboard.
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) router.replace("/dashboard");
      })
      .catch(() => {});
  }, [router]);

  function update(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setFieldErrors((errs) => ({ ...errs, [field]: undefined }));
    };
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setBusy(true);
    try {
      const payload =
        role === "professional"
          ? {
              role,
              name: form.name,
              email: form.email,
              password: form.password,
              phone: form.phone,
              location: form.location,
              trade: form.trade,
              experience: form.experience === "" ? "" : Number(form.experience),
              skills: form.skills,
              availability: form.availability,
              summary: form.summary,
              previousExperience: form.previousExperience,
              certifications: form.certifications,
              cvUrl: form.cvUrl,
            }
          : {
              role,
              name: form.name,
              email: form.email,
              password: form.password,
              phone: form.phone,
              location: form.location,
              companyName: form.companyName,
              industry: form.industry,
              companySize: form.companySize,
              website: form.website,
              description: form.description,
            };
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Registration failed. Please try again.");
      // Verification is verify-later: new accounts land on the dashboard
      // and can browse freely; applying and posting unlock once they enter
      // the 6-digit code (the dashboard banner links to /verify).
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "We could not reach PeopTrust — check your internet connection and try again. Nothing was submitted."
          : err.message,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section">
      <div className="container auth-wrap">
        <p className="eyebrow">Join PeopTrust</p>
        <h2>Create your account</h2>
        <p className="lead">
          Skilled professionals find credible work; employers find verified
          engineering talent. After signing up, we&apos;ll email you a unique
          6-digit code to confirm your email address. You can start browsing
          straight away and enter the code whenever you&apos;re ready — just
          confirm before you apply for a job or post a role.
        </p>

        <div className="role-toggle" role="tablist" aria-label="Account type">
          <button
            type="button"
            className={role === "professional" ? "active" : ""}
            onClick={() => setRole("professional")}
          >
            I&apos;m a Skilled Professional
          </button>
          <button
            type="button"
            className={role === "employer" ? "active" : ""}
            onClick={() => setRole("employer")}
          >
            I&apos;m an Employer
          </button>
        </div>

        <form onSubmit={submit} className="card form-card" noValidate>
          {role === "employer" && (
            <div className="field">
              <label htmlFor="companyName">Company name</label>
              <input
                id="companyName"
                required
                value={form.companyName}
                onChange={update("companyName")}
                placeholder="e.g. BuildRight Construction Ltd"
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="name">
              {role === "employer" ? "Contact person name" : "Full name"}
            </label>
            <input
              id="name"
              required
              value={form.name}
              onChange={update("name")}
              placeholder="Your full name"
            />
          </div>
          <div className="field">
            <label htmlFor="email">
              {role === "employer" ? "Work email" : "Email address"}
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              aria-invalid={Boolean(fieldErrors.email)}
              onChange={update("email")}
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <p className="field-error">{fieldErrors.email}</p>
            )}
          </div>
          <div className="field">
            <label htmlFor="password">Password (at least 8 characters)</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={form.password}
              aria-invalid={Boolean(fieldErrors.password)}
              onChange={update("password")}
            />
            {fieldErrors.password && (
              <p className="field-error">{fieldErrors.password}</p>
            )}
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                required
                value={form.phone}
                aria-invalid={Boolean(fieldErrors.phone)}
                onChange={update("phone")}
                placeholder="+234 …"
              />
              {fieldErrors.phone && (
                <p className="field-error">{fieldErrors.phone}</p>
              )}
            </div>
            <div className="field">
              <label htmlFor="location">
                {role === "employer" ? "Company location" : "Location"}
              </label>
              <input
                id="location"
                required
                value={form.location}
                onChange={update("location")}
                placeholder="e.g. Lagos, Nigeria"
              />
            </div>
          </div>

          {role === "professional" ? (
            <>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="trade">Trade / skill area</label>
                  <select
                    id="trade"
                    value={form.trade}
                    onChange={update("trade")}
                  >
                    {TRADES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="experience">Years of experience</label>
                  <input
                    id="experience"
                    type="number"
                    min="0"
                    max="60"
                    required
                    value={form.experience}
                    aria-invalid={Boolean(fieldErrors.experience)}
                    onChange={update("experience")}
                    placeholder="e.g. 5"
                  />
                  {fieldErrors.experience && (
                    <p className="field-error">{fieldErrors.experience}</p>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="skills">Key skills</label>
                  <input
                    id="skills"
                    required
                    value={form.skills}
                    onChange={update("skills")}
                    placeholder="e.g. TIG welding, rigging, scaffolding"
                  />
                </div>
                <div className="field">
                  <label htmlFor="availability">Availability</label>
                  <select
                    id="availability"
                    value={form.availability}
                    onChange={update("availability")}
                  >
                    {AVAILABILITY.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="summary">Professional summary</label>
                <textarea
                  id="summary"
                  required
                  rows={4}
                  maxLength={600}
                  value={form.summary}
                  onChange={update("summary")}
                  placeholder="Briefly describe your experience and the kind of work you do best."
                />
              </div>
              <div className="field">
                <label htmlFor="previousExperience">
                  Previous experience (optional)
                </label>
                <textarea
                  id="previousExperience"
                  rows={4}
                  maxLength={2000}
                  value={form.previousExperience}
                  onChange={update("previousExperience")}
                  placeholder={
                    "Previous roles, employers and projects — one per line. Employers can see this on your profile page."
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="certifications">
                  Certifications (optional)
                </label>
                <textarea
                  id="certifications"
                  rows={3}
                  maxLength={1000}
                  value={form.certifications}
                  onChange={update("certifications")}
                  placeholder={
                    "Certifications — one per line, e.g. COREN, HSE Level 3."
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="cvUrl">CV link (optional)</label>
                <input
                  id="cvUrl"
                  type="url"
                  maxLength={500}
                  value={form.cvUrl}
                  aria-invalid={Boolean(fieldErrors.cvUrl)}
                  onChange={update("cvUrl")}
                  placeholder="https://drive.google.com/…"
                />
                {fieldErrors.cvUrl && (
                  <p className="field-error">{fieldErrors.cvUrl}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="industry">Industry</label>
                  <select
                    id="industry"
                    value={form.industry}
                    onChange={update("industry")}
                  >
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="companySize">Company size</label>
                  <select
                    id="companySize"
                    value={form.companySize}
                    onChange={update("companySize")}
                  >
                    {COMPANY_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s} people
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="website">Company website (optional)</label>
                <input
                  id="website"
                  value={form.website}
                  aria-invalid={Boolean(fieldErrors.website)}
                  onChange={update("website")}
                  placeholder="e.g. https://yourcompany.ng"
                />
                {fieldErrors.website && (
                  <p className="field-error">{fieldErrors.website}</p>
                )}
              </div>
              <div className="field">
                <label htmlFor="description">Company description</label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  maxLength={600}
                  value={form.description}
                  onChange={update("description")}
                  placeholder="What does your company do, and what kind of professionals do you hire?"
                />
              </div>
            </>
          )}

          {error && <p className="alert alert-error">{error}</p>}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={busy}
          >
            {busy ? "Creating account…" : "Create account"}
          </button>
          <p className="form-foot">
            Already have an account? <Link href="/login">Log in</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
