import Link from "next/link";
import localFont from "next/font/local";
import "./globals.css";
import { services } from "../lib/data";
import AuthNav from "./components/AuthNav";
import OfflineBanner from "./components/OfflineBanner";
import RevealInit from "./components/RevealInit";

const plexSans = localFont({
  src: [
    { path: "./fonts/IBMPlexSans-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/IBMPlexSans-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/IBMPlexSans-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

const plexMono = localFont({
  src: [
    { path: "./fonts/IBMPlexMono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/IBMPlexMono-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
});

// Nonce-based CSP (middleware.js) can only stamp a per-request nonce
// onto scripts in dynamically rendered HTML — a prerendered static page
// would ship scripts with no nonce and the browser would block them
// all. So every page renders on request. The pages are light and the
// data-driven ones were dynamic already; this is the accepted cost of
// dropping script-src 'unsafe-inline' (audit report 3, Priority 1).
export const dynamic = "force-dynamic";

export const metadata = {
  metadataBase: new URL("https://peoptrust.vercel.app"),
  title: "PeopTrust Engineering Group",
  description:
    "Engineering services and skilled-labour marketplace in Nigeria. PeopTrust connects employers with capable engineering professionals while delivering reliable technical services, equipment and project support.",
  openGraph: {
    title: "PeopTrust Engineering Group",
    description:
      "Engineering services and skilled-labour marketplace in Nigeria. PeopTrust connects employers with capable engineering professionals while delivering reliable technical services, equipment and project support.",
    url: "https://peoptrust.vercel.app",
    siteName: "PeopTrust Engineering Group",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "PeopTrust Engineering Group",
    description:
      "Engineering services and skilled-labour marketplace in Nigeria. PeopTrust connects employers with capable engineering professionals while delivering reliable technical services, equipment and project support.",
  },
};

const nav = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Jobs" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/jobs", label: "Jobs" },
];

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <RevealInit />
        <OfflineBanner />
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand">
              <img
                src="/brand/logo.webp"
                alt="PeopTrust Engineering Group logo"
                className="brand-logo"
              />
              <span className="brand-text">
                <span className="brand-name">PeopTrust</span>
                <span className="brand-sub">Engineering Group</span>
              </span>
            </Link>
            <nav className="main-nav">
              {nav.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
              <AuthNav />
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="container footer-grid">
            <div className="footer-col footer-about">
              <span className="footer-logo-tile">
                <img
                  src="/brand/logo.webp"
                  alt="PeopTrust Engineering Group logo"
                  className="footer-logo"
                />
              </span>
              <p className="footer-brand">PeopTrust Engineering Group</p>
              <p className="footer-line">
                Engineering services and a skilled-labour marketplace connecting
                employers with verified professionals across Nigeria.
              </p>
            </div>

            <div className="footer-col">
              <p className="footer-heading">Quick Links</p>
              <ul className="footer-links">
                {quickLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <p className="footer-heading">Services</p>
              <ul className="footer-links">
                {services.map((service) => (
                  <li key={service.title}>
                    <Link href="/services">{service.title}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <p className="footer-heading">Contact</p>
              <ul className="footer-contact">
                <li>
                  <span>Visit</span>
                  Lagos, Nigeria
                </li>
                <li>
                  <span>Email</span>
                  <a href="mailto:info@peoptrust.com">info@peoptrust.com</a>
                </li>
                <li>
                  <span>Call</span>
                  <a href="tel:+2347040270608">+234 704 027 0608</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="container footer-bottom">
            <p>
              © {new Date().getFullYear()} PeopTrust Engineering Group. All
              rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
