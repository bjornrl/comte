"use client";

import { Fragment, useRef, useEffect, useLayoutEffect, useCallback, useState, type ReactNode } from "react";
import { dispatchSectionPrime } from "@/app/hooks/useSectionPrime";
import { MOTTO_DEFAULT_BG } from "./homeLayout";
import { comteColors } from "@/lib/comte-colors";

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

/** Minimum index gap before nav reorders sections for a short hop. */
const NAV_JUMP_MIN_GAP = 2;

/** Landing sections — contact is one loop step to the left. */
const LANDING_SECTION_IDS = new Set(["home", "motto"]);

function isLandingSectionId(id: string | undefined): boolean {
  return id != null && LANDING_SECTION_IDS.has(id);
}

function getSectionIdAtSnapIndex(snapIdx: number, list: Section[]): string | undefined {
  const n = list.length;
  if (snapIdx === 0) return list[n - 1]?.id;
  if (snapIdx === n + 1) return list[0]?.id;
  return list[snapIdx - 1]?.id;
}

/** Navbar jumps always insert one section ahead of the current snap (the
 * partially-visible neighbour). Wraps from last → first (contact → home). */
function getNavInsertAfterIdx(sectionCount: number, currentIdx: number): number {
  return (currentIdx + 1) % sectionCount;
}

/** Move target to immediately after insertAfterIdx; preserve all other order. */
function buildNavJumpOrder(
  sections: Section[],
  targetIdx: number,
  insertAfterIdx: number,
): Section[] {
  const target = sections[targetIdx];
  const withoutTarget = sections.filter((s) => s.id !== target.id);
  const anchorId = sections[insertAfterIdx].id;
  let anchorPos = withoutTarget.findIndex((s) => s.id === anchorId);

  // Target is the anchor section (e.g. navigating to home from contact).
  if (anchorPos < 0 && target.id === anchorId) {
    return [target, ...withoutTarget];
  }
  if (anchorPos < 0) return sections;

  const insertAt = anchorPos + 1;
  return [
    ...withoutTarget.slice(0, insertAt),
    target,
    ...withoutTarget.slice(insertAt),
  ];
}

function buildNavJumpOrderForNav(
  sections: Section[],
  currentId: string,
  currentIdx: number,
  targetIdx: number,
): Section[] {
  let insertAfterIdx = getNavInsertAfterIdx(sections.length, currentIdx);
  let order = buildNavJumpOrder(sections, targetIdx, insertAfterIdx);

  const targetId = sections[targetIdx].id;
  const targetPos = order.findIndex((s) => s.id === targetId);
  const currentPos = order.findIndex((s) => s.id === currentId);

  // Navbar jumps always scroll right — if the destination would sit at or
  // before the current section, fall back to inserting after current.
  if (
    targetPos >= 0 &&
    currentPos >= 0 &&
    targetPos <= currentPos &&
    insertAfterIdx !== currentIdx
  ) {
    insertAfterIdx = currentIdx;
    order = buildNavJumpOrder(sections, targetIdx, insertAfterIdx);
  }

  return order;
}

