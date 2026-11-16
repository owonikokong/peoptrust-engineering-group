"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

/**
 * Session-aware header links. The header is static markup, so without this
 * the nav always showed "Login / Get Started" — even for signed-in users,
 * which made it look like navigating (e.g. to /jobs) had logged them out.
 * Now: signed-in users see Dashboard + Log out on every page.
 */
export default function AuthNav() {
  const [user, setUser] = useState(undefined); // undefined = still checking
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setUser(data?.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  // Still checking the session: show neutral placeholders, not the
  // signed-out links — flashing "Login / Get Started" at a signed-in user
  // reads as "you were logged out" (session state must never mislead).
  if (user === undefined) {
    return (
      <>
        <span className="skel skel-nav" aria-hidden="true" />
        <span className="skel skel-nav skel-nav-wide" aria-hidden="true" />
      </>
    );
  }

  if (user) {
    return (
      <>
        <Link href="/dashboard">Dashboard</Link>
        <button type="button" className="nav-logout" onClick={logout}>
          Log out
        </button>
      </>
    );
  }

  return (
    <>
      <Link href="/login">Login</Link>
      <Link href="/register" className="nav-cta">
        Get Started
      </Link>
    </>
  );
}
