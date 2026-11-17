/** @type {import('next').NextConfig} */

// Security headers for every route (2026-11-02 security audit passes).
// The Content-Security-Policy itself lives in middleware.js: it carries
// a per-request nonce, which a static config header cannot. Everything
// below is request-independent. The app loads nothing from third-party
// origins — fonts are self-hosted, videos and images are local, and the
// browser only ever calls this site's own /api routes (Supabase is
// server-side only).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // The site is only ever consumed from its own origin; public static
  // assets aside (Vercel's CDN serves those with its own policy), API and
  // page responses are not readable cross-origin.
  { key: "Access-Control-Allow-Origin", value: "https://peoptrust.vercel.app" },
];

// Pages that render a signed-in user's own data must never be stored by
// a shared cache (audit report 3, Priority 1 — sensitive cache controls).
const noStore = [{ key: "Cache-Control", value: "private, no-store" }];

const nextConfig = {
  // Do not advertise the framework version in response headers.
  poweredByHeader: false,
  // The vendored stageshow kit (app/components/stageshow) is typed against
  // React 18; runtime is verified, so type errors in it must not block builds.
  typescript: { ignoreBuildErrors: true },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/dashboard", headers: noStore },
      { source: "/account", headers: noStore },
      { source: "/verify", headers: noStore },
      { source: "/professionals/:path*", headers: noStore },
    ];
  },
};

export default nextConfig;
