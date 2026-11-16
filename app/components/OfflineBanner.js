"use client";

import { useEffect, useState } from "react";

/**
 * State 4 — No internet. The page content stays visible (it was already
 * loaded), and a slim banner explains the situation and what it means:
 * browsing works, saving does not, until the connection returns.
 */
export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="offline-banner" role="status">
      <span className="offline-dot" aria-hidden="true" />
      You are offline. You can keep reading what is already loaded — new changes
      cannot be saved until your connection returns.
    </div>
  );
}
