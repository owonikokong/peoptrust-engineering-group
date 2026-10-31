export const metadata = {
  title: "Contact — PeopTrust Engineering Group",
  description:
    "Share your project, talent or equipment requirements and the PeopTrust team can help shape the next step.",
};

const contacts = [
  { label: "Visit", value: "Lagos, Nigeria" },
  { label: "Email", value: "info@peoptrust.com", href: "mailto:info@peoptrust.com" },
  { label: "Call", value: "+234 704 027 0608", href: "tel:+2347040270608" },
];

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Start a Conversation</p>
          <h1>Project, talent or equipment?</h1>
          <p className="lead">
            Share your requirements and our team can help shape the next step.
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
    </>
  );
}
