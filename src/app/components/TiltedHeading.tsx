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
  /**
   * Horizontal offset of the rotated block's centre from the parent's left
   * edge, in em (= line-height). Defaults to 0.5 — at that value the first
   * line's strip is bisected by the parent boundary. Lower values shift the
   * visual LEFT (line break moves toward the parent's left edge); use ~0.2
   * to align the line break with the viewport's RIGHT edge at the previous
   * section's snap when this heading lives in a forward-snap-aware panel.
   */
  leftOffsetEm?: number;
  /**
   * When set (0–1), keep default vertical centre + rotation but shift
   * horizontally so the rotated block's horizontal centre sits at this
   * fraction across the parent panel width. Use 0.5 to centre over the panel
   * (e.g. motto lights frame).
   */
  blockAlignPanelXFraction?: number;
  /** When this snap panel has fully left the viewport, parallax offset resets
   *  to 0 until the panel re-enters view (e.g. motto heading vs home panel). */
  parallaxResetWhenHiddenSnapId?: string;
  /** Initial-load fade-in synced with another intro element (e.g. hero line). */
  fadeIn?: { delayMs: number; durationMs?: number };
  /** When true, show fully visible without replaying the fade-in. */
  introSettled?: boolean;
  /**
   * Optional lines used only for font-size measurement. When set, the
   * rendered `lines` can differ (e.g. a custom line break) while matching
   * another heading's scale.
   */
  sizeReferenceLines?: string[];
  /** Line height for multi-line blocks. Defaults to 1. */
  lineHeight?: number;
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
/** Keep the post-rotation horizontal footprint inside the parent. */
const HORIZONTAL_MARGIN_PX = 16;

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
  leftOffsetEm = 0.5,
  blockAlignPanelXFraction,
  parallaxResetWhenHiddenSnapId,
  fadeIn,
  introSettled = false,
  sizeReferenceLines,
  lineHeight = 1,
}: Props) {
  // Wrapper handles parallax translateX. Inner handles the rotation + font
  // sizing. Splitting them avoids fighting the composed `translate(-50%, -50%)
  // rotate(-90deg)` transform on the inner — the parallax just composes onto
  // the wrapper's own transform.
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<number>(PROBE_FS_PX);
  /** Extra left shift (px) for block horizontal alignment in the panel. */
  const [blockAlignShiftPx, setBlockAlignShiftPx] = useState(0);

  useLayoutEffect(() => {
    const el = innerRef.current;
    const measureEl = measureRef.current;
    const wrapper = wrapperRef.current;
    if (!el) return;

    const sizingLines = sizeReferenceLines ?? lines;
    const measureTarget = sizeReferenceLines && measureEl ? measureEl : el;

    const recompute = () => {
      // Measure at probe size. Pre-rotation width becomes vertical span
      // after -90°; pre-rotation height becomes horizontal span — cap both.
      measureTarget.style.fontSize = `${PROBE_FS_PX}px`;
      let maxWidth = 0;
      let blockHeight = 0;
      for (const child of Array.from(measureTarget.children)) {
        if (child instanceof HTMLElement) {
          maxWidth = Math.max(maxWidth, child.scrollWidth);
          blockHeight += child.offsetHeight;
        }
      }
      if (maxWidth <= 0) return;

      const targetVertical = window.innerHeight + TOP_BLEED_PX + BOTTOM_BLEED_PX;
      const containerWidth =
        wrapper?.parentElement?.getBoundingClientRect().width ??
        wrapper?.getBoundingClientRect().width ??
        window.innerWidth;
      const targetHorizontal = Math.max(
        0,
        containerWidth - HORIZONTAL_MARGIN_PX,
      );

      const fsFromVertical = PROBE_FS_PX * (targetVertical / maxWidth);
      const fsFromHorizontal =
        blockHeight > 0
          ? PROBE_FS_PX * (targetHorizontal / blockHeight)
          : fsFromVertical;
      const fs = Math.min(fsFromVertical, fsFromHorizontal);

      el.style.fontSize = `${fs}px`;
      setFontSize(fs);

      if (blockAlignPanelXFraction != null && wrapper) {
        const panelRect = wrapper.getBoundingClientRect();
        const blockRect = el.getBoundingClientRect();
        const targetX =
          panelRect.width *
          Math.max(0, Math.min(1, blockAlignPanelXFraction));
        const blockCenterRel =
          (blockRect.left + blockRect.right) / 2 - panelRect.left;
        setBlockAlignShiftPx(targetX - blockCenterRel);
      } else {
        setBlockAlignShiftPx(0);
      }
    };

    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [lines, sizeReferenceLines, blockAlignPanelXFraction]);

  useEffect(() => {
    if (parallaxFactor <= 0) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let scroller: HTMLElement | null = wrapper.parentElement;
    while (scroller && scroller.dataset.horizontalScroll !== "true") {
      scroller = scroller.parentElement;
    }
    if (!scroller) {
      scroller = document.querySelector<HTMLElement>('[data-horizontal-scroll="true"]');
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

      // Reset when the reference panel (e.g. home) has fully scrolled off
      // left — prevents stale parallax drift when navigating back to landing.
      if (parallaxResetWhenHiddenSnapId) {
        const resetPanel = scroller!.querySelector<HTMLElement>(
          `[data-snap-id="${parallaxResetWhenHiddenSnapId}"]`,
        );
        if (resetPanel) {
          const resetRect = resetPanel.getBoundingClientRect();
          if (resetRect.right <= sr.left + 1) {
            wrapper.style.transform = "translateX(0px)";
            return;
          }
        }
      }

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
  }, [parallaxFactor, parallaxResetWhenHiddenSnapId]);

  const fadeDurationMs = fadeIn?.durationMs ?? 700;
  const showFadeIn = fadeIn && !introSettled;

  return (
    <>
    <div
      ref={wrapperRef}
      aria-hidden="true"
      data-tilted-heading-fade={showFadeIn ? "" : undefined}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        // z-10 keeps the rotated text above the home network's background
        // canvas (which extends into motto's area at z-1). Without this,
        // the canvas paints on top of the heading.
        zIndex: 10,
        pointerEvents: "none",
        willChange: parallaxFactor > 0 ? "transform" : undefined,
        opacity: showFadeIn ? 0 : 1,
        ...(showFadeIn
          ? {
              animation: `tiltedHeadingFadeIn ${fadeDurationMs}ms cubic-bezier(0.25, 1, 0.5, 1) forwards`,
              animationDelay: `${fadeIn.delayMs}ms`,
            }
          : {}),
      }}
    >
      <div
        ref={innerRef}
        style={{
          position: "absolute",
          // Bias the visual centre down by half the difference between bottom
          // and top bleeds so the bottom overflows more than the top.
          top: `calc(50% + ${(BOTTOM_BLEED_PX - TOP_BLEED_PX) / 2}px)`,
          left: `calc(${leftOffsetEm}em + ${blockAlignShiftPx}px)`,
          fontSize: `${fontSize}px`,
          fontFamily: "var(--font-manrope), system-ui, sans-serif",
          fontWeight: 800,
          color,
          lineHeight,
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
      {sizeReferenceLines ? (
        <div
          ref={measureRef}
          aria-hidden
          style={{
            position: "absolute",
            visibility: "hidden",
            pointerEvents: "none",
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            whiteSpace: "nowrap",
          }}
        >
          {sizeReferenceLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      ) : null}
    </div>
    {showFadeIn && (
      <style>{`
        @keyframes tiltedHeadingFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-tilted-heading-fade] {
            animation-duration: 1ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>
    )}
    </>
  );
}
