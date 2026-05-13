"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Props = {
  /** Each item becomes a line in the rotated text block. */
  lines: string[];
  /** Text colour. */
  color?: string;
  /** Tailwind/utility classes for the absolutely-positioned wrapper. */
  className?: string;
  /**
   * Optional parallax factor. When > 0, the heading shifts horizontally as
   * the horizontal-scroll container moves, at this fraction past 1× scroll
   * speed. At the parent panel's snap point the offset is 0; scrolling
   * backward (toward the previous panel) pushes the heading RIGHT, scrolling
   * forward pulls it LEFT — both faster than the scroll itself. 0.18 matches
   * the office map's parallax magnitude.
   */
  parallaxFactor?: number;
};

// Provisional font-size used for the first paint before the layout effect
// measures the actual rendered text and rescales. Keeps the initial render
// visually close to the final size so the layout doesn't snap noticeably.
const PROBE_FS_PX = 100;

// Small bleed past the viewport top/bottom so the glyph edges sit roughly
// flush with the viewport edges instead of the line-box edges. The bottom
// bleed is larger because the first character's left-side sidebearing (an
// empty horizontal margin inside the line box) becomes a vertical gap at
// the bottom after the 90° CCW rotation — pushing the text further down
// makes the visible glyphs land closer to the viewport bottom edge.
const TOP_BLEED_PX = 16;
const BOTTOM_BLEED_PX = 28;

/**
 * Oversized text rotated 90° counter-clockwise. The widest line is sized so
 * its rendered width equals viewport height (plus a small bleed) after
 * rotation, so the visual fills the viewport vertically. The first line's
 * strip is bisected by the parent's LEFT EDGE.
 *
 * The parent MUST be `position: relative` AND have `overflow: visible` so
 * the strip can bleed left of the parent.
 *
 * Optional `parallaxFactor` makes the heading move horizontally past 1×
 * scroll speed (see prop docs).
 */
export default function TiltedHeading({
  lines,
  color = "#FF5252",
  className,
  parallaxFactor = 0,
}: Props) {
  // Wrapper handles parallax translateX. Inner handles the rotation + font
  // sizing. Splitting them avoids fighting the composed `translate(-50%, -50%)
  // rotate(-90deg)` transform on the inner — the parallax just composes onto
  // the wrapper's own transform.
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<number>(PROBE_FS_PX);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const recompute = () => {
      // Measure the widest line at the probe size, then scale font-size so
      // that the widest line's rendered width equals viewport height plus
      // the top + bottom bleed. After rotation, the rendered width becomes
      // the visual height, so this overflows the viewport by the configured
      // bleed amounts.
      el.style.fontSize = `${PROBE_FS_PX}px`;
      let maxWidth = 0;
      for (const child of Array.from(el.children)) {
        if (child instanceof HTMLElement) {
          maxWidth = Math.max(maxWidth, child.scrollWidth);
        }
      }
      if (maxWidth <= 0) return;
      const target = window.innerHeight + TOP_BLEED_PX + BOTTOM_BLEED_PX;
      setFontSize(PROBE_FS_PX * (target / maxWidth));
    };

    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [lines]);

  useEffect(() => {
    if (parallaxFactor <= 0) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let scroller: HTMLElement | null = wrapper.parentElement;
    while (scroller && scroller.dataset.horizontalScroll !== "true") {
      scroller = scroller.parentElement;
    }
    if (!scroller) return;

    // Snap reference: the panel's data-snap-anchor if present, else the
    // panel itself. parallax offset is 0 when the reference is at the
    // scroller's left edge (i.e. the section is snapped).
    let panel: HTMLElement | null = wrapper.parentElement;
    while (panel && !panel.dataset.snapId) panel = panel.parentElement;
    const reference: HTMLElement =
      panel?.querySelector<HTMLElement>("[data-snap-anchor]") ?? panel ?? wrapper;

    const update = () => {
      const sr = scroller!.getBoundingClientRect();
      const refRect = reference.getBoundingClientRect();
      // scrollDelta: how far past the panel's snap point we've scrolled.
      // Positive = scrolled forward past snap; negative = before snap.
      const scrollDelta = sr.left - refRect.left;
      // Shift LEFT as we scroll forward (delta positive), RIGHT as we
      // approach from the previous panel (delta negative). Magnitude grows
      // linearly with the parallax factor so the heading moves at speed
      // (1 + factor)× the scroll.
      wrapper.style.transform = `translateX(${-parallaxFactor * scrollDelta}px)`;
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scroller!.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [parallaxFactor]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        willChange: parallaxFactor > 0 ? "transform" : undefined,
      }}
    >
      <div
        ref={innerRef}
        style={{
          position: "absolute",
          // Bias the visual centre down by half the difference between bottom
          // and top bleeds so the bottom overflows more than the top.
          top: `calc(50% + ${(BOTTOM_BLEED_PX - TOP_BLEED_PX) / 2}px)`,
          left: "0.5em",
          fontSize: `${fontSize}px`,
          fontFamily: "var(--font-manrope), system-ui, sans-serif",
          fontWeight: 800,
          color,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          whiteSpace: "nowrap",
          textAlign: "left",
          transform: "translate(-50%, -50%) rotate(-90deg)",
          transformOrigin: "center",
          userSelect: "none",
        }}
      >
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}
