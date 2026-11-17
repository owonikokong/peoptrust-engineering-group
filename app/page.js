import Link from "next/link";
import DemoMount from "./components/DemoMount";
import HeroSceneLazy from "./components/HeroSceneLazy";
import { services, projects } from "../lib/data";
import { TRADES } from "../lib/options";

export const metadata = {
  alternates: { canonical: "/" },
};

const bandStats = [
  { value: "100+", label: "Professional & project connections" },
  { value: "6", label: "Core service areas" },
  { value: "2021", label: "Founded" },
  { value: "Nigeria-wide", label: "Coverage" },
];

const steps = [
  {
    title: "Create your profile / Post a job",
    text: "Professionals create a profile showing trade, key skills, years of experience, availability, certifications and a CV link; employers post the roles and projects they need filled, with company, industry and size.",
  },
  {
    title: "Get matched",
    text: "We connect employers with verified professionals whose skills fit the work at hand.",
  },
  {
    title: "Work & deliver",
    text: "Teams get to work with clear requirements, safe practice and dependable delivery.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-scene" aria-hidden="true">
          <HeroSceneLazy />
        </div>
        <div className="container">
          <h1>
            Building tomorrow with people, skills and sustainable solutions
          </h1>
          <p className="lead">
            PeopTrust Engineering Group is built for Nigeria. Employers here
            connect with verified engineering professionals, and get the
            technical services, equipment and project support Nigerian projects
            need.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/jobs">
              Browse jobs
            </Link>
            <Link className="btn btn-outline-white" href="/register">
              Post a job
            </Link>
          </div>
          <p className="hero-verified">
            <span>
              <span className="tick">✓</span>Verified professionals
            </span>
            <span>
              <span className="tick">✓</span>Verified employers
            </span>
          </p>
        </div>
      </section>

      {/* Marketplace strip */}
      <section className="section section-navy">
        <div className="container">
          <p className="eyebrow">Engineering marketplace</p>
          <h2>People, skills and projects</h2>
          <p className="lead">
            One platform for skilled workers, employers and engineering
            solutions — serving Construction, Manufacturing, Energy &amp; Power,
            Oil &amp; Gas, Civil Infrastructure, and Facilities &amp;
            Maintenance across Nigeria.
          </p>
          <div className="stats stats-band">
            {bandStats.map((stat) => (
              <div className="stat" key={stat.label}>
                <p className="stat-value">{stat.value}</p>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="container">
          <p className="eyebrow">Our services</p>
          <h2>Engineering services across Nigeria</h2>
          <p className="lead">
            From concept to completion, our network supports construction,
            industrial, mechanical, electrical and technical work across
            Nigeria.
          </p>
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
                <Link className="card-link" href="/services">
                  Learn more →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trades */}
      <section className="section">
        <div className="container">
          <p className="eyebrow">Trades &amp; skill areas</p>
          <h2>Find the trade your project needs</h2>
          <p className="lead">
            Every professional profile names a trade or skill area, with key
            skills, years of experience and availability — so an employer in
            Nigeria can see at a glance who does the work the project needs.
          </p>
          <div className="tag-row" style={{ marginTop: "28px" }}>
            {TRADES.filter((trade) => trade !== "Other").map((trade) => (
              <span className="tag" key={trade}>
                {trade}
              </span>
            ))}
          </div>
          <Link className="text-link" href="/services">
            See the six service areas →
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="section section-soft">
        <div className="container">
          <p className="eyebrow">How it works</p>
          <h2>From profile to project in three steps</h2>
          <p className="lead">
            Whether you are looking for work or looking to hire, getting started
            is straightforward.
          </p>
          <div className="steps">
            {steps.map((step, index) => (
              <article data-reveal className="step" key={step.title}>
                <span className="step-num">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Product demo (stageshow) */}
      <section className="section">
        <div className="container">
          <p className="eyebrow">See it in action</p>
          <h2>Post a job. Verified professionals apply.</h2>
          <p className="lead">
            This is the employer dashboard, doing its everyday work: a job goes
            up in under a minute, and every application that comes back is from
            a verified professional.
          </p>
          <div className="demo-wrap" data-reveal>
            <DemoMount />
          </div>
        </div>
      </section>

      {/* About teaser + stats */}
      <section className="section">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">About us</p>
              <h2>Who we are</h2>
              <p className="lead">
                PeopTrust Engineering Group is a forward-thinking engineering
                services and talent marketplace built around people, practical
                expertise and dependable delivery. We help organisations find
                the right professionals and help skilled workers access credible
                opportunities. Our focus, for a start, is Nigeria: Nigerian
                employers, Nigerian professionals and Nigerian projects.
              </p>
              <div className="points">
                <span>Professional Team</span>
                <span>Quality &amp; Safety</span>
                <span>Innovation</span>
                <span>Customer Focus</span>
              </div>
              <Link className="text-link" href="/about">
                Learn More About Us →
              </Link>
            </div>
            <img
              src="/about/team.jpg"
              alt="PeopTrust engineering team at work"
              className="split-img"
            />
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <section className="section section-soft">
        <div className="container">
          <p className="eyebrow">Featured projects</p>
          <h2>Our recent work</h2>
          <p className="lead">
            Explore project support, engineering services and technical teams
            coordinated through PeopTrust.
          </p>
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
                    className="project-img"
                  />
                  <span className="location-chip">{project.location}</span>
                </div>
                <div className="project-card-body">
                  <h3>{project.title}</h3>
                  <p>{project.text}</p>
                  <Link className="card-link" href="/projects">
                    View project →
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <Link className="text-link" href="/projects">
            View All Projects →
          </Link>
        </div>
      </section>

      {/* CTA band */}
      <section className="section section-cta">
        <div className="container">
          <p className="eyebrow">Join PeopTrust</p>
          <h2>Ready to build what&apos;s next?</h2>
          <p className="lead">
            Professionals find credible opportunities. Employers find verified
            skills. Start today.
          </p>
          <div className="cta-actions">
            <Link className="btn btn-white" href="/register">
              Join as a Professional
            </Link>
            <Link className="btn btn-outline-white" href="/register">
              Hire Talent
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
