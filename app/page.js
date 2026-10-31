import Link from "next/link";
import HeroSceneLazy from "./components/HeroSceneLazy";
import { services, projects } from "../lib/data";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-scene" aria-hidden="true">
          <HeroSceneLazy />
        </div>
        <div className="container">
          <p className="eyebrow">Welcome to PeopTrust</p>
          <h1>
            Building tomorrow with <em>people, skills</em> and sustainable
            solutions.
          </h1>
          <p className="lead">
            PeopTrust Engineering Group connects employers with capable
            engineering professionals while delivering reliable technical
            services, equipment and project support.
          </p>
          <div className="badges">
            <span className="badge">✓ Verified talent</span>
            <span className="badge">✓ Technical expertise</span>
            <span className="badge">✓ Project focused</span>
          </div>
        </div>
      </section>

      {/* Marketplace strip */}
      <section className="section section-navy">
        <div className="container">
          <p className="eyebrow">Engineering Marketplace</p>
          <h2>People + Skills + Projects</h2>
          <p className="lead">
            One platform for skilled workers, employers and engineering
            solutions.
          </p>
          <p className="marketplace-stat">
            <strong>100+</strong> professional &amp; project connections
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="container">
          <p className="eyebrow">Our Services</p>
          <h2>Engineering solutions for a better future</h2>
          <p className="lead">
            From concept to completion, our network supports construction,
            industrial, mechanical, electrical and technical work across
            Nigeria.
          </p>
          <div className="grid grid-3">
            {services.map((service) => (
              <article className="card" key={service.title}>
                <span className="icon">{service.icon}</span>
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

      {/* About teaser + stats */}
      <section className="section section-soft">
        <div className="container">
          <p className="eyebrow">About Us</p>
          <h2>Who we are</h2>
          <p className="lead">
            PeopTrust Engineering Group is a forward-thinking engineering
            services and talent marketplace built around people, practical
            expertise and dependable delivery. We help organisations find the
            right professionals and help skilled workers access credible
            opportunities.
          </p>
          <div className="points">
            <span>◉ Professional Team</span>
            <span>◉ Quality &amp; Safety</span>
            <span>◉ Innovation</span>
            <span>◉ Customer Focus</span>
          </div>
          <Link className="text-link" href="/about">
            Learn More About Us →
          </Link>

          <div className="stats">
            <div className="stat">
              <p className="stat-value">100+</p>
              <p className="stat-label">Projects &amp; assignments</p>
            </div>
            <div className="stat">
              <p className="stat-value">50+</p>
              <p className="stat-label">Skilled professionals</p>
            </div>
            <div className="stat">
              <p className="stat-value">5+</p>
              <p className="stat-label">Years of experience</p>
            </div>
            <div className="stat">
              <p className="stat-value">100%</p>
              <p className="stat-label">Commitment to quality</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <section className="section">
        <div className="container">
          <p className="eyebrow">Featured Projects</p>
          <h2>Our recent work</h2>
          <p className="lead">
            Explore project support, engineering services and technical teams
            coordinated through PeopTrust.
          </p>
          <div className="grid grid-2">
            {projects.map((project) => (
              <article className="card project-card" key={project.title}>
                <p className="location">{project.location}</p>
                <h3>{project.title}</h3>
                <p>{project.text}</p>
                <Link className="card-link" href="/projects">
                  View project →
                </Link>
              </article>
            ))}
          </div>
          <Link className="text-link" href="/projects">
            View All Projects →
          </Link>
        </div>
      </section>
    </>
  );
}
