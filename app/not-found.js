import Link from "next/link";

/**
 * State 3 (not found) — a page that does not exist explains itself and
 * points at the places people usually want instead.
 */
export default function NotFound() {
  return (
    <section className="section">
      <div className="container narrow">
        <div className="card empty-card">
          <p className="eyebrow">404</p>
          <h2>We could not find that page</h2>
          <p>
            The link may be old, or the page may have moved. The role or
            profile you were looking for might also have been removed.
          </p>
          <div className="state-actions">
            <Link href="/jobs" className="btn btn-primary">
              Browse jobs
            </Link>
            <Link href="/" className="btn btn-ghost">
              Go to home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
