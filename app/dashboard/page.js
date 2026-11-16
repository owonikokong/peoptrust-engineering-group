import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser, SESSION_COOKIE } from "../../lib/auth";
import {
  listApplicationsForEmployer,
  listApplicationsForUser,
  listJobs,
  listJobsByEmployer,
} from "../../lib/store";
import AccountSidebar from "../components/AccountSidebar";
import CountUp from "../components/CountUp";
import DashSceneLazy from "../components/DashSceneLazy";
import LogoutButton from "../components/LogoutButton";
import PostJobForm from "../components/PostJobForm";
import VerifyBanner from "../components/VerifyBanner";

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

function withinDays(iso, days) {
  const then = new Date(iso).getTime();
  return Date.now() - then <= days * 24 * 60 * 60 * 1000;
}

function initials(name) {
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

const AVATAR_HUES = [152, 210, 32, 262, 190, 8];
function avatarHue(name) {
  let sum = 0;
  for (const ch of String(name || "")) sum += ch.charCodeAt(0);
  return AVATAR_HUES[sum % AVATAR_HUES.length];
}

function statusClass(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("shortlist") || s.includes("interview")) return "pill pill-green";
  if (s.includes("hire") || s.includes("offer") || s.includes("accept")) return "pill pill-solid";
  if (s.includes("reject") || s.includes("decline")) return "pill pill-red";
  return "pill pill-amber";
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

function KpiCard({ label, value, decimals = 0, suffix = "", hint, tone = "green" }) {
  return (
    <div className={`kpi-card kpi-${tone}`}>
      <span className="kpi-dot" aria-hidden="true" />
      <div className="kpi-value">
        <CountUp value={value} decimals={decimals} suffix={suffix} />
      </div>
      <div className="kpi-label">{label}</div>
      {hint ? <div className="kpi-hint">{hint}</div> : null}
    </div>
  );
}

function ProgressRing({ percent }) {
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  return (
    <div className="ring-wrap">
      <svg className="ring" width="104" height="104" viewBox="0 0 104 104">
        <circle className="ring-track" cx="52" cy="52" r={r} />
        <circle
          className="ring-fill"
          cx="52"
          cy="52"
          r={r}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="ring-label">
        <strong>{percent}%</strong>
        <span>complete</span>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    // State 8 — a session cookie that no longer validates means the
    // session expired; say so on the login page and offer the way back.
    // No cookie at all is just a signed-out visit.
    const store = await cookies();
    const hadSession = Boolean(store.get(SESSION_COOKIE)?.value);
    redirect(hadSession ? "/login?expired=1&next=/dashboard" : "/login");
  }

  const isEmployer = user.role === "employer";
  const displayName = isEmployer ? user.companyName : user.name;

  return (
    <section className="section dash2">
      <div className="container">
        <div className="dash2-hero">
          <div className="dash2-hero-copy">
            <p className="eyebrow eyebrow-light">
              {isEmployer ? "Employer dashboard" : "Professional dashboard"}
            </p>
            <h1>{displayName}</h1>
            <p className="dash2-hero-sub">
              {isEmployer
                ? "Your hiring pipeline, live — post roles, track applicants and find verified engineering talent."
                : "Your applications, profile strength and the freshest roles matched to your trade — all in one place."}
            </p>
            <div className="dash2-chips">
              <span className="dash2-chip">
                Member since {formatDate(user.createdAt)}
              </span>
              {user.location ? (
                <span className="dash2-chip">{user.location}</span>
              ) : null}
              {!isEmployer && user.trade ? (
                <span className="dash2-chip">{user.trade}</span>
              ) : null}
              {isEmployer && user.industry ? (
                <span className="dash2-chip">{user.industry}</span>
              ) : null}
            </div>
            <div className="dash2-hero-actions">
              {isEmployer ? (
                <a href="#post-job" className="btn btn-primary">
                  Post a job
                </a>
              ) : (
                <Link href="/jobs" className="btn btn-primary">
                  Browse jobs
                </Link>
              )}
              <LogoutButton />
            </div>
          </div>
          <div className="dash2-stage" aria-hidden="true">
            <DashSceneLazy />
          </div>
        </div>

        <div className="account-grid dash-merge">
          <AccountSidebar user={user} active="overview" />
          <div className="dash-merge-main">
            {user.emailVerified === false && (
              <VerifyBanner email={user.email} />
            )}

            {isEmployer ? (
              <EmployerDashboard user={user} />
            ) : (
              <ProfessionalDashboard user={user} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

async function ProfessionalDashboard({ user }) {
  const [applications, allJobs] = await Promise.all([
    listApplicationsForUser(user.id),
    listJobs(),
  ]);

  const employers = new Set(applications.map((a) => a.companyName)).size;
  const thisMonth = applications.filter((a) => withinDays(a.createdAt, 30)).length;
  const appliedJobIds = new Set(applications.map((a) => a.jobId));
  const freshRoles = allJobs.filter((j) => !appliedJobIds.has(j.id)).slice(0, 3);

  const profileFields = [
    user.name,
    user.trade,
    user.experience,
    user.location,
    user.phone,
    user.email,
    user.skills,
    user.availability,
    user.summary,
  ];
  const filled = profileFields.filter(
    (v) => v !== null && v !== undefined && String(v).trim() !== ""
  ).length;
  const completeness = Math.round((filled / profileFields.length) * 100);

  return (
    <>
      <div className="kpi-row">
        <KpiCard label="Applications sent" value={applications.length} tone="green" />
        <KpiCard label="Employers reached" value={employers} tone="navy" />
        <KpiCard
          label="Applied in last 30 days"
          value={thisMonth}
          tone="amber"
          hint={thisMonth > 0 ? "Keep the momentum going" : "New roles land weekly"}
        />
        <KpiCard label="Profile strength" value={completeness} suffix="%" tone="green" />
      </div>

      <div className="dash2-grid">
        <div className="dash2-main">
          <div className="card dash2-card">
            <div className="dash2-card-head">
              <h3>My applications</h3>
              <Link href="/jobs" className="card-link">
                Browse jobs →
              </Link>
            </div>
            {applications.length === 0 ? (
              <>
                <p>
                  You have not applied to any jobs yet. This is where every
                  application and its status will appear once you do.
                </p>
                <Link href="/jobs" className="btn btn-primary dash-cta">
                  Browse open roles
                </Link>
              </>
            ) : (
              <ul className="app-timeline">
                {applications.map((application) => (
                  <li key={application.id} className="app-item">
                    <span className="app-node" aria-hidden="true" />
                    <div className="app-item-main">
                      <strong>{application.jobTitle}</strong>
                      <span className="dash-sub">
                        {application.companyName}
                        {application.jobLocation
                          ? ` · ${application.jobLocation}`
                          : ""}
                      </span>
                    </div>
                    <div className="dash-meta">
                      <span className={statusClass(application.status)}>
                        {application.status}
                      </span>
                      <span className="job-date">
                        {formatDate(application.createdAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {freshRoles.length > 0 && (
            <div className="card dash2-card">
              <div className="dash2-card-head">
                <h3>Fresh roles for you</h3>
                <Link href="/jobs" className="card-link">
                  View all →
                </Link>
              </div>
              <div className="fresh-grid">
                {freshRoles.map((job) => (
                  <article key={job.id} className="fresh-card">
                    <strong>
                      <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                    </strong>
                    <span className="dash-sub">{job.companyName}</span>
                    <div className="tag-row">
                      <span className="tag">{job.category}</span>
                      <span className="tag tag-soft">{job.location}</span>
                      <span className="tag tag-soft">{job.type}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          
        </div>

        <aside className="dash2-side">
          <div className="card dash2-card profile-card">
            <h3>My profile</h3>
            <ProgressRing percent={completeness} />
            {completeness < 100 ? (
              <p className="ring-tip">
                A complete profile helps employers trust and shortlist you
                faster.
              </p>
            ) : (
              <p className="ring-tip">
                Your profile is complete — you are putting your best foot
                forward.
              </p>
            )}
            <Link href="/account" className="btn btn-primary dash-cta">
              Edit profile
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}

async function EmployerDashboard({ user }) {
  const [jobs, applications] = await Promise.all([
    listJobsByEmployer(user.id),
    listApplicationsForEmployer(user.id),
  ]);
  const byJob = new Map();
  for (const application of applications) {
    if (!byJob.has(application.jobId)) byJob.set(application.jobId, []);
    byJob.get(application.jobId).push(application);
  }

  const newThisWeek = applications.filter((a) => withinDays(a.createdAt, 7)).length;
  const avgPerJob = jobs.length
    ? applications.length / jobs.length
    : 0;
  const recent = applications.slice(0, 5);

  return (
    <>
      <div className="kpi-row">
        <KpiCard label="Active job posts" value={jobs.length} tone="navy" />
        <KpiCard label="Total applicants" value={applications.length} tone="green" />
        <KpiCard
          label="New applicants · 7 days"
          value={newThisWeek}
          tone="amber"
          hint={newThisWeek > 0 ? "Your pipeline is moving" : "Share your roles to get seen"}
        />
        <KpiCard
          label="Avg applicants per job"
          value={avgPerJob}
          decimals={1}
          tone="green"
        />
      </div>

      {recent.length > 0 && (
        <div className="card dash2-card recent-strip">
          <div className="dash2-card-head">
            <h3>Recent applicants</h3>
            <span className="job-date">Latest across all your roles</span>
          </div>
          <ul className="recent-list">
            {recent.map((application) => (
              <li key={application.id} className="recent-item">
                <span
                  className="avatar"
                  style={{ backgroundColor: `hsl(${avatarHue(application.applicantName)} 45% 38%)` }}
                  aria-hidden="true"
                >
                  {initials(application.applicantName)}
                </span>
                <div className="recent-main">
                  <strong>{application.applicantName}</strong>
                  <span className="dash-sub">
                    applied for {application.jobTitle}
                    {application.applicantTrade
                      ? ` · ${application.applicantTrade}`
                      : ""}
                  </span>
                </div>
                <span className="job-date">{formatDate(application.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="dash2-grid">
        <div className="dash2-main">
          <div className="card dash2-card">
            <div className="dash2-card-head">
              <h3>My posted jobs</h3>
              <a href="#post-job" className="card-link">
                Post another →
              </a>
            </div>
            {jobs.length === 0 ? (
              <p>
                No jobs posted yet. Use the form to publish your first role —
                it will appear on the Jobs page immediately.
              </p>
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
                          {job.category} · {job.location} · {job.type} ·{" "}
                          {formatDate(job.createdAt)}
                        </span>
                      </div>
                      <span className="tag tag-count">
                        {job.applicantCount} applicant
                        {job.applicantCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    {(byJob.get(job.id) || []).length > 0 && (
                      <ul className="applicant-list">
                        {byJob.get(job.id).map((application) => (
                          <li key={application.id}>
                            <span
                              className="avatar avatar-sm"
                              style={{ backgroundColor: `hsl(${avatarHue(application.applicantName)} 45% 38%)` }}
                              aria-hidden="true"
                            >
                              {initials(application.applicantName)}
                            </span>
                            <div>
                              <strong>
                                <Link href={`/professionals/${application.userId}`}>
                                  {application.applicantName}
                                </Link>
                              </strong>
                              {application.applicantTrade && (
                                <span> · {application.applicantTrade}</span>
                              )}
                              <span className="job-date">
                                {" "}
                                · {formatDate(application.createdAt)}
                              </span>
                              {application.coverNote && (
                                <p className="cover-note">
                                  “{application.coverNote}”
                                </p>
                              )}
                            </div>
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

        <aside className="dash2-side">
          <div className="card dash2-card">
            <h3>Company</h3>
            <p>
              <strong>{user.companyName}</strong>
            </p>
            {user.industry ? (
              <p className="dash-sub">
                {user.industry}
                {user.location ? ` \u00b7 ${user.location}` : ""}
              </p>
            ) : null}
            <Link href="/account" className="btn btn-primary dash-cta">
              Edit company profile
            </Link>
          </div>

          <div className="card dash2-card" id="post-job">
            <h3>Post a job</h3>
            <PostJobForm />
          </div>
        </aside>
      </div>
    </>
  );
}
