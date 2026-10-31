import Link from "next/link";
import { services } from "../../lib/data";

export const metadata = {
  title: "Services — PeopTrust Engineering Group",
  description:
    "Engineering services, technical teams, equipment sourcing and project support from PeopTrust Engineering Group.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Our Services</p>
          <h1>Technical capability when you need it.</h1>
          <p className="lead">
            Engineering services, technical teams, equipment sourcing and
            project support.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {services.map((service) => (
              <article className="card" key={service.title}>
                <span className="icon">{service.icon}</span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <Link className="card-link" href="/contact">
                  Discuss a project →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
