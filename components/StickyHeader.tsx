"use client";

import { useEffect, useRef } from "react";
import { Header, HeaderProps } from "./Header";

/** Scroll distance (px) over which the header fully collapses. */
const RANGE = 240;
/** Fallback collapsed bar height (px) until the compact layer is measured. */
const H_MIN = 64;

/**
 * Scroll-linked collapsing header.
 *
 * Anti-flicker design:
 * - A single continuous progress `--p` (0→1) is written to a CSS variable from a
 *   rAF-throttled passive scroll listener — no React re-render per frame, no
 *   binary threshold to bounce across.
 * - The animated bar is `position: fixed` (out of flow) and an in-flow spacer of
 *   constant, measured height reserves the expanded space. Document height never
 *   depends on scroll, so there is no scroll→layout→scroll feedback loop.
 * - Expanded and compact states are two always-mounted layers that crossfade via
 *   opacity (no `display` toggle), so nothing pops in/out.
 */
export function StickyHeader(props: HeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const compactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const expanded = expandedRef.current;
    const compact = compactRef.current;
    if (!root || !expanded || !compact) return;

    let raf = 0;

    // Measure natural heights -> drive the constant spacer (h-max) and the
    // collapse target (h-min). offsetHeight ignores transforms, so both stay
    // stable across the scroll animation and adapt per breakpoint on resize.
    const measure = () => {
      const hMax = expanded.offsetHeight;
      const hMin = compact.offsetHeight;
      if (hMax > 0) root.style.setProperty("--h-max", `${hMax}px`);
      if (hMin > 0) root.style.setProperty("--h-min", `${hMin}px`);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(expanded);
    ro.observe(compact);
    measure();

    const update = () => {
      const p = Math.min(window.scrollY / RANGE, 1);
      root.style.setProperty("--p", p.toFixed(4));
      // Hand off interactivity at the crossfade midpoint (no visual effect).
      const collapsed = p > 0.5;
      expanded.style.pointerEvents = collapsed ? "none" : "auto";
      compact.style.pointerEvents = collapsed ? "auto" : "none";
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      style={
        {
          "--p": 0,
          "--h-min": `${H_MIN}px`,
          "--h-max": "280px",
        } as React.CSSProperties
      }
    >
      <div
        className="sticky-bar fixed top-0 inset-x-0 z-50 bg-[#f9b800] overflow-hidden will-change-[height]"
        style={{
          height:
            "calc(var(--h-min) + (var(--h-max) - var(--h-min)) * (1 - var(--p)))",
        }}
      >
        {/* Expanded layer (full header). Fades + slightly scales out as you scroll. */}
        <div
          ref={expandedRef}
          className="sticky-expanded pt-6 pb-8 pl-5 pr-8 max-md:pr-5 origin-top-left will-change-[opacity,transform]"
          style={{
            opacity: "clamp(0, calc(1.2 - var(--p) * 2.4), 1)",
            transform: "scale(calc(1 - 0.8 * var(--p)))",
          }}
        >
          <Header {...props} compact={false} />
        </div>

        {/* Compact layer. Same <Header compact> the blog pages use, so the
            collapsed bar is visually identical. Fades in as expanded fades out. */}
        <div
          ref={compactRef}
          className="sticky-compact absolute inset-x-0 top-0 py-3 pl-5 pr-8 print:hidden pointer-events-none"
          style={{
            opacity: "clamp(0, calc(var(--p) * 2.4 - 1.0), 1)",
          }}
        >
          <Header {...props} compact={true} />
        </div>
      </div>

      {/* Constant in-flow spacer = expanded height. Reserves the layout space so
          scrolling never resizes the document (no feedback loop). */}
      <div
        aria-hidden
        className="sticky-spacer"
        style={{ height: "var(--h-max)" }}
      />
    </div>
  );
}
