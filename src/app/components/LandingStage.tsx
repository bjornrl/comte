"use client";

import { useCallback, useEffect, useState } from "react";
import SectionHome from "./sections/SectionHome";
import SectionMotto from "./sections/SectionMotto";
import { HOME_PANEL_VW, MOTTO_PANEL_VW } from "./homeLayout";

type MottoProps = {
  backgroundColor?: string;
};

type Props = {
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
  const sr = scroller.getBoundingClientRect();
  const home = scroller.querySelector<HTMLElement>('[data-snap-id="home"]');
  const cloneFirst = scroller.querySelector<HTMLElement>(
    '[data-snap-id="clone-first"]',
  );

  if (home) {
    const hr = home.getBoundingClientRect();
    if (hr.right > sr.left + 1 && hr.left < sr.right - 1) {
      return hr.left;
    }
  }

  if (cloneFirst) {
    const cr = cloneFirst.getBoundingClientRect();
    if (cr.right > sr.left + 1 && cr.left < sr.right - 1) {
      return Math.max(0, cr.left);
    }
  }

  if (home) return home.getBoundingClientRect().left;

  return -99999;
}

/**
 * Single always-mounted home + motto (lights) layer, synced to horizontal scroll.
 */
export default function LandingStage({
  showInteractiveNetwork = true,
  motto,
}: Props) {
  const [translateX, setTranslateX] = useState(0);
  const [inView, setInView] = useState(true);
  const sync = useCallback(() => {
    const scroller = findScroller();
    if (!scroller) return;

    setTranslateX(getLandingTranslateX(scroller));
    setInView(isLandingInView(scroller));
  }, []);

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
        <SectionMotto {...motto} animationsActive={inView} />
      </div>
    </div>
  );
}
