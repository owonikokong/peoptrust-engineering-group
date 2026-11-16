"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ className }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" className={className} onClick={logout}>
      Log out
    </button>
  );
}
