"use client";

import Link from "next/link";

/**
 * State 3 — Error. Branded, plain about what happened, and gives the two
 * useful next steps: try again, or go somewhere that works.
 */
export default function ErrorPage({ reset }) {
  return (
    <section className="section">
      <div className="container narrow">
        <div className="card empty-card">
          <p className="eyebrow">Something went wrong</p>
          <h2>This page did not load</h2>
          <p>
            Sorry — something failed on our side while loading this page. It
            is usually temporary. Try again, and if it keeps happening, come
            back in a few minutes.
          </p>
          <div className="state-actions">
            <button type="button" className="btn btn-primary" onClick={() => reset()}>
              Try again
            </button>
            <Link href="/" className="btn btn-ghost">
              Go to home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
