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
  /** Fires true on the first scroll event, false after scrolling has been
   * idle for ~200ms. Lets parents reflect a transient "scrolling now" state. */
  onScrollingChange?: (scrolling: boolean) => void;
};

export default function HorizontalScroll({
  sections,
  navRef,
  onActiveSectionChange,
  onScrollingChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  const scrollToIndex = useCallback((index: number, smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * index, behavior: smooth ? "smooth" : "auto" });
  }, []);

  const goNext = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const currentIndex = Math.round(el.scrollLeft / el.clientWidth);
    if (currentIndex < sectionsRef.current.length - 1) scrollToIndex(currentIndex + 1, true);
  }, [scrollToIndex]);

  const goPrev = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const currentIndex = Math.round(el.scrollLeft / el.clientWidth);
    if (currentIndex > 0) scrollToIndex(currentIndex - 1, true);
  }, [scrollToIndex]);

  const scrollToSection = useCallback(
    (id: string) => {
      const index = sectionsRef.current.findIndex((s) => s.id === id);
      if (index >= 0) scrollToIndex(index, true);
    },
    [scrollToIndex],
  );

  useEffect(() => {
    if (!navRef) return;
    navRef.current = { goNext, goPrev, scrollToSection };
    return () => {
      navRef.current = null;
    };
  }, [navRef, goNext, goPrev, scrollToSection]);

  // Track active section + transient "scrolling" state
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let stopTimeout: ReturnType<typeof setTimeout>;
    let scrolling = false;
    const handleScroll = () => {
      if (!scrolling) {
        scrolling = true;
        onScrollingChange?.(true);
      }
      clearTimeout(stopTimeout);
      stopTimeout = setTimeout(() => {
        scrolling = false;
        onScrollingChange?.(false);
        const idx = Math.round(el.scrollLeft / el.clientWidth);
        const section = sectionsRef.current[idx];
        if (section) onActiveSectionChange?.(section.id);
      }, 200);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    // Initial active-section report (no scroll yet → not "scrolling")
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    const initial = sectionsRef.current[idx];
    if (initial) onActiveSectionChange?.(initial.id);
    return () => {
      el.removeEventListener("scroll", handleScroll);
      clearTimeout(stopTimeout);
    };
  }, [onActiveSectionChange, onScrollingChange]);

  // Listen for nav events from the fallback BlobNav dispatcher
  useEffect(() => {
    const onNavigate = (e: Event) => {
      const detail = (e as CustomEvent<{ sectionId: string }>).detail;
      if (detail?.sectionId) scrollToSection(detail.sectionId);
    };
    window.addEventListener("comte:navigate", onNavigate as EventListener);
    return () => window.removeEventListener("comte:navigate", onNavigate as EventListener);
  }, [scrollToSection]);

  // Honour initial hash (e.g. /#projects) on mount
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    if (hash) {
      // Wait a frame so the container has measured its width
      requestAnimationFrame(() => scrollToSection(hash));
    }
  }, [scrollToSection]);

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
      {sections.map((section) => (
        <div
          key={section.id}
          className="flex h-svh w-screen flex-shrink-0"
          style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}
        >
          {section.content}
        </div>
      ))}
    </div>
  );
}
