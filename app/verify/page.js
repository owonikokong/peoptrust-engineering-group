"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [state, setState] = useState("loading"); // loading | ready | guest
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) throw new Error("guest");
        const data = await res.json();
        if (data.user.emailVerified !== false) {
          router.replace("/dashboard");
          return;
        }
        setEmail(data.user.email);
        setState("ready");
      })
      .catch(() => setState("guest"));
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed.");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/auth/resend-code", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send a new code.");
      setNotice(
        data.mailSent
          ? "A new code is on its way to your email."
          : "A new code was generated. If email delivery is not connected yet, please contact PeopTrust support.",
      );
      setCooldown(60);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="section">
      <div className="container auth-wrap">
        <p className="eyebrow">Email confirmation</p>
        <h2>Confirm your email address</h2>

        {state === "loading" && <p className="lead">Checking your account…</p>}

        {state === "guest" && (
          <div className="card form-card">
            <p>
              Please <Link href="/login">log in</Link> or{" "}
              <Link href="/register">create an account</Link> first — the
              confirmation code is tied to your account.
            </p>
          </div>
        )}

        {state === "ready" && (
          <>
            <p className="lead">
              We sent a unique 6-digit code to <strong>{email}</strong>. Enter
              it below to confirm your email. Until then, you can browse, but
              you can&apos;t apply for jobs or post roles.
            </p>
            <form onSubmit={submit} className="card form-card">
              <div className="field">
                <label htmlFor="code">6-digit confirmation code</label>
                <input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="e.g. 042517"
                  style={{
                    fontSize: "1.4rem",
                    letterSpacing: "0.45em",
                    fontWeight: 700,
                  }}
                />
              </div>
              {error && <p className="alert alert-error">{error}</p>}
              {notice && <p className="alert alert-success">{notice}</p>}
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={busy || code.length !== 6}
              >
                {busy ? "Confirming…" : "Confirm email"}
              </button>
              <p className="form-foot">
                Didn&apos;t get it?{" "}
                <button
                  type="button"
                  className="link-button"
                  onClick={resend}
                  disabled={cooldown > 0}
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                </button>
              </p>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
