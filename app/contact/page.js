import Link from "next/link";

export const metadata = {
  title: "Contact — PeopTrust Engineering Group",
  description:
    "Share your project, talent or equipment requirements with PeopTrust Engineering Group in Lagos, Nigeria.",
};

const contacts = [
  { label: "Visit", value: "Lagos, Nigeria" },
  {
    label: "Email",
    value: "info@peoptrust.com",
    href: "mailto:info@peoptrust.com",
  },
  { label: "Call", value: "+234 704 027 0608", href: "tel:+2347040270608" },
];

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Start a conversation</p>
          <h1>Project, talent or equipment?</h1>
          <p className="lead">
            Share your requirements and our team can help shape the next step.
            It helps to include the service or trade you need, where in Nigeria
            the work is, and when you need it.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {contacts.map((contact) => (
              <article className="card info-card" key={contact.label}>
                <h3>{contact.label}</h3>
                <p className="contact-value">
                  {contact.href ? (
                    <a href={contact.href}>{contact.value}</a>
                  ) : (
                    contact.value
                  )}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <p className="eyebrow">Start here</p>
          <h2>What to include in your message</h2>
          <p className="lead">
            Three details help the team shape the next step.
          </p>
          <div className="grid grid-3">
            <article data-reveal className="card">
              <h3>Project</h3>
              <p>
                Share the service area or trade, the scope of work, and the
                location in Nigeria.
              </p>
            </article>
            <article data-reveal className="card">
              <h3>Talent</h3>
              <p>
                Share the role or trade, the key skills, and the availability
                you need.
              </p>
            </article>
            <article data-reveal className="card">
              <h3>Equipment</h3>
              <p>
                Share the equipment, the specifications, and the delivery
                location.
              </p>
            </article>
          </div>
          <div style={{ display: "flex", gap: "8px 28px", flexWrap: "wrap" }}>
            <Link className="text-link" href="/services">
              Browse the services →
            </Link>
            <Link className="text-link" href="/about">
              Read about PeopTrust →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
