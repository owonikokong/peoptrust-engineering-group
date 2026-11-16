import Link from "next/link";
import { services } from "../../lib/data";

export const metadata = {
  title: "Services — PeopTrust Engineering Group",
  description:
    "Six engineering service areas for Nigerian projects: civil, mechanical and electrical engineering, project management, environmental engineering and equipment supply from PeopTrust Engineering Group.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero page-hero-gradient">
        <div className="container">
          <p className="eyebrow">Our services</p>
          <h1>Technical capability when you need it</h1>
          <p className="lead">
            Six service areas for Nigerian construction, industrial, mechanical,
            electrical and technical work — delivered through verified
            professionals and suppliers across Nigeria.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {services.map((service) => (
              <article
                data-reveal
                className="card service-card"
                key={service.title}
              >
                <img
                  className="service-img"
                  src={service.image}
                  alt={`${service.title} illustration`}
                  loading="lazy"
                />
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <ul className="check-list">
                  {service.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <Link className="card-link" href="/contact">
                  Discuss a project →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <p className="eyebrow">Standards &amp; safety</p>
          <h2>Agree the standard before work starts</h2>
          <p className="lead">
            The right standard depends on the job. Work in Nigeria commonly
            references guidance from the Standards Organisation of Nigeria
            (SON), the Council for the Regulation of Engineering in Nigeria
            (COREN) and the Nigerian Society of Engineers (NSE), alongside
            international standards from the American Welding Society (AWS), the
            American Society of Mechanical Engineers (ASME) and the
            International Organization for Standardization (ISO) for welding and
            mechanical work. Professionals list certifications on their profiles
            — ask which standards apply to your job, and settle the standards,
            safety practice and inspection before work starts.
          </p>
          <div className="points">
            <span>Ask which standards apply</span>
            <span>Check certifications on the profile</span>
            <span>Agree safety practice and inspection</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">Before work starts</p>
          <h2>Settle the details in your discussion</h2>
          <p className="lead">
            PeopTrust connects employers and professionals; the agreement itself
            is yours. Before work starts, settle these points with the
            professional or team you hire:
          </p>
          <div className="grid grid-2">
            <article data-reveal className="card">
              <h3>Scope, materials and labour</h3>
              <ul className="check-list">
                <li>Scope of work, in clear requirements</li>
                <li>Materials — who supplies them</li>
                <li>Labour and equipment needed for the job</li>
              </ul>
            </article>
            <article data-reveal className="card">
              <h3>Time, cost and checks</h3>
              <ul className="check-list">
                <li>Project timeline and milestones</li>
                <li>Payment terms, agreed in advance</li>
                <li>Inspection requirements and warranty</li>
              </ul>
            </article>
          </div>
          <Link className="text-link" href="/contact">
            Discuss a project →
          </Link>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <p className="eyebrow">Questions</p>
          <h2>What employers and professionals ask</h2>
          <p className="lead">
            Straight answers about how PeopTrust works. For anything else,
            contact the team.
          </p>
          <div className="grid grid-2">
            <article data-reveal className="card">
              <h3>What do professional profiles show?</h3>
              <p>
                Trade or skill area, key skills, years of experience,
                availability, a professional summary, previous experience,
                certifications and a CV link — the details an employer needs to
                judge fit before contact.
              </p>
            </article>
            <article data-reveal className="card">
              <h3>What do employers share when they post a role?</h3>
              <p>
                Employers share company name, industry, company size, location
                and a company description, plus a contact person. Employers post
                the roles and projects they need filled.
              </p>
            </article>
            <article data-reveal className="card">
              <h3>How does hiring work on PeopTrust?</h3>
              <p>
                In three steps: create a profile or post a job, get matched with
                verified professionals whose skills fit the work, then work and
                deliver with clear requirements and safe practice.{" "}
                <Link href="/register">Create your account</Link> to start.
              </p>
            </article>
            <article data-reveal className="card">
              <h3>Which industries does PeopTrust serve?</h3>
              <p>
                Construction, Manufacturing, Energy &amp; Power, Oil &amp; Gas,
                Civil Infrastructure, and Facilities &amp; Maintenance — the six
                industries employers select when they join.
              </p>
            </article>
            <article data-reveal className="card">
              <h3>Where in Nigeria does PeopTrust work?</h3>
              <p>
                PeopTrust covers Nigeria. Featured assignments on this site span
                Lagos, Abuja, Port Harcourt and Ogun.{" "}
                <Link href="/projects">See the featured assignments</Link>.
              </p>
            </article>
            <article data-reveal className="card">
              <h3>How much does it cost?</h3>
              <p>
                PeopTrust publishes no prices on this site. Project pricing is
                discussed per project —{" "}
                <Link href="/contact">contact the team</Link> with your
                requirements.
              </p>
            </article>
          </div>
          <Link
            className="text-link"
            href="/guides/how-to-hire-welders-in-nigeria"
          >
            Read the guide: How to Hire Welders for an Industrial Project in
            Nigeria →
          </Link>
        </div>
      </section>
    </>
  );
}
