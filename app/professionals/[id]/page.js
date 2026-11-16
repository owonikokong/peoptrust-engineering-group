import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "../../../lib/auth";
import { findUserById, isVerified } from "../../../lib/store";
import { canViewDossier } from "../../../lib/states";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const pro = await findUserById(id);
  return {
    title: pro
      ? `${pro.name} \u2014 PeopTrust Engineering Group`
      : "Professional \u2014 PeopTrust Engineering Group",
  };
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ProfessionalPage({ params }) {
  const viewer = await getSessionUser();
  if (!viewer) redirect("/login");

  const { id } = await params;
  const pro = await findUserById(id);
  if (!pro || pro.role !== "professional") notFound();

  const verified = isVerified(pro);
  const isEmployer = viewer.role === "employer";
  const isSelf = viewer.id === pro.id;
  // Rule (lib/states guard): the full experience / CV / certifications
  // dossier is visible only to employers (and to the professional
  // themselves). Other professionals see the public summary only.
  const showDossier = canViewDossier(viewer, pro);
  const certLines = String(pro.certifications || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const telHref = pro.phone ? `tel:${pro.phone.replace(/[^+0-9]/g, "")}` : null;
  const mailHref = `mailto:${pro.email}?subject=${encodeURIComponent(
    `PeopTrust enquiry \u2014 ${pro.trade || "your profile"}`,
  )}`;

  return (
    <section className="section">
      <div className="container pro-wrap">
        <p className="eyebrow">Skilled professional</p>

        <div className="card pro-head">
          <span className="account-avatar pro-avatar" aria-hidden="true">
            {(pro.name || "P").trim().charAt(0).toUpperCase()}
          </span>
          <div className="pro-head-main">
            <h1>
              {pro.name}{" "}
              {verified ? (
                <span className="tick" title="Email verified">
                  {"\u2713"}
                </span>
              ) : null}
            </h1>
            <p className="pro-trade">{pro.trade}</p>
            <div className="dash2-chips pro-chips">
              {pro.location ? (
                <span className="dash2-chip chip-light">{pro.location}</span>
              ) : null}
              {pro.experience !== null && pro.experience !== undefined ? (
                <span className="dash2-chip chip-light">
                  {pro.experience} year{pro.experience === 1 ? "" : "s"}{" "}
                  experience
                </span>
              ) : null}
              {pro.availability ? (
                <span className="dash2-chip chip-light">
                  {pro.availability}
                </span>
              ) : null}
              <span className="dash2-chip chip-light">
                Member since {formatDate(pro.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {isEmployer ? (
          <div
            className="contact-tabs"
            role="group"
            aria-label="Contact this professional"
          >
            {telHref ? (
              <a className="contact-tab" href={telHref}>
                <span className="contact-tab-label">Call now</span>
                <span className="contact-tab-value">{pro.phone}</span>
              </a>
            ) : (
              <span
                className="contact-tab contact-tab-disabled"
                aria-disabled="true"
              >
                <span className="contact-tab-label">Call now</span>
                <span className="contact-tab-value">
                  No phone number provided
                </span>
              </span>
            )}
            <a className="contact-tab contact-tab-primary" href={mailHref}>
              <span className="contact-tab-label">Email now</span>
              <span className="contact-tab-value">{pro.email}</span>
            </a>
          </div>
        ) : null}

        {isSelf ? (
          <p className="pro-note">
            This is how employers see your profile.{" "}
            <Link href="/account">Update your details</Link> any time.
          </p>
        ) : null}

        <div className="card pro-details">
          {pro.skills ? (
            <div className="profile-summary">
              <span>Key skills</span>
              <p>{pro.skills}</p>
            </div>
          ) : null}
          {pro.summary ? (
            <div className="profile-summary">
              <span>About</span>
              <p>{pro.summary}</p>
            </div>
          ) : null}
          {!pro.skills && !pro.summary ? (
            <p>This professional has not added skills or a summary yet.</p>
          ) : null}
        </div>

        {showDossier ? (
          <div className="card pro-details pro-dossier">
            <div className="profile-summary">
              <span>Experience</span>
              <p>
                {pro.experience !== null && pro.experience !== undefined
                  ? `${pro.experience} year${pro.experience === 1 ? "" : "s"} of experience.`
                  : "Experience not stated yet."}
              </p>
            </div>
            <div className="profile-summary">
              <span>Previous experience</span>
              {pro.previousExperience ? (
                <p className="pro-pre">{pro.previousExperience}</p>
              ) : (
                <p className="pro-empty">Not provided yet.</p>
              )}
            </div>
            <div className="profile-summary">
              <span>Certifications</span>
              {certLines.length > 0 ? (
                <ul className="pro-cert-list">
                  {certLines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="pro-empty">None provided yet.</p>
              )}
            </div>
            <div className="profile-summary">
              <span>CV</span>
              {pro.cvUrl ? (
                <p>
                  <a
                    className="btn btn-primary pro-cv-btn"
                    href={pro.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View CV
                  </a>{" "}
                  <span className="pro-cv-note">
                    Opens the CV link this professional provided.
                  </span>
                </p>
              ) : (
                <p className="pro-empty">No CV provided yet.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="pro-note">
            Full experience history, CV and certifications are visible to
            employers on PeopTrust.
          </p>
        )}

        <p className="pro-back">
          <Link href="/dashboard">{"\u2190"} Back to your dashboard</Link>
        </p>
      </div>
    </section>
  );
}
