// Public sitemap. Only pages a signed-out visitor can open are listed:
// sign-in-gated routes (/login, /verify, /dashboard, /account,
// /professionals/[id]) and /api are excluded, and /jobs/[id] entries are
// left out until posted jobs exist to list. robots.js points here.

const SITE_URL = "https://peoptrust.vercel.app";

export default function sitemap() {
  const now = new Date();
  const entries = [
    { path: "/", changeFrequency: "weekly", priority: 1.0 },
    { path: "/jobs", changeFrequency: "weekly", priority: 0.9 },
    { path: "/services", changeFrequency: "monthly", priority: 0.9 },
    { path: "/about", changeFrequency: "monthly", priority: 0.8 },
    { path: "/projects", changeFrequency: "monthly", priority: 0.8 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
    { path: "/register", changeFrequency: "monthly", priority: 0.8 },
    {
      path: "/guides/how-to-hire-welders-in-nigeria",
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
  return entries.map((entry) => ({
    url: `${SITE_URL}${entry.path}`,
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
