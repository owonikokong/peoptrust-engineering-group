import Link from "next/link";
import { listJobs } from "../../lib/store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Jobs — PeopTrust Engineering Group",
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function JobsPage() {
  const jobs = await listJobs();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Jobs</p>
          <h1>Open engineering roles.</h1>
          <p className="lead">
            Roles posted by employers on the PeopTrust marketplace. Apply with
            your professional account.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {jobs.length === 0 ? (
            <div className="card empty-card">
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
            <div className="job-list">
              {jobs.map((job) => (
                <article key={job.id} className="card job-card">
                  <div className="job-card-main">
                    <h3>
                      <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                    </h3>
                    <p className="job-company">{job.companyName}</p>
                    <div className="tag-row">
                      <span className="tag">{job.category}</span>
                      <span className="tag tag-soft">{job.location}</span>
                      <span className="tag tag-soft">{job.type}</span>
                    </div>
                  </div>
                  <div className="job-card-side">
                    <span className="job-date">{formatDate(job.createdAt)}</span>
                    <Link href={`/jobs/${job.id}`} className="card-link">
                      View role →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
