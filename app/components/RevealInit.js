"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Scroll-reveal: adds .in to [data-reveal] elements as they enter the
// viewport. One entrance per element, one easing curve (see globals.css).
export default function RevealInit() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-reveal]:not(.in)"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 3) * 50}ms`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
