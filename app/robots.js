// Crawler rules. Everything public stays crawlable; sign-in-gated
// routes and the API are excluded so crawlers never index a signed-in
// user's pages or a login wall.

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/account",
          "/verify",
          "/login",
          "/professionals/",
        ],
      },
    ],
    sitemap: "https://peoptrust.vercel.app/sitemap.xml",
  };
}
