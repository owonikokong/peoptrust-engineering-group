import Link from "next/link";

/** Shown on the dashboard while the account's email is unconfirmed. */
export default function VerifyBanner({ email }) {
  return (
    <div className="verify-banner" role="alert">
      <div className="verify-banner-text">
        <strong>Confirm your email address</strong>
        <span>
          We sent a unique 6-digit code to {email}. Until you confirm it, you
          can browse but can&apos;t apply for jobs or post roles.
        </span>
      </div>
      <Link href="/verify" className="btn btn-primary">
        Enter code
      </Link>
    </div>
  );
}
