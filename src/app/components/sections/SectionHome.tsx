"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import SectionShell, { PANEL_PADDING } from "./SectionShell";
import HomeBackgroundNetwork from "../HomeBackgroundNetwork";
import { LANDING_HOME_BG, LANDING_HERO_ACCENT, LANDING_HERO_TEXT } from "../homeLayout";
import {
  HERO_FADE_DURATION_MS,
  HERO_LINE_BASE_DELAY_MS,
  HERO_LINE_COUNT,
  HERO_LINE_STAGGER_MS,
  heroFadeEasing,
} from "../heroIntroTiming";

const BG = LANDING_HOME_BG;
const HERO_ACCENT = LANDING_HERO_ACCENT;
const HERO_TEXT = LANDING_HERO_TEXT;

type Props = {
  /** When false, pause the canvas loop to save CPU while off-screen. */
  active?: boolean;
  /** When false, skip the canvas network on the home panel. */
  showInteractiveNetwork?: boolean;
};

const HERO_LINES = ["comte", "creates", "change", "that", "matters"];

const HERO_LINE_DELAYS_MS = Array.from(
  { length: HERO_LINE_COUNT },
  (_, i) => HERO_LINE_BASE_DELAY_MS + i * HERO_LINE_STAGGER_MS,
);
const HERO_DOT_DELAY_MS =
  HERO_LINE_DELAYS_MS[HERO_LINE_DELAYS_MS.length - 1] + 200;
const HERO_INTRO_TOTAL_MS = HERO_DOT_DELAY_MS + HERO_FADE_DURATION_MS;

export default function SectionHome({
  active = true,
  showInteractiveNetwork = true,
}: Props) {
  // Intro runs once per page load; navbar returns show the settled state.
  const [introComplete, setIntroComplete] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  /** Fixed offset from heading — set once from Ventures alignment at load. */
  const [dotLeftPx, setDotLeftPx] = useState<number | null>(null);

  useLayoutEffect(() => {
    const measureInitialDotLeft = () => {
      const dot = dotRef.current;
      const heading = headingRef.current;
      const ventures = document.querySelector<HTMLElement>('[data-nav-item="ventures"]');
      if (!dot || !heading || !ventures) return;

      const venturesRect = ventures.getBoundingClientRect();
      const paddingRight = parseFloat(getComputedStyle(ventures).paddingRight) || 0;
      const venturesInnerRight = venturesRect.right - paddingRight;
      const headingLeft = heading.getBoundingClientRect().left;
      const dotWidth = dot.getBoundingClientRect().width;
      setDotLeftPx(venturesInnerRight - headingLeft - dotWidth);
    };

    measureInitialDotLeft();
    // Wait for nav + fonts to settle, then lock the offset (not tied to nav later).
    requestAnimationFrame(() => {
      requestAnimationFrame(measureInitialDotLeft);
    });

    // Re-anchor only on viewport resize — not when the navbar opens/closes.
    window.addEventListener("resize", measureInitialDotLeft);
    return () => window.removeEventListener("resize", measureInitialDotLeft);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setIntroComplete(true);
      return;
    }
    const timer = window.setTimeout(() => setIntroComplete(true), HERO_INTRO_TOTAL_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <SectionShell
      id="home"
      bgColor={BG}
      style={{ padding: 0, overflow: "visible" }}
    >
      {showInteractiveNetwork && <HomeBackgroundNetwork active={active} />}

      {/* Bottom-left hero text */}
      <div
        className="absolute z-10"
        style={{ left: PANEL_PADDING, bottom: PANEL_PADDING, right: PANEL_PADDING }}
      >
        <h1
          ref={headingRef}
          className="relative font-[family-name:var(--font-manrope)] font-medium"
          style={{
            fontSize: "clamp(2.85rem, 8.75vw, 7.25rem)",
            lineHeight: 0.92,
            letterSpacing: "-0.02em",
            color: HERO_TEXT,
          }}
        >
          <span
            ref={dotRef}
            aria-hidden="true"
            data-hero-anchor=""
            style={{
              position: "absolute",
              top: "-0.15em",
              left: dotLeftPx ?? 0,
              width: "0.28em",
              height: "0.28em",
              borderRadius: "9999px",
              background: HERO_ACCENT,
              opacity: introComplete ? 1 : 0,
              pointerEvents: "none",
              ...(introComplete
                ? {}
                : {
                    animation: `heroDotIn ${HERO_FADE_DURATION_MS}ms ${heroFadeEasing} forwards`,
                    animationDelay: `${HERO_DOT_DELAY_MS}ms`,
                  }),
            }}
          />
          {HERO_LINES.map((line, i) => (
            <span
              key={i}
              className="block"
              style={{
                opacity: introComplete ? 1 : 0,
                color: i === 0 ? HERO_ACCENT : HERO_TEXT,
                ...(introComplete
                  ? {}
                  : {
                      animation:
                        `heroFadeIn ${HERO_FADE_DURATION_MS}ms ${heroFadeEasing} forwards`,
                      animationDelay: `${HERO_LINE_DELAYS_MS[i] ?? 0}ms`,
                    }),
              }}
            >
              {line}
            </span>
          ))}
        </h1>
      </div>

      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroDotIn {
          from { opacity: 0; transform: scale(0); }
          to   { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-snap-id="home"] [style*="heroFadeIn"],
          [data-snap-id="home"] [style*="heroDotIn"] {
            animation-duration: 1ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>
    </SectionShell>
  );
}
