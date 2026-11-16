/**
 * States 2 + 5 — Loading / slow network. Shown by Next.js while a page's
 * data loads, so a slow connection shows the page's shape (skeletons)
 * instead of a blank screen or a lone spinner.
 */
export default function Loading() {
  return (
    <section className="section" aria-busy="true" aria-label="Loading page">
      <div className="container">
        <div className="skel skel-eyebrow" />
        <div className="skel skel-title" />
        <div className="skel skel-line" style={{ width: "62%" }} />
        <div className="skel-grid">
          <div className="card skel-card">
            <div className="skel skel-line" style={{ width: "48%" }} />
            <div className="skel skel-line" />
            <div className="skel skel-line" style={{ width: "76%" }} />
            <div className="skel skel-pill" />
          </div>
          <div className="card skel-card">
            <div className="skel skel-line" style={{ width: "48%" }} />
            <div className="skel skel-line" />
            <div className="skel skel-line" style={{ width: "76%" }} />
            <div className="skel skel-pill" />
          </div>
          <div className="card skel-card">
            <div className="skel skel-line" style={{ width: "48%" }} />
            <div className="skel skel-line" />
            <div className="skel skel-line" style={{ width: "76%" }} />
            <div className="skel skel-pill" />
          </div>
        </div>
        <p className="skel-note">
          Loading… if this takes a while, your connection may be slow — the page
          will appear as soon as it can.
        </p>
      </div>
    </section>
  );
}
