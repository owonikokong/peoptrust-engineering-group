"use client";

import dynamic from "next/dynamic";

// ssr:false dynamic imports must live in a Client Component (Next.js App
// Router rule), so the Server Component page imports this thin wrapper.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export default function HeroSceneLazy() {
  return <HeroScene />;
}
