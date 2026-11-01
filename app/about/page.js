export const metadata = {
  title: "About — PeopTrust Engineering Group",
  description:
    "PeopTrust Engineering Group bridges the gap between employers who need reliable technical capacity and skilled professionals who want credible opportunities.",
};

const values = [
  {
    title: "People First",
    text: "The professionals behind every project come first.",
  },
  {
    title: "Verified Skills",
    text: "Capability is checked, so employers can hire with confidence.",
  },
  {
    title: "Safety Always",
    text: "Safe practice guides every site, task and delivery.",
  },
  {
    title: "Dependable Delivery",
    text: "Clear commitments, met with disciplined follow-through.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">About Us</p>
          <h1>PeopTrust Engineering Group</h1>
          <p className="lead">
            PeopTrust Engineering Group bridges the gap between employers who
            need reliable technical capacity and skilled professionals who
            want credible opportunities.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <img
            src="/about/team.jpg"
            alt="PeopTrust engineering team at work"
            className="about-hero-img"
          />
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <h2>What we do</h2>
          <p className="lead">
            Our platform supports engineering recruitment, project teams,
            technical services, equipment sourcing and maintenance
            relationships. We focus on verified capability, clear
            requirements, safety and dependable delivery.
          </p>

          <h2 style={{ marginTop: "48px" }}>What we value</h2>
          <div className="grid grid-4">
            {values.map((value) => (
              <article className="card service-card" key={value.title}>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
