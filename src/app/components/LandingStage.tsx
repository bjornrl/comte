"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SectionHome from "./sections/SectionHome";
import SectionMotto from "./sections/SectionMotto";
import { HOME_PANEL_VW, MOTTO_PANEL_VW } from "./homeLayout";

type MottoProps = {
  heroText?: string;
  backgroundColor?: string;
  backgroundVideoUrl?: string;
};

type Props = {
  landingEpoch: number;
  onLandingReturn: () => void;
  showInteractiveNetwork?: boolean;
  motto: MottoProps;
};

const LANDING_SNAP_IDS = ["home", "motto", "clone-first"] as const;

function findScroller(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-horizontal-scroll="true"]');
}

function isLandingInView(scroller: HTMLElement): boolean {
  const vw = window.innerWidth;
  for (const id of LANDING_SNAP_IDS) {
    const panel = scroller.querySelector<HTMLElement>(`[data-snap-id="${id}"]`);
    if (!panel) continue;
    const r = panel.getBoundingClientRect();
    if (r.right <= 0 || r.left >= vw) continue;
    const visible = Math.min(r.right, vw) - Math.max(r.left, 0);
    if (visible > vw * 0.04) return true;
  }
  return false;
}

/** Horizontal position (viewport px) for the fixed landing layer. */
function getLandingTranslateX(scroller: HTMLElement): number {
  const cloneFirst = scroller.querySelector<HTMLElement>('[data-snap-id="clone-first"]');
  if (cloneFirst) {
    const cr = cloneFirst.getBoundingClientRect();
    const sr = scroller.getBoundingClientRect();
    if (cr.right > sr.left + 1 && cr.left < sr.right - 1) {
      return cr.left;
    }
  }

  const home = scroller.querySelector<HTMLElement>('[data-snap-id="home"]');
  if (home) return home.getBoundingClientRect().left;

  return -99999;
}

/**
 * Single always-mounted home + motto layer, synced to horizontal scroll.
 * Prevents loop / clone seams from showing a duplicate landing that clips
 * or jumps into place. Animations pause while off-screen.
 */
export default function LandingStage({
  landingEpoch,
  onLandingReturn,
  showInteractiveNetwork = true,
  motto,
}: Props) {
  const [translateX, setTranslateX] = useState(0);
  const [inView, setInView] = useState(true);
  const wasInViewRef = useRef(false);
  const initializedRef = useRef(false);

  const sync = useCallback(() => {
    const scroller = findScroller();
    if (!scroller) return;

    const visible = isLandingInView(scroller);
    setTranslateX(getLandingTranslateX(scroller));
    setInView(visible);

    if (visible && initializedRef.current && !wasInViewRef.current) {
      onLandingReturn();
    }
    if (visible) initializedRef.current = true;
    wasInViewRef.current = visible;
  }, [onLandingReturn]);

  useEffect(() => {
    sync();
    const scroller = findScroller();
    if (!scroller) return;

    scroller.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      scroller.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  return (
    <div
      aria-hidden={!inView}
      className="pointer-events-none fixed top-0 z-[8] flex h-svh"
      style={{
        width: `calc(${HOME_PANEL_VW}vw + ${MOTTO_PANEL_VW}vw)`,
        transform: `translateX(${translateX}px)`,
        visibility: inView ? "visible" : "hidden",
        willChange: "transform",
      }}
    >
      <div
        className="pointer-events-none h-full flex-shrink-0 overflow-hidden"
        style={{ width: `${HOME_PANEL_VW}vw` }}
      >
        <SectionHome active={inView} showInteractiveNetwork={showInteractiveNetwork} />
      </div>
      <div
        className="pointer-events-none h-full flex-shrink-0 overflow-hidden"
        style={{ width: `${MOTTO_PANEL_VW}vw` }}
      >
        <SectionMotto
          {...motto}
          animationsActive={inView}
          landingEpoch={landingEpoch}
        />
      </div>
    </div>
  );
}
