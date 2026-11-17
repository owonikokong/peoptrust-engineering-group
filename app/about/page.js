import Link from "next/link";

export const metadata = {
  title: "About — PeopTrust Engineering Group",
  description:
    "PeopTrust Engineering Group is a Nigerian engineering services and talent marketplace, built for Nigerian employers and professionals first.",
  alternates: { canonical: "/about" },
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
          <p className="eyebrow">About us</p>
          <h1>PeopTrust Engineering Group</h1>
          <p className="lead">
            PeopTrust Engineering Group bridges the gap between employers who
            need reliable technical capacity and skilled professionals who want
            credible opportunities. Our focus, for a start, is Nigeria: the
            employers, the professionals and the projects are Nigerian.
          </p>
          <div className="jobs-video-wrap">
            <video
              className="jobs-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/about/about-hero-poster.webp"
              aria-label="Animation introducing PeopTrust: people you can trust, engineering you can rely on"
            >
              <source src="/about/hero-video.mp4" type="video/mp4" />
            </video>
          </div>
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
            relationships. We focus on verified capability, clear requirements,
            safety and dependable delivery. Employers on PeopTrust come from
            Construction, Manufacturing, Energy &amp; Power, Oil &amp; Gas,
            Civil Infrastructure, and Facilities &amp; Maintenance.
          </p>

          <div className="jobs-video-wrap about-values-video">
            <video
              className="jobs-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/about/about-values-poster.webp"
              aria-label="Animation of PeopTrust's four values: People First, Verified Skills, Safety Always, Dependable Delivery"
            >
              <source src="/about/values-video.mp4" type="video/mp4" />
            </video>
          </div>

          <h2 style={{ marginTop: "48px" }}>What we value</h2>
          <div className="grid grid-4">
            {values.map((value) => (
              <article
                data-reveal
                className="card service-card"
                key={value.title}
              >
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">Inside the marketplace</p>
          <h2>What a profile shows</h2>
          <p className="lead">
            Each profile carries the details the other side needs to judge fit:
            the trade, the skills and the experience.
          </p>
          <div className="grid grid-2">
            <article data-reveal className="card">
              <h3>Professional profiles show</h3>
              <ul className="check-list">
                <li>Trade or skill area</li>
                <li>Key skills</li>
                <li>Years of experience</li>
                <li>Availability</li>
                <li>Professional summary and previous experience</li>
                <li>Certifications and a CV link</li>
              </ul>
            </article>
            <article data-reveal className="card">
              <h3>Employer accounts show</h3>
              <ul className="check-list">
                <li>Company name and contact person</li>
                <li>Industry</li>
                <li>Company size</li>
                <li>Company location</li>
                <li>Company website</li>
                <li>Company description</li>
              </ul>
            </article>
          </div>
          <Link className="text-link" href="/register">
            Create your account →
          </Link>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <p className="eyebrow">Built for Nigeria, for a start</p>
          <h2>Nigerian employers, Nigerian professionals</h2>
          <p className="lead">
            PeopTrust is a Nigerian marketplace. The industries, the trades and
            the examples on this site are Nigerian, and the service is built
            around how work gets done in Nigeria. Featured assignments span four
            locations:
          </p>
          <div className="tag-row" style={{ marginTop: "28px" }}>
            <span className="tag">Lagos</span>
            <span className="tag">Abuja</span>
            <span className="tag">Port Harcourt</span>
            <span className="tag">Ogun</span>
          </div>
          <Link className="text-link" href="/projects">
            See the featured assignments →
          </Link>
        </div>
      </section>
    </>
  );
}
