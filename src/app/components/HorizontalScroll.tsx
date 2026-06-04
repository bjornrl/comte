"use client";

import { Fragment, useRef, useEffect, useLayoutEffect, useCallback, useState, type ReactNode } from "react";
import { dispatchSectionPrime } from "@/app/hooks/useSectionPrime";
import { LANDING_HOME_BG, MOTTO_DEFAULT_BG } from "./homeLayout";

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

// Smooth-scroll duration for programmatic nav jumps (BlobNav clicks, arrows).
// Higher = more graceful. Free wheel scrolling uses momentum smoothing instead.
const NAV_DURATION_MS = 500;

// How long the container must be idle before a non-wheel scroll (touch drag,
// scrollbar) is considered "ended" and we drop the isScrolling flag.
const SCROLL_IDLE_MS = 150;

// Cap on how far a single wheel tick can advance the momentum target, expressed
// as a fraction of viewport width. Stops a single mousewheel click from blasting
// the target past 2+ panels in one event.
const MAX_WHEEL_DELTA_FRACTION = 1.1;

// Momentum smoothing — the fraction of the remaining distance to the target the
// scroll position covers each frame. Lower = longer, glidier "yourbana" tail;
// higher = snappier. ~0.12 gives a smooth, weighty glide at 60fps.
const WHEEL_SMOOTHING = 0.12;

