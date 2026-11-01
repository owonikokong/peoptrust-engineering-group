import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "../../lib/auth";
import {
  listApplicationsForEmployer,
  listApplicationsForUser,
  listJobsByEmployer,
} from "../../lib/store";
import LogoutButton from "../components/LogoutButton";
import PostJobForm from "../components/PostJobForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard — PeopTrust Engineering Group",
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ProfileRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="profile-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <section className="section">
      <div className="container">
        <div className="dash-head">
          <div>
            <p className="eyebrow">
              {user.role === "employer" ? "Employer dashboard" : "Professional dashboard"}
            </p>
            <h2>
              Welcome, {user.role === "employer" ? user.companyName : user.name}
            </h2>
          </div>
          <LogoutButton />
        </div>

        {user.role === "professional" ? (
          <ProfessionalDashboard user={user} />
        ) : (
          <EmployerDashboard user={user} />
        )}
      </div>
    </section>
  );
}

async function ProfessionalDashboard({ user }) {
  const applications = await listApplicationsForUser(user.id);

  return (
    <div className="dash-grid">
      <div className="card">
        <h3>My profile</h3>
        <ProfileRow label="Name" value={user.name} />
        <ProfileRow label="Trade" value={user.trade} />
        <ProfileRow
          label="Experience"
          value={
            user.experience === null || user.experience === undefined
              ? ""
              : `${user.experience} year${user.experience === 1 ? "" : "s"}`
          }
        />
        <ProfileRow label="Location" value={user.location} />
        <ProfileRow label="Phone" value={user.phone} />
        <ProfileRow label="Email" value={user.email} />
        <Link href="/jobs" className="btn btn-primary dash-cta">
          Browse jobs
        </Link>
      </div>

      <div className="card">
        <h3>Jobs I applied to</h3>
        {applications.length === 0 ? (
          <p>
            You have not applied to any jobs yet.{" "}
            <Link href="/jobs">Browse open roles</Link> and apply with one
            click.
          </p>
        ) : (
          <ul className="dash-list">
            {applications.map((application) => (
              <li key={application.id}>
                <div>
                  <strong>{application.jobTitle}</strong>
                  <span className="dash-sub">
                    {application.companyName}
                    {application.jobLocation ? ` · ${application.jobLocation}` : ""}
                  </span>
                </div>
                <div className="dash-meta">
                  <span className="tag">{application.status}</span>
                  <span className="job-date">{formatDate(application.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

async function EmployerDashboard({ user }) {
  const jobs = await listJobsByEmployer(user.id);
  const applications = await listApplicationsForEmployer(user.id);
  const byJob = new Map();
  for (const application of applications) {
    if (!byJob.has(application.jobId)) byJob.set(application.jobId, []);
    byJob.get(application.jobId).push(application);
  }

  return (
    <div className="dash-grid">
      <div>
        <div className="card">
          <h3>Company</h3>
          <ProfileRow label="Company" value={user.companyName} />
          <ProfileRow label="Industry" value={user.industry} />
          <ProfileRow label="Contact" value={user.name} />
          <ProfileRow label="Location" value={user.location} />
          <ProfileRow label="Phone" value={user.phone} />
          <ProfileRow label="Email" value={user.email} />
        </div>

        <div className="card dash-section">
          <h3>Post a job</h3>
          <PostJobForm />
        </div>
      </div>

      <div className="card">
        <h3>My posted jobs</h3>
        {jobs.length === 0 ? (
          <p>No jobs posted yet. Use the form to publish your first role — it will appear on the Jobs page immediately.</p>
        ) : (
          <ul className="dash-list">
            {jobs.map((job) => (
              <li key={job.id} className="dash-job">
                <div className="dash-job-head">
                  <div>
                    <strong>
                      <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                    </strong>
                    <span className="dash-sub">
                      {job.category} · {job.location} · {job.type}
                    </span>
                  </div>
                  <span className="tag">
                    {job.applicantCount} applicant{job.applicantCount === 1 ? "" : "s"}
                  </span>
                </div>
                {(byJob.get(job.id) || []).length > 0 && (
                  <ul className="applicant-list">
                    {byJob.get(job.id).map((application) => (
                      <li key={application.id}>
                        <strong>{application.applicantName}</strong>
                        {application.applicantTrade && (
                          <span> · {application.applicantTrade}</span>
                        )}
                        <span className="job-date">
                          {" "}
                          · {formatDate(application.createdAt)}
                        </span>
                        {application.coverNote && (
                          <p className="cover-note">“{application.coverNote}”</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
