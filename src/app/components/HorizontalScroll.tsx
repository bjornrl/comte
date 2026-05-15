"use client";

import { Fragment, useRef, useEffect, useCallback, type ReactNode } from "react";

export type HorizontalScrollNavApi = {
  goNext: () => void;
  goPrev: () => void;
  scrollToSection: (id: string) => void;
};

type Section = {
  id: string;
  content: ReactNode;
  /** Optional narrow parallax panel rendered to the LEFT of this section.
   * Not a snap target. */
  interstitial?: ReactNode;
  /** Width of this snap panel. Defaults to 100vw. Sections with wider
   * content (e.g. team) can request a wider wrapper so the next snap
   * panel starts after them in the layout. */
  width?: string;
};

type Props = {
  sections: Section[];
  navRef?: React.MutableRefObject<HorizontalScrollNavApi | null>;
  onActiveSectionChange?: (id: string) => void;
  /** True the moment scroll motion begins, false only after the snap
   * animation (if any) completes. */
  onScrollingChange?: (scrolling: boolean) => void;
};

// ---------- Tuning constants ----------

// Distance from a snap point (as a fraction of the viewport width) within which
// the page snaps to that point on scroll-end. 0.30 means the outer 30% on each
// side of every snap target snaps; the 40% in the middle is a "free zone" where
// the user can leave the page resting between two sections.
const SNAP_THRESHOLD = 0.3;

// Smooth-scroll duration when we snap to a section. Higher = more graceful.
const SNAP_DURATION_MS = 500;

// How long the container must be idle before we consider a scroll "ended".
// Trackpad inertia keeps firing scroll events for ~80–120ms after a swipe, so
// 150ms gives the user's "roll" room to play out before snap kicks in.
const SCROLL_IDLE_MS = 150;

// Cap on how far a single wheel tick can move the page, expressed as a fraction
// of viewport width. Stops a single mousewheel click from blasting past 2+
// panels.
const MAX_WHEEL_DELTA_FRACTION = 1.1;

// ---------- Component ----------

/**
 * Horizontally scrolling section list with infinite-loop behaviour and
 * optional non-snap interstitial panels between sections.
 *
 * Uses custom JS for snap (no CSS scroll-snap) so we can:
 *   - keep scroll position 1:1 with input,
 *   - only snap when the user has crossed a threshold into the next section,
 *   - run a slower easing curve on the snap animation,
 *   - allow trackpad inertia to roll for a frame or two without overshooting.
 */