// Below this distance (px) from the target we consider the glide finished and
// settle exactly onto it.
const SETTLE_EPSILON_PX = 0.5;

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
  const anchorPos = withoutTarget.findIndex((s) => s.id === anchorId);

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
 * Free scrolling is smooth and snap-free (à la yourbana.com): wheel/trackpad
 * input feeds a momentum target and the scroll position lerps toward it each
 * frame, so the page glides and can rest anywhere. The infinite loop is
 * maintained by continuously wrapping the scroll position across the clone
 * seams every frame, so the glide is never interrupted. Programmatic nav
 * (BlobNav, arrows) still animates with a controlled-duration easing curve.
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
  /** Last panel index a nav jump landed on (real or clone). */
  const lastSnappedIndexRef = useRef(1);
  /** False until the initial park-on-home on mount completes. */
  const loopSeamsEnabledRef = useRef(false);

  // ---- momentum (free wheel scroll) -----------------------------------------
  /** Desired scrollLeft the momentum glide is chasing. */
  const targetRef = useRef(0);
  /** RAF id for the momentum glide loop (null when idle). */
  const momentumRaf = useRef<number | null>(null);
  /** Whether we've reported isScrolling=true to the parent. */
  const scrollingRef = useRef(false);
  /** Last section id reported active — dedupes per-frame setState calls. */
  const lastActiveIdRef = useRef<string | null>(null);

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

  const stopMomentum = useCallback(() => {
    if (momentumRaf.current != null) {
      cancelAnimationFrame(momentumRaf.current);
      momentumRaf.current = null;
    }
  }, []);

  /**
   * Keep scrollLeft within the first loop period [firstReal, cloneFirst) by
   * teleporting across the clone seam whenever it crosses out. The seam content
   * is identical on both sides (clones are exact copies), so the jump is
   * invisible. The momentum target moves by the same delta so the glide
   * continues uninterrupted. Runs every frame — this is what makes the infinite
   * loop work without snapping to align it first.
   */
  const wrapLoop = useCallback(() => {
    if (!loopSeamsEnabledRef.current) return;
    const el = containerRef.current;
    if (!el) return;
    const panels = getSnapPanels();
    const n = renderSectionsRef.current.length;
    if (panels.length < n + 2) return;
    const firstRealLeft = panels[1].offsetLeft;
    const cloneFirstLeft = panels[n + 1].offsetLeft;
    const loopWidth = cloneFirstLeft - firstRealLeft;
    if (loopWidth <= 0) return;

    if (el.scrollLeft >= cloneFirstLeft) {
      el.scrollLeft -= loopWidth;
      targetRef.current -= loopWidth;
    } else if (el.scrollLeft < firstRealLeft) {
      el.scrollLeft += loopWidth;
      targetRef.current += loopWidth;
    }
  }, [getSnapPanels]);

  /** Report the section nearest the viewport's left edge to the parent, mapping
   *  clone panels back to their real section. Deduped so we only fire on change. */
  const reportActiveSection = useCallback(() => {
    const { index } = findNearestSnapIndex();
    if (index < 0) return;
    const list = renderSectionsRef.current;
    const n = list.length;
    let section: Section | undefined;
    if (index === 0) section = list[n - 1];
    else if (index === n + 1) section = list[0];
    else section = list[index - 1];
    if (section && section.id !== lastActiveIdRef.current) {
      lastActiveIdRef.current = section.id;
      onActiveSectionChange?.(section.id);
    }
  }, [findNearestSnapIndex, onActiveSectionChange]);

  /** Holds the latest stepMomentum so the RAF loop can recurse without the
   *  callback referencing itself before declaration. */
  const stepMomentumRef = useRef<() => void>(() => {});

  /** Momentum glide: lerp scrollLeft toward the target each frame, wrapping the
   *  loop and reporting the active section as we go. Stops when settled. */
  const stepMomentum = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      momentumRaf.current = null;
      return;
    }
    const current = el.scrollLeft;
    const diff = targetRef.current - current;

    if (Math.abs(diff) < SETTLE_EPSILON_PX) {
      el.scrollLeft = targetRef.current;
      wrapLoop();
      targetRef.current = el.scrollLeft;
      reportActiveSection();
      momentumRaf.current = null;
      scrollingRef.current = false;
      onScrollingChange?.(false);
      return;
    }

    el.scrollLeft = current + diff * WHEEL_SMOOTHING;
    wrapLoop();
    reportActiveSection();
    momentumRaf.current = requestAnimationFrame(() => stepMomentumRef.current());
  }, [wrapLoop, reportActiveSection, onScrollingChange]);

  useEffect(() => {
    stepMomentumRef.current = stepMomentum;
  }, [stepMomentum]);

  /** RAF-driven smooth scroll with easeOutCubic. Replaces the native
   * scrollTo({ behavior: 'smooth' }) so duration is fully under our control. */
  const smoothScrollTo = useCallback(
    (targetX: number, duration: number, onComplete?: () => void) => {
      const el = containerRef.current;
      if (!el) return;
      stopAnimation();
      stopMomentum();
      const startX = el.scrollLeft;
      const distance = targetX - startX;
      if (Math.abs(distance) < 0.5) {
        targetRef.current = el.scrollLeft;
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
          // Re-sync the momentum target so the next wheel tick continues from
          // here instead of snapping back to a stale target.
          targetRef.current = el.scrollLeft;
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
    [stopAnimation, stopMomentum],
  );

  /** Instant scroll (no animation) used for the loop teleport. */
  const jumpToScrollLeft = useCallback(
    (targetX: number) => {
      const el = containerRef.current;
      if (!el) return;
      stopAnimation();
      stopMomentum();
      isAdjusting.current = true;
      el.scrollLeft = targetX;
      targetRef.current = targetX;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isAdjusting.current = false;
        });
      });
    },
    [stopAnimation, stopMomentum],
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
      const targetX = getSnapTarget(target);
      if (smooth) {
        smoothScrollTo(targetX, NAV_DURATION_MS, onComplete);
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

      // Derive the current section from the live scroll position so nav works
      // correctly even when the page is resting freely between sections.
      const { index: nearestIdx } = findNearestSnapIndex();
      const currentId = getSectionIdAtSnapIndex(
        nearestIdx,
        renderSectionsRef.current,
      );
      const currentIdx = canonical.findIndex((s) => s.id === currentId);
      if (currentIdx < 0 || currentIdx === targetIdx) return;

      // Highlight the destination nav item immediately on click — don't wait
      // for the scroll / snap animation to finish.
      onActiveSectionChange?.(id);

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
    [scrollToSectionId, scrollToSnapIndex, getSnapPanels, getSnapTarget, jumpToScrollLeft, findNearestSnapIndex, onActiveSectionChange, onScrollingChange, stopAnimation],
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

  // ---- loop wrap + active-section tracking for non-wheel scrolling ----------
  // Wheel scrolling is driven by the momentum loop (which wraps + reports as it
  // runs). This listener covers everything else — touch drags, scrollbar drags,
  // keyboard — keeping the infinite loop seamless and the nav highlight in sync.

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let idleTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      // The momentum loop and nav animations manage their own wrapping +
      // reporting; don't double-process their scroll events here.
      if (momentumRaf.current != null || isAdjusting.current || isNavJumpRef.current) {
        return;
      }
      wrapLoop();
      reportActiveSection();
      if (!scrollingRef.current) {
        scrollingRef.current = true;
        onScrollingChange?.(true);
      }
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        scrollingRef.current = false;
        onScrollingChange?.(false);
        targetRef.current = el.scrollLeft;
        reportActiveSection();
      }, SCROLL_IDLE_MS);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });

    // Initial active-section report.
    reportActiveSection();

    return () => {
      el.removeEventListener("scroll", handleScroll);
      clearTimeout(idleTimeout);
      stopMomentum();
      stopAnimation();
    };
  }, [wrapLoop, reportActiveSection, onScrollingChange, stopMomentum, stopAnimation]);

  // ---- resize: keep the current section aligned when vw-based layout shifts -

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const realignAfterResize = () => {
      if (isNavJumpRef.current || momentumRaf.current != null) return;

      // Re-anchor to the section nearest the viewport so vw-width reflow
      // doesn't leave the page resting at a meaningless offset.
      const { index } = findNearestSnapIndex();
      const panels = getSnapPanels();
      const panel = panels[index];
      if (!panel) return;

      stopAnimation();
      jumpToScrollLeft(getSnapTarget(panel));
      wrapLoop();
    };

    let frameId = 0;
    const scheduleRealign = () => {
      cancelAnimationFrame(frameId);
      // Two frames so vw widths + snap anchors finish reflowing.
      frameId = requestAnimationFrame(() => {
        frameId = requestAnimationFrame(realignAfterResize);
      });
    };

    const ro = new ResizeObserver(scheduleRealign);
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [findNearestSnapIndex, getSnapPanels, getSnapTarget, jumpToScrollLeft, wrapLoop, stopAnimation]);

  const applyWheelDelta = useCallback((deltaX: number, deltaY: number) => {
    const el = containerRef.current;
    if (!el) return;

    // A new wheel gesture cancels any in-flight nav animation and hands control
    // back to free scrolling.
    stopAnimation();
    isAdjusting.current = false;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    if (absX === 0 && absY === 0) return;

    let delta: number;
    if (absX > absY) delta = deltaX;
    else if (absY > absX) delta = deltaY;
    else delta = deltaX + deltaY;

    const maxDelta = el.clientWidth * MAX_WHEEL_DELTA_FRACTION;
    delta = Math.max(-maxDelta, Math.min(maxDelta, delta));

    // Feed the momentum target rather than moving scrollLeft directly. The glide
    // loop chases the target each frame, producing the smooth, weighty motion.
    // Seed the target from the live position when the loop is idle so we never
    // glide from a stale value.
    if (momentumRaf.current == null) targetRef.current = el.scrollLeft;
    targetRef.current += delta;

    if (!scrollingRef.current) {
      scrollingRef.current = true;
      onScrollingChange?.(true);
    }
    if (momentumRaf.current == null) {
      momentumRaf.current = requestAnimationFrame(stepMomentum);
    }
  }, [stopAnimation, stepMomentum, onScrollingChange]);

  const shouldIgnoreWheelTarget = useCallback((target: EventTarget | null): boolean => {
    const el = containerRef.current;
    if (!el || !(target instanceof Element)) return true;

    let node: Element | null = target;
    while (node && node !== el) {
      if (node instanceof HTMLElement) {
        if (node.getAttribute("role") === "dialog") return true;
        if (node.dataset.comteModalScroll === "true") return true;

        const style = getComputedStyle(node);
        const overflowX = style.overflowX;
        if (overflowX === "auto" || overflowX === "scroll") {
          const hasOverflow = node.scrollWidth > node.clientWidth + 1;
          if (hasOverflow) return true;
        }

        const overflowY = style.overflowY;
        if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
          const hasOverflow = node.scrollHeight > node.clientHeight + 1;
          if (hasOverflow) return true;
        }
      }
      node = node.parentElement;
    }
    return false;
  }, []);

  // ---- wheel: vertical + horizontal trackpad → smoothed momentum target -----

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (shouldIgnoreWheelTarget(e.target)) return;
      e.preventDefault();
      applyWheelDelta(e.deltaX, e.deltaY);
    };

    const handleIframeWheel = (e: Event) => {
      const detail = (e as CustomEvent<{ deltaX: number; deltaY: number }>).detail;
      if (!detail) return;
      applyWheelDelta(detail.deltaX, detail.deltaY);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("comte:wheel-scroll", handleIframeWheel);
    return () => {
      el.removeEventListener("wheel", handleWheel);
      window.removeEventListener("comte:wheel-scroll", handleIframeWheel);
    };
  }, [applyWheelDelta, shouldIgnoreWheelTarget]);

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
                backgroundColor: LANDING_HOME_BG,
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
