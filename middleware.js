import { NextResponse } from "next/server";

/**
 * Edge middleware — two jobs (security passes, 2026-11-02):
 *
 * 1. API guard + cache discipline (/api/*):
 *    - CSRF/origin guard: every state-changing API call comes from this
 *      site's own pages via fetch, and browsers always send Origin on
 *      such requests — a write whose Origin names a different host is
 *      rejected 403. Requests with no Origin (server-side, curl) pass.
 *      This backs up the session cookie's SameSite=Lax attribute.
 *    - All API responses get Cache-Control: private, no-store. Identity
 *      and account endpoints must never sit in a shared cache (the
 *      platform default marked /api/auth/me "public").
 *
 * 2. Nonce-based Content-Security-Policy (pages):
 *    A fresh nonce per request replaces script-src 'unsafe-inline'
 *    (second audit report, Priority 1). Next.js reads the CSP from the
 *    request headers and stamps the nonce onto its own inline scripts;
 *    'strict-dynamic' then trusts only those. Trade-off, accepted:
 *    pages render dynamically instead of fully static. style-src keeps
 *    'unsafe-inline' because React style attributes cannot be nonced —
 *    styles cannot execute script, so the residual risk is cosmetic
 *    defacement only, not code execution.
 */
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function contentSecurityPolicy(nonce) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "media-src 'self'",
    "font-src 'self' data:",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; ");
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    if (WRITE_METHODS.has(request.method)) {
      const origin = request.headers.get("origin");
      if (origin) {
        let originHost = null;
        try {
          originHost = new URL(origin).host;
        } catch {
          originHost = "invalid";
        }
        if (originHost !== request.headers.get("host")) {
          const blocked = NextResponse.json(
            { error: "This request did not come from PeopTrust. Please use the website to do this." },
            { status: 403 }
          );
          blocked.headers.set("Cache-Control", "private, no-store");
          return blocked;
        }
      }
    }
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = contentSecurityPolicy(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    // Pages only: skip Next internals and static files (the CSP travels
    // with the document response; asset responses don't need it).
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:webp|png|jpg|jpeg|gif|svg|ico|mp4|webm|woff2|txt|xml)$).*)",
  ],
};
