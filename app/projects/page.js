import Link from "next/link";
import { projects } from "../../lib/data";

export const metadata = {
  title: "Projects — PeopTrust Engineering Group",
  description:
    "Selected engineering and technical assignments supported by the PeopTrust network in Lagos, Abuja, Port Harcourt and Ogun, Nigeria.",
};

export default function ProjectsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Projects</p>
          <h1>Work that turns expertise into results</h1>
          <p className="lead">
            Selected engineering and technical assignments supported by the
            PeopTrust network — in Lagos, Abuja, Port Harcourt and Ogun.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-2">
            {projects.map((project) => (
              <article
                data-reveal
                className="card project-card"
                key={project.title}
              >
                <div className="project-img-wrap">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="project-img project-img-tall"
                  />
                  <span className="location-chip">{project.location}</span>
                </div>
                <div className="project-card-body">
                  <h3>{project.title}</h3>
                  <p>{project.text}</p>
                  <Link className="card-link" href="/contact">
                    Discuss a similar project →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <p className="eyebrow">Your project in Nigeria</p>
          <h2>Building services, roads, power and maintenance</h2>
          <p className="lead">
            The assignments above cover building services, road construction,
            power distribution and industrial maintenance. If your project needs
            similar support in Nigeria, share your requirements and the
            PeopTrust team can help shape the next step.
          </p>
          <div style={{ display: "flex", gap: "8px 28px", flexWrap: "wrap" }}>
            <Link className="text-link" href="/contact">
              Discuss a project →
            </Link>
            <Link className="text-link" href="/services">
              See the services →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