export default function HorizontalScroll({
  sections,
  navRef,
  onActiveSectionChange,
  onScrollingChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  // True while a programmatic smooth-scroll is in flight. Scroll events fired
  // during that time should not be treated as user motion.
  const isAdjusting = useRef(false);
  const animFrameId = useRef<number | null>(null);

  // ---- helpers --------------------------------------------------------------

  const getSnapPanels = useCallback((): HTMLElement[] => {
    const el = containerRef.current;
    if (!el) return [];
    return Array.from(el.querySelectorAll<HTMLElement>("[data-snap-id]"));
  }, []);

  /**
   * Snap target X (document coordinate) for a panel. If the panel contains a
   * child with `data-snap-anchor`, that child's position is used — letting a
   * section deliberately snap "off-kilter" by placing the anchor somewhere
   * other than the panel's left edge. Falls back to panel.offsetLeft.
   */
  const getSnapTarget = useCallback((panel: HTMLElement): number => {
    const el = containerRef.current;
    if (!el) return panel.offsetLeft;
    const anchor = panel.querySelector<HTMLElement>("[data-snap-anchor]");
    if (anchor) {
      const anchorRect = anchor.getBoundingClientRect();
      const containerRect = el.getBoundingClientRect();
      return el.scrollLeft + anchorRect.left - containerRect.left;
    }
    return panel.offsetLeft;
  }, []);

  const findNearestSnapIndex = useCallback((): {
    index: number;
    distance: number;
  } => {
    const el = containerRef.current;
    if (!el) return { index: -1, distance: Infinity };
    const panels = getSnapPanels();
    if (!panels.length) return { index: -1, distance: Infinity };
    const scrollLeft = el.scrollLeft;
    let bestIdx = 0;
    let bestDist = Infinity;
    panels.forEach((p, i) => {
      const dist = Math.abs(getSnapTarget(p) - scrollLeft);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    });
    return { index: bestIdx, distance: bestDist };
  }, [getSnapPanels, getSnapTarget]);

  const stopAnimation = useCallback(() => {
    if (animFrameId.current != null) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
  }, []);

  /** RAF-driven smooth scroll with easeOutCubic. Replaces the native
   * scrollTo({ behavior: 'smooth' }) so duration is fully under our control. */
  const smoothScrollTo = useCallback(
    (targetX: number, duration: number, onComplete?: () => void) => {
      const el = containerRef.current;
      if (!el) return;
      stopAnimation();
      const startX = el.scrollLeft;
      const distance = targetX - startX;
      if (Math.abs(distance) < 0.5) {
        onComplete?.();
        return;
      }
      isAdjusting.current = true;
      const startTime = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - startTime) / duration);
        // smoothstep: a touch of ease-in at the start, ease-out at the end.
        const eased = t * t * (3 - 2 * t);
        el.scrollLeft = startX + distance * eased;
        if (t < 1) {
          animFrameId.current = requestAnimationFrame(tick);
        } else {
          animFrameId.current = null;
          // Give the browser two frames to flush the final scroll event before
          // we hand control back to the user; otherwise the trailing event can
          // re-trigger our handler and look like user input.
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              isAdjusting.current = false;
              onComplete?.();
            });
          });
        }
      };
      animFrameId.current = requestAnimationFrame(tick);
    },
    [stopAnimation],
  );

  /** Instant scroll (no animation) used for the loop teleport. */
  const jumpToScrollLeft = useCallback(
    (targetX: number) => {
      const el = containerRef.current;
      if (!el) return;
      stopAnimation();
      isAdjusting.current = true;
      el.scrollLeft = targetX;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isAdjusting.current = false;
        });
      });
    },
    [stopAnimation],
  );

  // ---- nav API --------------------------------------------------------------

  const scrollToSnapIndex = useCallback(
    (snapIdx: number, smooth: boolean) => {
      const panels = getSnapPanels();
      const target = panels[snapIdx];
      if (!target) return;
      const targetX = getSnapTarget(target);
      if (smooth) {
        smoothScrollTo(targetX, SNAP_DURATION_MS);
      } else {
        jumpToScrollLeft(targetX);
      }
    },
    [getSnapPanels, getSnapTarget, smoothScrollTo, jumpToScrollLeft],
  );

  const scrollToSection = useCallback(
    (id: string) => {
      const realIdx = sectionsRef.current.findIndex((s) => s.id === id);
      if (realIdx < 0) return;
      // snap-id index 0 is clone-last; real sections start at 1.
      scrollToSnapIndex(realIdx + 1, true);
    },
    [scrollToSnapIndex],
  );

  const goNext = useCallback(() => {
    const { index } = findNearestSnapIndex();
    if (index < 0) return;
    scrollToSnapIndex(index + 1, true);
  }, [findNearestSnapIndex, scrollToSnapIndex]);

  const goPrev = useCallback(() => {
    const { index } = findNearestSnapIndex();
    if (index < 0) return;
    scrollToSnapIndex(index - 1, true);
  }, [findNearestSnapIndex, scrollToSnapIndex]);

  useEffect(() => {
    if (!navRef) return;
    navRef.current = { goNext, goPrev, scrollToSection };
    return () => {
      navRef.current = null;
    };
  }, [navRef, goNext, goPrev, scrollToSection]);

  // ---- mount: park silently on the first real panel -------------------------

  useEffect(() => {
    scrollToSnapIndex(1, false);
  }, [scrollToSnapIndex]);

  // ---- scroll-end snap + active-section tracking ----------------------------

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let idleTimeout: ReturnType<typeof setTimeout>;
    let scrolling = false;

    const numReal = () => sectionsRef.current.length;
    const isCloneIndex = (snapIdx: number) =>
      snapIdx === 0 || snapIdx === numReal() + 1;

    const updateActiveSection = (snapIdx: number) => {
      const n = numReal();
      let section: Section | undefined;
      if (snapIdx === 0) section = sectionsRef.current[n - 1];
      else if (snapIdx === n + 1) section = sectionsRef.current[0];
      else section = sectionsRef.current[snapIdx - 1];
      if (section) onActiveSectionChange?.(section.id);
    };

    const handleIdle = () => {
      if (isAdjusting.current) return;

      const panels = getSnapPanels();
      if (!panels.length) {
        scrolling = false;
        onScrollingChange?.(false);
        return;
      }
      const panelWidth = el.clientWidth;
      const { index: nearestIdx, distance: nearestDist } = findNearestSnapIndex();
      const nearest = panels[nearestIdx];
      if (!nearest) {
        scrolling = false;
        onScrollingChange?.(false);
        return;
      }

      // Loop seam: when we land on a clone, teleport to its real counterpart
      // synchronously — no intermediate smooth-scroll. The clone shows the
      // same content as the real panel, so a direct jump is visually
      // identical AND can't be cancelled mid-animation by user input. The
      // previous two-step (smoothScroll → onComplete teleport) would silently
      // strand the user past the loop seam if they wheeled during the snap:
      // stopAnimation cancels the rAF, onComplete never fires, and at the
      // scroll-extremes the browser clamps scrollLeft so no further scroll
      // events arrive to retrigger handleIdle.
      if (isCloneIndex(nearestIdx)) {
        const targetIdx = nearestIdx === 0 ? numReal() : 1;
        const target = panels[targetIdx];
        if (target) {
          jumpToScrollLeft(getSnapTarget(target));
          updateActiveSection(targetIdx);
        }
        scrolling = false;
        onScrollingChange?.(false);
        return;
      }

      // Within the threshold of a real snap point → snap to it.
      if (nearestDist <= panelWidth * SNAP_THRESHOLD) {
        smoothScrollTo(getSnapTarget(nearest), SNAP_DURATION_MS, () => {
          updateActiveSection(nearestIdx);
          scrolling = false;
          onScrollingChange?.(false);
        });
        return;
      }

      // Free zone: stay where we are, just report which section is the
      // dominant one in the viewport.
      updateActiveSection(nearestIdx);
      scrolling = false;
      onScrollingChange?.(false);
    };

    const handleScroll = () => {
      if (isAdjusting.current) return;
      if (!scrolling) {
        scrolling = true;
        onScrollingChange?.(true);
      }
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(handleIdle, SCROLL_IDLE_MS);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });

    // Initial active-section report.
    const { index: initialIdx } = findNearestSnapIndex();
    if (initialIdx >= 0) updateActiveSection(initialIdx);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      clearTimeout(idleTimeout);
      stopAnimation();
    };
  }, [
    findNearestSnapIndex,
    getSnapPanels,
    getSnapTarget,
    jumpToScrollLeft,
    onActiveSectionChange,
    onScrollingChange,
    smoothScrollTo,
    stopAnimation,
  ]);

  // ---- wheel: 1:1 vertical-to-horizontal translation ------------------------

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // Trackpad horizontal gestures → let native scroll handle them.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.deltaY === 0) return;

      // If the event originated inside an inner horizontal scroller (e.g. the
      // team-card row), let that handle the wheel.
      let node: Element | null = e.target as Element;
      while (node && node !== el) {
        if (node instanceof HTMLElement) {
          const overflowX = getComputedStyle(node).overflowX;
          if (overflowX === "auto" || overflowX === "scroll") {
            const hasOverflow = node.scrollWidth > node.clientWidth + 1;
            if (hasOverflow) return;
          }
        }
        node = node.parentElement;
      }

      e.preventDefault();

      // Cancel any running snap so user input takes precedence immediately.
      stopAnimation();
      isAdjusting.current = false;

      // Cap per-tick delta so one outsized mouse wheel click can't blast past
      // multiple panels.
      const maxDelta = el.clientWidth * MAX_WHEEL_DELTA_FRACTION;
      const delta = Math.max(-maxDelta, Math.min(maxDelta, e.deltaY));
      el.scrollLeft += delta;
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [stopAnimation]);

  // ---- BlobNav fallback nav events ------------------------------------------

  useEffect(() => {
    const onNavigate = (e: Event) => {
      const detail = (e as CustomEvent<{ sectionId: string }>).detail;
      if (detail?.sectionId) scrollToSection(detail.sectionId);
    };
    window.addEventListener("comte:navigate", onNavigate as EventListener);
    return () => window.removeEventListener("comte:navigate", onNavigate as EventListener);
  }, [scrollToSection]);

  // ---- initial hash (/#projects, /#team, …) ---------------------------------

  useEffect(() => {
    const hash =
      typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    if (hash) requestAnimationFrame(() => scrollToSection(hash));
  }, [scrollToSection]);

  // ---- render --------------------------------------------------------------

  const cloneLast = sections[sections.length - 1];
  const cloneFirst = sections[0];

  const panelClass = "h-svh flex-shrink-0";
  const panelStyle = (w?: string): React.CSSProperties => ({
    width: w ?? "100vw",
  });

  return (
    <div
      ref={containerRef}
      data-horizontal-scroll="true"
      className="flex h-svh w-screen overflow-x-auto overflow-y-hidden"
      style={{
        scrollBehavior: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {cloneLast && (
        <div
          key="clone-last"
          data-snap-id="clone-last"
          className={panelClass}
          style={panelStyle(cloneLast.width)}
          aria-hidden="true"
        >
          {cloneLast.content}
        </div>
      )}

      {sections.map((section) => (
        <Fragment key={section.id}>
          {section.interstitial /* not a snap target */}
          <div
            data-snap-id={section.id}
            className={panelClass}
            style={panelStyle(section.width)}
          >
            {section.content}
          </div>
        </Fragment>
      ))}

      {cloneFirst && (
        <div
          key="clone-first"
          data-snap-id="clone-first"
          className={panelClass}
          style={panelStyle(cloneFirst.width)}
          aria-hidden="true"
        >
          {cloneFirst.content}
        </div>
      )}
    </div>
  );
}