type PendingNav = {
  step: "preserved" | "animating" | "restoring";
  targetId: string;
  currentId: string;
};

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
  const canonicalSectionsRef = useRef(sections);
  canonicalSectionsRef.current = sections;

  const [renderSections, setRenderSections] = useState(sections);
  const renderSectionsRef = useRef(renderSections);
  renderSectionsRef.current = renderSections;

  const isNavJumpRef = useRef(false);
  const pendingNavRef = useRef<PendingNav | null>(null);

  // True while a programmatic smooth-scroll is in flight. Scroll events fired
  // during that time should not be treated as user motion.
  const isAdjusting = useRef(false);
  const animFrameId = useRef<number | null>(null);
  /** Last panel index we snapped to (real or clone). */
  const lastSnappedIndexRef = useRef(1);
  /** False until the initial snap-to-home on mount completes. */
  const loopSeamsEnabledRef = useRef(false);
  /** False when the user rests in the free zone between snap points. */
  const isSnappedRef = useRef(true);

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
    (snapIdx: number, smooth: boolean, onComplete?: () => void) => {
      const panels = getSnapPanels();
      const target = panels[snapIdx];
      if (!target) {
        onComplete?.();
        return;
      }
      lastSnappedIndexRef.current = snapIdx;
      isSnappedRef.current = true;
      const targetX = getSnapTarget(target);
      if (smooth) {
        smoothScrollTo(targetX, SNAP_DURATION_MS, onComplete);
      } else {
        jumpToScrollLeft(targetX);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => onComplete?.());
        });
      }
    },
    [getSnapPanels, getSnapTarget, smoothScrollTo, jumpToScrollLeft],
  );

  const scrollToSectionId = useCallback(
    (id: string, smooth: boolean, onComplete?: () => void) => {
      const realIdx = renderSectionsRef.current.findIndex((s) => s.id === id);
      if (realIdx < 0) {
        onComplete?.();
        return;
      }
      // snap-id index 0 is clone-last; real sections start at 1.
      scrollToSnapIndex(realIdx + 1, smooth, onComplete);
    },
    [scrollToSnapIndex],
  );

  const scrollToSection = useCallback(
    (id: string) => {
      const canonical = canonicalSectionsRef.current;
      const targetIdx = canonical.findIndex((s) => s.id === id);
      if (targetIdx < 0) return;

      // Start destination entry animations during the scroll (landing intro
      // is excluded — it only runs on initial page load).
      if (id !== "home") {
        dispatchSectionPrime(id);
      }

      const currentId = getSectionIdAtSnapIndex(
        lastSnappedIndexRef.current,
        renderSectionsRef.current,
      );
      const currentIdx = canonical.findIndex((s) => s.id === currentId);
      if (currentIdx < 0 || currentIdx === targetIdx) return;

      // Landing → contact: one panel left via the loop clone (not a long
      // rightward hop through every section).
      if (id === "contact" && isLandingSectionId(currentId)) {
        onScrollingChange?.(true);
        stopAnimation();
        scrollToSnapIndex(0, true, () => {
          const panels = getSnapPanels();
          const n = renderSectionsRef.current.length;
          const lastReal = panels[n];
          if (lastReal) {
            jumpToScrollLeft(getSnapTarget(lastReal));
            lastSnappedIndexRef.current = n;
            isSnappedRef.current = true;
          }
          onActiveSectionChange?.("contact");
          onScrollingChange?.(false);
        });
        return;
      }

      const gap = Math.abs(targetIdx - currentIdx);
      if (gap < NAV_JUMP_MIN_GAP) {
        scrollToSectionId(id, true);
        return;
      }

      if (pendingNavRef.current) return;

      const tempOrder = buildNavJumpOrderForNav(
        canonical,
        currentId!,
        currentIdx,
        targetIdx,
      );

      isNavJumpRef.current = true;
      onScrollingChange?.(true);
      stopAnimation();

      pendingNavRef.current = {
        step: "preserved",
        targetId: id,
        currentId: currentId!,
      };
      setRenderSections(tempOrder);
    },
    [scrollToSectionId, scrollToSnapIndex, getSnapPanels, getSnapTarget, jumpToScrollLeft, onActiveSectionChange, onScrollingChange, stopAnimation],
  );

  // After a temporary reorder, preserve the current view, animate one panel
  // hop to the destination, then silently restore canonical order.
  useLayoutEffect(() => {
    const pending = pendingNavRef.current;
    if (!pending) return;

    if (pending.step === "preserved") {
      scrollToSectionId(pending.currentId, false);
      pending.step = "animating";
      requestAnimationFrame(() => {
        scrollToSectionId(pending.targetId, true, () => {
          pending.step = "restoring";
          setRenderSections(canonicalSectionsRef.current);
        });
      });
      return;
    }

    if (pending.step === "restoring") {
      scrollToSectionId(pending.targetId, false, () => {
        pendingNavRef.current = null;
        isNavJumpRef.current = false;
        onActiveSectionChange?.(pending.targetId);
        onScrollingChange?.(false);
      });
    }
  }, [
    renderSections,
    scrollToSectionId,
    onActiveSectionChange,
    onScrollingChange,
  ]);

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
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        loopSeamsEnabledRef.current = true;
      });
    });
  }, [scrollToSnapIndex]);

  // ---- scroll-end snap + active-section tracking ----------------------------

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let idleTimeout: ReturnType<typeof setTimeout>;
    let scrolling = false;

    const numReal = () => renderSectionsRef.current.length;
    const isCloneIndex = (snapIdx: number) =>
      snapIdx === 0 || snapIdx === numReal() + 1;

    const updateActiveSection = (snapIdx: number) => {
      const n = numReal();
      let section: Section | undefined;
      if (snapIdx === 0) section = renderSectionsRef.current[n - 1];
      else if (snapIdx === n + 1) section = renderSectionsRef.current[0];
      else section = renderSectionsRef.current[snapIdx - 1];
      if (section) onActiveSectionChange?.(section.id);
    };

    /** Instant jump at clone seams — avoids stopping mid-panel when the
     *  scroll range can't reach a clone's snap target (e.g. 68vw home). */
    const maybeTeleportLoopSeam = (): boolean => {
      if (!loopSeamsEnabledRef.current) return false;
      const panels = getSnapPanels();
      const n = numReal();
      if (panels.length < n + 2) return false;

      const scrollLeft = el.scrollLeft;
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      const cloneFirst = panels[n + 1];
      const cloneLast = panels[0];
      const firstReal = panels[1];
      const lastReal = panels[n];
      if (!cloneFirst || !cloneLast || !firstReal || !lastReal) return false;

      const { index: nearestIdx } = findNearestSnapIndex();
      const cloneFirstTarget = getSnapTarget(cloneFirst);

      // Forward wrap: clone-first is dominant, loop end reached, or the
      // full-width home preload panel has aligned (100vw = home + motto peek).
      if (
        nearestIdx === n + 1 ||
        scrollLeft >= maxScroll - 2 ||
        scrollLeft >= cloneFirstTarget - 2
      ) {
        jumpToScrollLeft(getSnapTarget(firstReal));
        lastSnappedIndexRef.current = 1;
        isSnappedRef.current = true;
        updateActiveSection(1);
        return true;
      }

      // Backward wrap: clone-last is dominant.
      if (nearestIdx === 0) {
        jumpToScrollLeft(getSnapTarget(lastReal));
        lastSnappedIndexRef.current = n;
        isSnappedRef.current = true;
        updateActiveSection(n);
        return true;
      }

      return false;
    };

    const handleIdle = () => {
      if (isAdjusting.current || isNavJumpRef.current) return;
      if (maybeTeleportLoopSeam()) {
        scrolling = false;
        onScrollingChange?.(false);
        return;
      }

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

      // Loop seam: animate to clone then teleport (fallback if instant seam missed).
      if (isCloneIndex(nearestIdx)) {
        maybeTeleportLoopSeam();
        return;
      }

      // Within the threshold of a real snap point → snap to it.
      if (nearestDist <= panelWidth * SNAP_THRESHOLD) {
        smoothScrollTo(getSnapTarget(nearest), SNAP_DURATION_MS, () => {
          lastSnappedIndexRef.current = nearestIdx;
          isSnappedRef.current = true;
          updateActiveSection(nearestIdx);
          scrolling = false;
          onScrollingChange?.(false);
        });
        return;
      }

      // Free zone: stay where we are, just report which section is the
      // dominant one in the viewport.
      isSnappedRef.current = false;
      updateActiveSection(nearestIdx);
      scrolling = false;
      onScrollingChange?.(false);
    };

    const handleScroll = () => {
      if (isAdjusting.current || isNavJumpRef.current) return;
      if (maybeTeleportLoopSeam()) {
        clearTimeout(idleTimeout);
        scrolling = false;
        onScrollingChange?.(false);
        return;
      }
      isSnappedRef.current = false;
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

  // ---- resize: keep snapped section aligned when vw-based layout shifts ----

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const numReal = () => renderSectionsRef.current.length;
    const isCloneIndex = (snapIdx: number) =>
      snapIdx === 0 || snapIdx === numReal() + 1;

    const resnapAfterResize = () => {
      if (!isSnappedRef.current || isNavJumpRef.current) return;

      const panels = getSnapPanels();
      const idx = lastSnappedIndexRef.current;
      const panel = panels[idx];
      if (!panel || isCloneIndex(idx)) return;

      stopAnimation();
      jumpToScrollLeft(getSnapTarget(panel));
      lastSnappedIndexRef.current = idx;
      isSnappedRef.current = true;
    };

    let frameId = 0;
    const scheduleResnap = () => {
      cancelAnimationFrame(frameId);
      // Two frames so vw widths + snap anchors finish reflowing.
      frameId = requestAnimationFrame(() => {
        frameId = requestAnimationFrame(resnapAfterResize);
      });
    };

    const ro = new ResizeObserver(scheduleResnap);
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [getSnapPanels, getSnapTarget, jumpToScrollLeft, stopAnimation]);

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

  const cloneLast = renderSections[renderSections.length - 1];
  const cloneFirst = renderSections[0];

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

      {renderSections.map((section) => (
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

      {cloneFirst &&
        (cloneFirst.id === "home" && cloneFirst.width && cloneFirst.width !== "100vw" ? (
          <div
            key="clone-first"
            data-snap-id="clone-first"
            className={`${panelClass} flex flex-shrink-0`}
            style={{ width: "100vw" }}
            aria-hidden="true"
          >
            <div
              className="h-full flex-shrink-0"
              style={{
                width: cloneFirst.width,
                backgroundColor: comteColors.darkGreen,
              }}
            />
            <div
              className="h-full flex-shrink-0"
              style={{
                width: `calc(100vw - ${cloneFirst.width})`,
                backgroundColor: MOTTO_DEFAULT_BG,
              }}
              aria-hidden="true"
            />
          </div>
        ) : (
          <div
            key="clone-first"
            data-snap-id="clone-first"
            className={panelClass}
            style={panelStyle(cloneFirst.width)}
            aria-hidden="true"
          >
            {cloneFirst.content}
          </div>
        ))}
    </div>
  );
}
