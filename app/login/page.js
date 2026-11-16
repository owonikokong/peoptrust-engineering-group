"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [next, setNext] = useState("/dashboard");
  const [busy, setBusy] = useState(false);

  // State 8 — session expired: say so plainly, and after login return the
  // user to where they were instead of dropping them at the dashboard.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get("next");
    if (target && target.startsWith("/") && !target.startsWith("//")) {
      setNext(target);
    }
    if (params.get("expired") === "1") {
      setNotice(
        "Your session expired, so we signed you out for safety. Log in again to pick up where you left off — anything you were writing in a form is kept in that tab.",
      );
    }
  }, []);

  // Already signed in? Go straight to the destination.
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) router.replace(next);
      })
      .catch(() => {});
  }, [router, next]);

  // State 9 — inline validation with a fix suggestion, next to the field.
  function validate() {
    const errs = {};
    if (!EMAIL_RE.test(email.trim())) {
      errs.email =
        "Enter a valid email address — it should look like you@example.com.";
    }
    if (!password) {
      errs.password = "Enter your password.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Login failed. Please try again.");
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "We could not reach PeopTrust — check your internet connection and try again."
          : err.message,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section">
      <div className="container auth-wrap">
        <h2>Log in to PeopTrust</h2>
        <form onSubmit={submit} className="card form-card" noValidate>
          {notice && <p className="alert alert-success">{notice}</p>}
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              aria-invalid={Boolean(fieldErrors.email)}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((f) => ({ ...f, email: undefined }));
              }}
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <p className="field-error">{fieldErrors.email}</p>
            )}
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              aria-invalid={Boolean(fieldErrors.password)}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((f) => ({ ...f, password: undefined }));
              }}
            />
            {fieldErrors.password && (
              <p className="field-error">{fieldErrors.password}</p>
            )}
          </div>
          {error && <p className="alert alert-error">{error}</p>}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={busy}
          >
            {busy ? "Logging in…" : "Log in"}
          </button>
          <p className="form-foot">
            New to PeopTrust? <Link href="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
