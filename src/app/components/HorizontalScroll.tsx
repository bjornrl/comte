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
};

type Props = {
  sections: Section[];
  navRef?: React.MutableRefObject<HorizontalScrollNavApi | null>;
  onActiveSectionChange?: (id: string) => void;
  /** True on the first scroll event, false ~200ms after the last. */
  onScrollingChange?: (scrolling: boolean) => void;
};

/**
 * Horizontally scrolling section list with infinite-loop behaviour and
 * optional non-snap interstitial panels between sections.
 *
 * DOM order:
 *   [clone-of-last] [int? + real section]... [clone-of-first]
 *
 * Only main panels carry scroll-snap-align: start. Interstitials are
 * passed through during scroll motion. We track section identity via
 * data-snap-id (instead of fixed panel indices) because interstitials
 * make panel-index arithmetic unreliable.
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
  const isAdjusting = useRef(false);

  // -- helpers that work via DOM lookup so they're robust to interstitials --

  const getSnapPanels = useCallback((): HTMLElement[] => {
    const el = containerRef.current;
    if (!el) return [];
    return Array.from(el.querySelectorAll<HTMLElement>("[data-snap-id]"));
  }, []);

  const getActiveSnapIndex = useCallback((): number => {
    const el = containerRef.current;
    if (!el) return -1;
    const panels = getSnapPanels();
    if (panels.length === 0) return -1;
    const scrollLeft = el.scrollLeft;
    let bestIdx = 0;
    let bestDist = Infinity;
    panels.forEach((p, i) => {
      const dist = Math.abs(p.offsetLeft - scrollLeft);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    });
    return bestIdx;
  }, [getSnapPanels]);

  const scrollToSnapIndex = useCallback(
    (snapIdx: number, smooth = true) => {
      const el = containerRef.current;
      if (!el) return;
      const panels = getSnapPanels();
      const target = panels[snapIdx];
      if (!target) return;
      el.scrollTo({ left: target.offsetLeft, behavior: smooth ? "smooth" : "auto" });
    },
    [getSnapPanels],
  );

  const adjustScrollToSnapIndex = useCallback(
    (snapIdx: number) => {
      isAdjusting.current = true;
      scrollToSnapIndex(snapIdx, false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isAdjusting.current = false;
        });
      });
    },
    [scrollToSnapIndex],
  );

  const scrollToSection = useCallback(
    (id: string) => {
      const realIdx = sectionsRef.current.findIndex((s) => s.id === id);
      if (realIdx < 0) return;
      // snap-id index: [clone-last, real-0..real-N-1, clone-first]
      scrollToSnapIndex(realIdx + 1, true);
    },
    [scrollToSnapIndex],
  );

  const goNext = useCallback(() => {
    const idx = getActiveSnapIndex();
    if (idx < 0) return;
    scrollToSnapIndex(idx + 1, true);
  }, [getActiveSnapIndex, scrollToSnapIndex]);

  const goPrev = useCallback(() => {
    const idx = getActiveSnapIndex();
    if (idx < 0) return;
    scrollToSnapIndex(idx - 1, true);
  }, [getActiveSnapIndex, scrollToSnapIndex]);

  useEffect(() => {
    if (!navRef) return;
    navRef.current = { goNext, goPrev, scrollToSection };
    return () => {
      navRef.current = null;
    };
  }, [navRef, goNext, goPrev, scrollToSection]);

  // Park silently on the first real panel on mount.
  useEffect(() => {
    adjustScrollToSnapIndex(1);
  }, [adjustScrollToSnapIndex]);

  // Scroll tracking, teleport handling, and scrolling-state callback.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let stopTimeout: ReturnType<typeof setTimeout>;
    let scrolling = false;

    const handleScroll = () => {
      if (isAdjusting.current) return;
      if (!scrolling) {
        scrolling = true;
        onScrollingChange?.(true);
      }
      clearTimeout(stopTimeout);
      stopTimeout = setTimeout(() => {
        scrolling = false;
        onScrollingChange?.(false);

        const snapIdx = getActiveSnapIndex();
        if (snapIdx < 0) return;
        const numReal = sectionsRef.current.length;

        // Teleport on landing on a clone (snap-id index 0 or numReal+1).
        if (snapIdx === 0) {
          adjustScrollToSnapIndex(numReal);
          const last = sectionsRef.current[numReal - 1];
          if (last) onActiveSectionChange?.(last.id);
          return;
        }
        if (snapIdx === numReal + 1) {
          adjustScrollToSnapIndex(1);
          const first = sectionsRef.current[0];
          if (first) onActiveSectionChange?.(first.id);
          return;
        }

        const realIdx = snapIdx - 1;
        const section = sectionsRef.current[realIdx];
        if (section) onActiveSectionChange?.(section.id);
      }, 200);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });

    // Initial active-section report.
    const first = sectionsRef.current[0];
    if (first) onActiveSectionChange?.(first.id);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      clearTimeout(stopTimeout);
    };
  }, [onActiveSectionChange, onScrollingChange, adjustScrollToSnapIndex, getActiveSnapIndex]);

  // Vertical wheel → horizontal section advance, plus inner-scroll respect.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let lastTriggerAt = 0;
    const COOLDOWN_MS = 500;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.deltaY === 0) return;

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
      const now = performance.now();
      if (now - lastTriggerAt < COOLDOWN_MS) return;
      lastTriggerAt = now;

      if (e.deltaY > 0) goNext();
      else goPrev();
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [goNext, goPrev]);

  // BlobNav fallback dispatcher.
  useEffect(() => {
    const onNavigate = (e: Event) => {
      const detail = (e as CustomEvent<{ sectionId: string }>).detail;
      if (detail?.sectionId) scrollToSection(detail.sectionId);
    };
    window.addEventListener("comte:navigate", onNavigate as EventListener);
    return () => window.removeEventListener("comte:navigate", onNavigate as EventListener);
  }, [scrollToSection]);

  // Initial hash (/#projects) on mount.
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    if (hash) {
      requestAnimationFrame(() => scrollToSection(hash));
    }
  }, [scrollToSection]);

  const cloneLast = sections[sections.length - 1];
  const cloneFirst = sections[0];

  const mainPanelClass = "flex h-svh w-screen flex-shrink-0";
  const mainPanelStyle = { scrollSnapAlign: "start", scrollSnapStop: "always" } as const;

  return (
    <div
      ref={containerRef}
      data-horizontal-scroll="true"
      className="flex h-svh w-screen overflow-x-auto overflow-y-hidden"
      style={{
        scrollSnapType: "x mandatory",
        scrollBehavior: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {cloneLast && (
        <div
          key="clone-last"
          data-snap-id="clone-last"
          className={mainPanelClass}
          style={mainPanelStyle}
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
            className={mainPanelClass}
            style={mainPanelStyle}
          >
            {section.content}
          </div>
        </Fragment>
      ))}

      {cloneFirst && (
        <div
          key="clone-first"
          data-snap-id="clone-first"
          className={mainPanelClass}
          style={mainPanelStyle}
          aria-hidden="true"
        >
          {cloneFirst.content}
        </div>
      )}
    </div>
  );
}
