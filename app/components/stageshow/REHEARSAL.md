# PeopTrust demo — rehearsal notes

**Gold copied:** `examples/hero-demo` (sidebar window, cursor choreography,
poster = payoff, compact redesign). Story and look replaced with PeopTrust's:
an employer posts a job from the real dashboard's anatomy, and verified
applications arrive. Form-over-list composition: the post-a-job form opens
above the jobs panel instead of swapping the screen, so the dashboard never
leaves and the Count never remounts.

**Look:** the product's own tokens — navy sidebar #0b1f3a (the real account
sidebar), warm paper ground #f6f6f2, green #0e7a4f for the one accent,
amber #f2a81d reserved for the Verified badge only (the site's own rule),
IBM Plex Sans. Fidelity: standard — real words only on the story (the job,
the three applicants), bars elsewhere.

**Gate:** `film.mjs --gate` → "rehearsal passed" (run 4). Verdict stays
"inconclusive" only because this sandbox drops sampling frames (134 gaps
>27ms in run 1); the full loop was reviewed frame-by-frame from contact
sheets at both widths instead.

**Findings accepted, with reasons:**
- *dark slab* (navy sidebar in a light window): the product's real chrome;
  fidelity to the product beats the one-theme heuristic.
- *Field jump / settle snap* lines: the detector reads each keystroke's
  width growth and the kit caret's remount cycle; inherent to typing into
  a kit Field, shared by the gold form demos.
- *Count appears with no entrance*: fires at the loop reset, where Count
  jumps inside a snap by design (kit.md).
- *half-pixel glyph* on the Verified badge: the badge's width parity flips
  with font metrics (fallback font here, IBM Plex Sans on the site);
  sub-pixel, invisible in motion.
- *layout leaves -72px* in the form state: the pushed-down panels are
  clipped by the window on purpose — that crop is the frame.
- *near aligned* (compact, URL pill vs title): the kit's centered URL pill
  is the sanctioned quiet-browser chrome (craft.md).

**Checked:** poster at both widths (payoff state, result on screen);
compact sheet — every beat lands at 358px, reset fades with a visible
cause; loop seam and cursor-cover findings fixed (rest target centred,
presses aimed off the labels at x 0.86–0.87).

**Not checked:** the demo inside the host page at intermediate widths
between 720 and 390 (the stage scales the wide design there by design);
sound — none, by intent.
