import Link from "next/link";
import "./globals.css";
import { services } from "../lib/data";

export const metadata = {
  title: "PeopTrust Engineering Group",
  description:
    "Engineering services and skilled-labour marketplace in Nigeria. PeopTrust connects employers with capable engineering professionals while delivering reliable technical services, equipment and project support.",
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
    <html lang="en">
      <body>
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
              <Link href="/login">Login</Link>
              <Link href="/register" className="nav-cta">
                Get Started
              </Link>
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
                Engineering services and a skilled-labour marketplace
                connecting employers with verified professionals across
                Nigeria.
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
