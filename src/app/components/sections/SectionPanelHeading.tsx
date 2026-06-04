"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  SECTION_PANEL_HEADING_LINE_HEIGHT,
  SECTION_PANEL_HEADING_SIZE,
  SECTION_PANEL_HEADING_WEIGHT,
} from "./SectionShell";
import { LANDING_HERO_DOT_SIZE } from "../homeLayout";
import { HERO_FADE_DURATION_MS, heroFadeEasing } from "../heroIntroTiming";

const DOT_GAP_PX = 12;
const EXIT_EASE = "cubic-bezier(0.55, 0, 1, 0.45)";

type DotAnimPhase = "idle" | "enter" | "visible" | "exit";

function useSnapPanelInView(snapId: string): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const scroller = document.querySelector("[data-horizontal-scroll='true']");
    const panel = document.querySelector(`[data-snap-id="${snapId}"]`);
    if (!panel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setInView(entry.intersectionRatio >= 0.45);
      },
      { root: scroller, threshold: [0, 0.25, 0.45, 0.6, 0.75, 1] },
    );

    observer.observe(panel);
    return () => observer.disconnect();
  }, [snapId]);

  return inView;
}

export type SectionPanelHeadingProps = {
  /** Horizontal snap panel id — must match `data-snap-id` on the scroll panel. */
  snapId: string;
  color: string;
  children: ReactNode;
  dotColor?: string;
  className?: string;
  style?: CSSProperties;
  headingStyle?: CSSProperties;
  maxWidth?: string;
};

/**
 * Panel section title with landing-style dot: scales in when the snap panel
 * enters view, title shifts right, reverses on exit.
 */
export default function SectionPanelHeading({
  snapId,
  color,
  children,
  dotColor,
  className = "",
  style,
  headingStyle,
  maxWidth = "20ch",
}: SectionPanelHeadingProps) {
  const panelInView = useSnapPanelInView(snapId);
  const [dotPhase, setDotPhase] = useState<DotAnimPhase>("idle");
  const [titleShiftPx, setTitleShiftPx] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const exitTimerRef = useRef<number | undefined>(undefined);

  useLayoutEffect(() => {
    const measure = () => {
      const heroDot = document.querySelector<HTMLElement>("[data-hero-anchor]");
      const dotW =
        heroDot?.getBoundingClientRect().width ??
        dotRef.current?.getBoundingClientRect().width ??
        0;
      setTitleShiftPx(dotW + DOT_GAP_PX);
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (headingRef.current) ro.observe(headingRef.current);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => undefined);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [dotPhase]);

  useEffect(() => {
    if (panelInView) {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      setDotPhase((prev) => (prev === "visible" || prev === "enter" ? prev : "enter"));
      const t = window.setTimeout(() => setDotPhase("visible"), HERO_FADE_DURATION_MS);
      return () => window.clearTimeout(t);
    }

    setDotPhase((prev) => {
      if (prev === "idle" || prev === "exit") return prev;
      return "exit";
    });
    exitTimerRef.current = window.setTimeout(() => setDotPhase("idle"), HERO_FADE_DURATION_MS);
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [panelInView]);

  const showDot = dotPhase === "enter" || dotPhase === "visible" || dotPhase === "exit";
  const titleShifted = dotPhase === "enter" || dotPhase === "visible";
  const titleEasing = dotPhase === "exit" ? EXIT_EASE : heroFadeEasing;
  const resolvedDotColor = dotColor ?? color;

  return (
    <div
      className={`relative min-w-0 font-[family-name:var(--font-manrope)] ${className}`.trim()}
      style={{
        fontSize: SECTION_PANEL_HEADING_SIZE,
        lineHeight: SECTION_PANEL_HEADING_LINE_HEIGHT,
        maxWidth,
        ...style,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2"
      >
        <span
          ref={dotRef}
          data-section-panel-dot=""
          className="block rounded-full"
          style={{
            width: LANDING_HERO_DOT_SIZE,
            height: LANDING_HERO_DOT_SIZE,
            background: showDot ? resolvedDotColor : "transparent",
            opacity: showDot ? 1 : 0,
            animation: showDot
              ? dotPhase === "exit"
                ? `sectionPanelDotOut ${HERO_FADE_DURATION_MS}ms ${EXIT_EASE} forwards`
                : `sectionPanelDotIn ${HERO_FADE_DURATION_MS}ms ${heroFadeEasing} forwards`
              : undefined,
          }}
        />
      </span>
      <h2
        ref={headingRef}
        data-section-panel-heading=""
        className="min-w-0"
        style={{
          margin: 0,
          fontWeight: SECTION_PANEL_HEADING_WEIGHT,
          fontSize: "1em",
          lineHeight: "inherit",
          color,
          transform: titleShifted ? `translateX(${titleShiftPx}px)` : "translateX(0)",
          transition: `transform ${HERO_FADE_DURATION_MS}ms ${titleEasing}`,
          ...headingStyle,
        }}
      >
        {children}
      </h2>
      <style>{`
        @keyframes sectionPanelDotIn {
          from { opacity: 0; transform: scale(0); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes sectionPanelDotOut {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-section-panel-dot] {
            animation-duration: 0.01ms !important;
          }
          [data-section-panel-heading] {
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
