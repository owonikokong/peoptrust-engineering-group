import Link from "next/link";
import "./globals.css";

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand">
              PeopTrust <span>Engineering Group</span>
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
          <div className="container footer-inner">
            <div>
              <p className="footer-brand">PeopTrust Engineering Group</p>
              <p className="footer-line">
                Engineering services and skilled-labour marketplace in Nigeria.
              </p>
            </div>
            <nav className="footer-nav">
              {nav.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="container footer-bottom">
            <p>© 2026 PeopTrust Engineering Group</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
