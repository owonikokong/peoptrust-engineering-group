import Link from "next/link";
import { notFound } from "next/navigation";
import { findApplication, getJob } from "../../../lib/store";
import { getSessionUser } from "../../../lib/auth";
import ApplyForm from "../../components/ApplyForm";

export const dynamic = "force-dynamic";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function JobDetailPage({ params }) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  const user = await getSessionUser();
  const alreadyApplied =
    user?.role === "professional"
      ? Boolean(await findApplication(user.id, job.id))
      : false;

  return (
    <section className="section">
      <div className="container narrow">
        <p className="eyebrow">{job.category}</p>
        <h1>{job.title}</h1>
        <p className="job-company">{job.companyName}</p>
        <div className="tag-row">
          <span className="tag">{job.category}</span>
          <span className="tag tag-soft">{job.location}</span>
          <span className="tag tag-soft">{job.type}</span>
          <span className="tag tag-soft">Posted {formatDate(job.createdAt)}</span>
        </div>

        <div className="job-body">
          <h3>About this role</h3>
          <p>{job.description}</p>
          {job.requirements && (
            <>
              <h3>Requirements</h3>
              <p>{job.requirements}</p>
            </>
          )}
        </div>

        <div className="card apply-card">
          <h3>Apply for this role</h3>
          {!user && (
            <>
              <p>You need a professional account to apply for jobs.</p>
              <Link href="/login" className="btn btn-primary">
                Log in to apply
              </Link>{" "}
              <Link href="/register" className="btn btn-outline">
                Create account
              </Link>
            </>
          )}
          {user && user.role === "employer" && (
            <p>Employer accounts cannot apply for jobs. Log in with a professional account to apply.</p>
          )}
          {user && user.role === "professional" && !alreadyApplied && (
            <ApplyForm jobId={job.id} />
          )}
          {user && user.role === "professional" && alreadyApplied && (
            <p className="alert alert-success">
              You have already applied for this job. Track it in your{" "}
              <Link href="/dashboard">dashboard</Link>.
            </p>
          )}
        </div>

        <p className="back-link">
          <Link href="/jobs">← Back to all jobs</Link>
        </p>
      </div>
    </section>
  );
}
