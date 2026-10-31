"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { services } from "../../lib/data";

const INDUSTRIES = [
  "Construction",
  "Manufacturing",
  "Energy & Power",
  "Oil & Gas",
  "Civil Infrastructure",
  "Facilities & Maintenance",
  "Other",
];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState("professional");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    trade: services[0].title,
    experience: "",
    companyName: "",
    industry: INDUSTRIES[0],
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
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
            };
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed. Please try again.");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
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
          engineering talent.
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

        <form onSubmit={submit} className="card form-card">
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
              onChange={update("email")}
              placeholder="you@example.com"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password (at least 8 characters)</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={update("password")}
            />
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                value={form.phone}
                onChange={update("phone")}
                placeholder="+234 …"
              />
            </div>
            <div className="field">
              <label htmlFor="location">
                {role === "employer" ? "Company location" : "Location"}
              </label>
              <input
                id="location"
                value={form.location}
                onChange={update("location")}
                placeholder="e.g. Lagos, Nigeria"
              />
            </div>
          </div>

          {role === "professional" ? (
            <div className="form-row">
              <div className="field">
                <label htmlFor="trade">Trade / skill area</label>
                <select id="trade" value={form.trade} onChange={update("trade")}>
                  {services.map((s) => (
                    <option key={s.title} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="experience">Years of experience</label>
                <input
                  id="experience"
                  type="number"
                  min="0"
                  max="60"
                  value={form.experience}
                  onChange={update("experience")}
                  placeholder="e.g. 5"
                />
              </div>
            </div>
          ) : (
            <div className="field">
              <label htmlFor="industry">Industry</label>
              <select id="industry" value={form.industry} onChange={update("industry")}>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="alert alert-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
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
