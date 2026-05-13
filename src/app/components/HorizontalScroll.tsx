"use client";

import { useRef, useEffect, useCallback, type ReactNode } from "react";

export type HorizontalScrollNavApi = {
  goNext: () => void;
  goPrev: () => void;
  scrollToSection: (id: string) => void;
};

type Section = {
  id: string;
  content: ReactNode;
};

type Props = {
  sections: Section[];
  navRef?: React.MutableRefObject<HorizontalScrollNavApi | null>;
  onActiveSectionChange?: (id: string) => void;
  /** True on the first scroll event, false ~200ms after the last. */
  onScrollingChange?: (scrolling: boolean) => void;
};

/**
 * Horizontally scrolling section list with infinite-loop behaviour.
 *
 * Renders [clone-of-last] [real sections] [clone-of-first]. On mount we
 * silently park at the first real panel. When the user lands on a clone
 * (after scrolling past either end) we teleport to the matching real
 * panel — visually seamless because the content is identical.
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

  const numReal = sections.length;
  const numPanels = numReal + 2; // + clone-last + clone-first

  const scrollToPanel = useCallback((panelIndex: number, smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({
      left: el.clientWidth * panelIndex,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // Same as scrollToPanel, but suppresses the scroll handler's
  // "scrolling=true" report for the next couple of frames so the
  // teleport doesn't briefly look like user-driven motion.
  const adjustScrollToPanel = useCallback(
    (panelIndex: number) => {
      isAdjusting.current = true;
      scrollToPanel(panelIndex, false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isAdjusting.current = false;
        });
      });
    },
    [scrollToPanel],
  );

  const scrollToSection = useCallback(
    (id: string) => {
      const realIdx = sectionsRef.current.findIndex((s) => s.id === id);
      if (realIdx >= 0) scrollToPanel(realIdx + 1, true);
    },
    [scrollToPanel],
  );

  const goNext = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const panelIndex = Math.round(el.scrollLeft / el.clientWidth);
    scrollToPanel(panelIndex + 1, true);
  }, [scrollToPanel]);

  const goPrev = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const panelIndex = Math.round(el.scrollLeft / el.clientWidth);
    scrollToPanel(panelIndex - 1, true);
  }, [scrollToPanel]);

  useEffect(() => {
    if (!navRef) return;
    navRef.current = { goNext, goPrev, scrollToSection };
    return () => {
      navRef.current = null;
    };
  }, [navRef, goNext, goPrev, scrollToSection]);

  // On mount: park silently on the first real panel (index 1).
  useEffect(() => {
    adjustScrollToPanel(1);
  }, [adjustScrollToPanel]);

  // Scroll tracking + teleport on landing on a clone.
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

        const panelIndex = Math.round(el.scrollLeft / el.clientWidth);

        // Landed on clone-of-last → teleport to real last.
        if (panelIndex === 0) {
          adjustScrollToPanel(numReal);
          const last = sectionsRef.current[numReal - 1];
          if (last) onActiveSectionChange?.(last.id);
          return;
        }
        // Landed on clone-of-first → teleport to real first.
        if (panelIndex === numPanels - 1) {
          adjustScrollToPanel(1);
          const first = sectionsRef.current[0];
          if (first) onActiveSectionChange?.(first.id);
          return;
        }

        const realIdx = panelIndex - 1;
        const section = sectionsRef.current[realIdx];
        if (section) onActiveSectionChange?.(section.id);
      }, 200);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });

    // Initial active-section report (assume we're parked on the first real panel)
    const first = sectionsRef.current[0];
    if (first) onActiveSectionChange?.(first.id);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      clearTimeout(stopTimeout);
    };
  }, [onActiveSectionChange, onScrollingChange, adjustScrollToPanel, numReal, numPanels]);

  // Listen for nav events from the fallback BlobNav dispatcher.
  useEffect(() => {
    const onNavigate = (e: Event) => {
      const detail = (e as CustomEvent<{ sectionId: string }>).detail;
      if (detail?.sectionId) scrollToSection(detail.sectionId);
    };
    window.addEventListener("comte:navigate", onNavigate as EventListener);
    return () => window.removeEventListener("comte:navigate", onNavigate as EventListener);
  }, [scrollToSection]);

  // Vertical wheel → horizontal section advance. Trackpad horizontal swipes
  // (where |deltaX| > |deltaY|) are left alone so the native horizontal
  // scroll still works.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let lastTriggerAt = 0;
    const COOLDOWN_MS = 500;

    const handleWheel = (e: WheelEvent) => {
      // Trackpad horizontal scroll — let the browser handle it natively.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      // No vertical intent → nothing to translate.
      if (e.deltaY === 0) return;

      // If the wheel event originated inside an inner horizontally-scrollable
      // element (e.g. the team panel's inner scroller), let that element keep
      // the event — don't hijack into a section advance.
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

  // Honour initial hash (e.g. /#projects) on mount.
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    if (hash) {
      requestAnimationFrame(() => scrollToSection(hash));
    }
  }, [scrollToSection]);

  const cloneLast = sections[sections.length - 1];
  const cloneFirst = sections[0];

  return (
    <div
      ref={containerRef}
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
          className="flex h-svh w-screen flex-shrink-0"
          style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}
          aria-hidden="true"
        >
          {cloneLast.content}
        </div>
      )}

      {sections.map((section) => (
        <div
          key={section.id}
          className="flex h-svh w-screen flex-shrink-0"
          style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}
        >
          {section.content}
        </div>
      ))}

      {cloneFirst && (
        <div
          key="clone-first"
          className="flex h-svh w-screen flex-shrink-0"
          style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}
          aria-hidden="true"
        >
          {cloneFirst.content}
        </div>
      )}
    </div>
  );
}
