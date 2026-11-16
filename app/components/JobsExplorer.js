"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Light edit distance for "did you mean" suggestions on short queries. */
function editDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const row = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const cur = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = cur;
    }
  }
  return row[n];
}

export default function JobsExplorer({ jobs }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");

  const categories = useMemo(
    () => [
      "All categories",
      ...Array.from(new Set(jobs.map((j) => j.category))).sort(),
    ],
    [jobs],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      if (category !== "All categories" && job.category !== category)
        return false;
      if (!q) return true;
      const haystack = [
        job.title,
        job.companyName,
        job.category,
        job.location,
        job.type,
      ]
        .join(" ")
        .toLowerCase();
      return q.split(/\s+/).every((word) => haystack.includes(word));
    });
  }, [jobs, query, category]);

  // State 6 — when a search finds nothing, suggest the closest real word
  // used on the site (a category, location or title word) so a typo like
  // "weldre" still leads somewhere useful.
  const suggestion = useMemo(() => {
    if (results.length > 0 || !query.trim()) return null;
    const words = new Set();
    for (const job of jobs) {
      for (const text of [job.category, job.location, job.title]) {
        for (const w of String(text)
          .toLowerCase()
          .split(/[^a-z]+/)) {
          if (w.length >= 4) words.add(w);
        }
      }
    }
    let best = null;
    let bestDist = 3; // only suggest when genuinely close
    for (const token of query.trim().toLowerCase().split(/\s+/)) {
      for (const w of words) {
        const d = editDistance(token, w);
        if (d < bestDist) {
          bestDist = d;
          best = w;
        }
      }
    }
    return best;
  }, [results, query, jobs]);

  function clearAll() {
    setQuery("");
    setCategory("All categories");
  }

  return (
    <>
      <div className="jobs-toolbar card">
        <div className="field jobs-search">
          <label htmlFor="job-search">Search roles</label>
          <input
            id="job-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try a trade, company or place — e.g. welder, Lagos"
          />
        </div>
        <div className="field jobs-filter">
          <label htmlFor="job-category-filter">Category</label>
          <select
            id="job-category-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <p className="jobs-count" role="status">
          {results.length} of {jobs.length} role{jobs.length === 1 ? "" : "s"}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="card empty-card">
          <h3>No roles match that search</h3>
          <p>
            Nothing on the marketplace matches
            {query.trim() ? (
              <>
                {" "}
                “<strong>{query.trim()}</strong>”
              </>
            ) : (
              ""
            )}
            {category !== "All categories" ? <> in {category}</> : ""} right
            now. Check the spelling, try a shorter word, or browse everything.
          </p>
          {suggestion && (
            <p>
              Did you mean{" "}
              <button
                type="button"
                className="link-button"
                onClick={() => setQuery(suggestion)}
              >
                {suggestion}
              </button>
              ?
            </p>
          )}
          <div className="state-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={clearAll}
            >
              Show all roles
            </button>
            <Link href="/register" className="btn btn-ghost">
              Create an account for new-role alerts
            </Link>
          </div>
        </div>
      ) : (
        <div className="job-list">
          {results.map((job) => (
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
    </>
  );
}
