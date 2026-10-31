export const metadata = {
  title: "Contact — PeopTrust Engineering Group",
  description:
    "Share your project, talent or equipment requirements and the PeopTrust team can help shape the next step.",
};

const contacts = [
  { label: "Phone", value: "+234 704 027 0608" },
  { label: "Email", value: "info@peoptrust.com" },
  { label: "Location", value: "Lagos, Nigeria" },
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
              <article className="card" key={contact.label}>
                <h3>{contact.label}</h3>
                <p className="contact-value">{contact.value}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
