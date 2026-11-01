"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed. Please try again.");
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
        <p className="eyebrow">Welcome back</p>
        <h2>Log in to PeopTrust</h2>
        <form onSubmit={submit} className="card form-card">
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="alert alert-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
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
