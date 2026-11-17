import Link from "next/link";
import { listJobs } from "../../lib/store";
import JobsExplorer from "../components/JobsExplorer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Jobs — PeopTrust Engineering Group",
  description:
    "Browse open engineering jobs in Nigeria, posted by employers hiring through PeopTrust Engineering Group.",
  alternates: { canonical: "/jobs" },
};

export default async function JobsPage() {
  const jobs = await listJobs();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="jobs-video-wrap" style={{ marginTop: 8 }}>
            <video
              className="jobs-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/jobs/hero-poster.webp"
              aria-label="Animation showing example engineering roles on the PeopTrust marketplace"
            >
              <source src="/jobs/hero-video.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {jobs.length === 0 ? (
            <div className="card empty-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/jobs/empty-state.webp"
                alt=""
                className="empty-img"
                loading="lazy"
              />
              <h3>No jobs posted yet</h3>
              <p>
                Employers are joining the marketplace. Check back soon — or, if
                you are an employer, post the first role.
              </p>
              <Link href="/register" className="btn btn-primary">
                Post a job
              </Link>
            </div>
          ) : (
            <JobsExplorer jobs={jobs} />
          )}
        </div>
      </section>

      <section className="section section-tight">
        <div className="container jobs-cta">
          <div data-reveal className="card jobs-cta-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/jobs/job-seeker.webp"
              alt=""
              className="jobs-cta-img"
              loading="lazy"
            />
            <h3>Looking for work?</h3>
            <p>
              Create a professional account so employers can find you — and so
              you can apply the moment a role opens.
            </p>
            <Link href="/register" className="btn btn-primary">
              Create your account
            </Link>
          </div>
          <div data-reveal className="card jobs-cta-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/jobs/hire-handshake.webp"
              alt=""
              className="jobs-cta-img"
              loading="lazy"
            />
            <h3>Hiring engineers?</h3>
            <p>
              Post a role on the marketplace and reach verified engineering
              professionals across Nigeria.
            </p>
            <Link href="/register" className="btn btn-ghost">
              Post a job
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
