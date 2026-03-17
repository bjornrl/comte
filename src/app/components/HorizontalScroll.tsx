"use client";

import { useRef, useEffect, useCallback } from "react";

const SECTIONS = [
  { id: 1, label: "Section 1", color: "#0f0f0f" },
  { id: 2, label: "Section 2", color: "#1a1a2e" },
  { id: 3, label: "Section 3", color: "#16213e" },
  { id: 4, label: "Section 4", color: "#0f3460" },
  { id: 5, label: "Section 5", color: "#533483" },
];

export default function HorizontalScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAdjusting = useRef(false);

  // We render: [clone of last] [1] [2] [3] [4] [5] [clone of first]
  // Total = 7 panels. The "real" pages are at indices 1–5.
  const panels = [
    { ...SECTIONS[SECTIONS.length - 1], key: "clone-last" },
    ...SECTIONS.map((s) => ({ ...s, key: `real-${s.id}` })),
    { ...SECTIONS[0], key: "clone-first" },
  ];

  const scrollToIndex = useCallback((index: number, smooth = false) => {
    const el = containerRef.current;
    if (!el) return;
    const panelWidth = el.clientWidth;
    el.scrollTo({
      left: panelWidth * index,
      behavior: smooth ? "smooth" : "instant",
    });
  }, []);

  // On mount, jump to index 1 (the real first section)
  useEffect(() => {
    scrollToIndex(1);
  }, [scrollToIndex]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let timeout: ReturnType<typeof setTimeout>;

    const handleScrollEnd = () => {
      if (isAdjusting.current) return;

      const panelWidth = el.clientWidth;
      const currentIndex = Math.round(el.scrollLeft / panelWidth);

      // If we've snapped to the clone of the last section (index 0),
      // jump to the real last section (index 5)
      if (currentIndex === 0) {
        isAdjusting.current = true;
        scrollToIndex(SECTIONS.length);
        requestAnimationFrame(() => {
          isAdjusting.current = false;
        });
      }
      // If we've snapped to the clone of the first section (index 6),
      // jump to the real first section (index 1)
      else if (currentIndex === panels.length - 1) {
        isAdjusting.current = true;
        scrollToIndex(1);
        requestAnimationFrame(() => {
          isAdjusting.current = false;
        });
      }
    };

    const onScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleScrollEnd, 80);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      clearTimeout(timeout);
    };
  }, [panels.length, scrollToIndex]);

  return (
    <div
      ref={containerRef}
      className="flex h-screen w-screen overflow-x-auto overflow-y-hidden"
      style={{
        scrollSnapType: "x mandatory",
        scrollBehavior: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {panels.map((panel) => (
        <section
          key={panel.key}
          className="flex h-screen w-screen flex-shrink-0 items-center justify-center"
          style={{
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
            backgroundColor: panel.color,
          }}
        >
          <h1 className="text-5xl font-bold text-white">{panel.label}</h1>
        </section>
      ))}
    </div>
  );
}
