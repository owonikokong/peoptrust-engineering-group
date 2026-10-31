import { projects } from "../../lib/data";

export const metadata = {
  title: "Projects — PeopTrust Engineering Group",
  description:
    "Selected engineering and technical assignments supported by the PeopTrust network.",
};

export default function ProjectsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Projects</p>
          <h1>Work that turns expertise into results.</h1>
          <p className="lead">
            Selected engineering and technical assignments supported by the
            PeopTrust network.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-2">
            {projects.map((project) => (
              <article className="card project-card" key={project.title}>
                <p className="location">{project.location}</p>
                <h3>{project.title}</h3>
                <p>{project.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
