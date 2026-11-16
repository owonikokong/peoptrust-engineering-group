"use client";

import dynamic from "next/dynamic";

const DashScene = dynamic(() => import("./DashScene"), { ssr: false });

export default function DashSceneLazy() {
  return <DashScene />;
}
