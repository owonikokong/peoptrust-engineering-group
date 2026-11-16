"use client";

import dynamic from "next/dynamic";

// The stageshow demo measures its container and runs a scripted cursor, so
// it is client-only; the placeholder holds the space (and the poster's
// composition) until it mounts.
const PeoptrustDemo = dynamic(
  () => import("./stageshow/PeoptrustDemo").then((m) => m.PeoptrustDemo),
  {
    ssr: false,
    loading: () => <div className="demo-placeholder" aria-hidden="true" />,
  }
);

export default function DemoMount() {
  return <PeoptrustDemo />;
}
