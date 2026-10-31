export const metadata = {
  title: "About — PeopTrust Engineering Group",
  description:
    "PeopTrust Engineering Group bridges the gap between employers who need reliable technical capacity and skilled professionals who want credible opportunities.",
};

const values = [
  {
    title: "People first",
    text: "We value the professionals who make projects happen.",
  },
  {
    title: "Quality & safety",
    text: "We promote disciplined engineering practice and responsible delivery.",
  },
  {
    title: "Sustainable solutions",
    text: "We support efficient, resilient and environmentally conscious work.",
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
          <h2>What we do</h2>
          <p className="lead">
            Our platform supports engineering recruitment, project teams,
            technical services, equipment sourcing and maintenance
            relationships. We focus on verified capability, clear
            requirements, safety and dependable delivery.
          </p>

          <div className="grid grid-3">
            {values.map((value) => (
              <article className="card" key={value.title}>
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
