import Link from "next/link";
import { isVerified } from "../../lib/store";
import LogoutButton from "./LogoutButton";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * The account panel shown on both signed-in pages. Overview (/dashboard)
 * and Profile (/account) are separate pages; `active` marks the current one.
 */
export default function AccountSidebar({ user, active }) {
  const isEmployer = user.role === "employer";
  const displayName = isEmployer ? user.companyName || user.name : user.name;
  const verified = isVerified(user);

  return (
    <aside className="card account-side">
      <div className="account-id">
        <span className="account-avatar" aria-hidden="true">
          {(displayName || "P").trim().charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="account-name">{displayName}</p>
          <p className="account-role">
            {isEmployer ? "Employer account" : "Professional account"}
          </p>
        </div>
      </div>

      <dl className="account-facts">
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt>Member since</dt>
          <dd>{formatDate(user.createdAt)}</dd>
        </div>
        <div>
          <dt>Email status</dt>
          <dd>
            {verified ? (
              <>
                <span className="tick">{"\u2713"}</span> Verified
              </>
            ) : (
              <Link href="/verify">Not verified {"\u2014"} confirm your email</Link>
            )}
          </dd>
        </div>
      </dl>

      <nav className="account-nav" aria-label="Account">
        {active === "overview" ? (
          <span className="account-nav-active" aria-current="page">
            Overview
          </span>
        ) : (
          <Link href="/dashboard">Overview</Link>
        )}
        {active === "profile" ? (
          <span className="account-nav-active" aria-current="page">
            Profile
          </span>
        ) : (
          <Link href="/account">Profile</Link>
        )}
        {isEmployer ? (
          <a href={active === "overview" ? "#post-job" : "/dashboard#post-job"}>
            Post a job
          </a>
        ) : (
          <Link href="/jobs">Browse jobs</Link>
        )}
        <LogoutButton className="account-nav-logout" />
      </nav>
    </aside>
  );
}
