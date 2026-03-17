"use client";

import { useRef, useEffect, useCallback } from "react";

function PageOne() {
  return (
    <section className="flex h-screen w-screen flex-shrink-0 items-center justify-center bg-white">
      <h1 className="font-sans text-5xl font-thin text-black">comte bureau</h1>
    </section>
  );
}

function PageTwo() {
  return (
    <section
      className="h-screen w-screen flex-shrink-0 bg-white"
      style={{
        display: "grid",
        gridTemplateColumns: ".05fr repeat(2, 1fr) .05fr",
        gridTemplateRows: ".1fr repeat(2, 1fr) .1fr",
        columnGap: 0,
        rowGap: 0,
      }}
    >
      <div
        className="p-2 flex items-end justify-start"
        style={{ gridArea: "2 / 2 / 3 / 3", background: "#f3f4f6" }} // lightest gray
      >
        <h1 className="text-5xl font-light text-black">Section 1</h1>
      </div>
      <div
        style={{ gridArea: "2 / 3 / 3 / 4", background: "#e5e7eb" }} // light gray
      />
      <div
        style={{ gridArea: "3 / 2 / 4 / 3", background: "#d1d5db" }} // medium gray
      />
      <div
        style={{ gridArea: "3 / 3 / 4 / 4", background: "#9ca3af" }} // darker gray
      />
    </section>
  );
}

function PageThree() {
  return (
    <section className="flex h-screen w-screen flex-shrink-0 items-center justify-center bg-white">
      <h1 className="text-5xl font-bold text-black">Section 3</h1>
    </section>
  );
}

function PageFour() {
  return (
    <section className="flex h-screen w-screen flex-shrink-0 items-center justify-center bg-white">
      <h1 className="text-5xl font-bold text-black">Section 4</h1>
    </section>
  );
}

function PageFive() {
  return (
    <section className="flex h-screen w-screen flex-shrink-0 items-center justify-center bg-white">
      <h1 className="text-5xl font-bold text-black">Section 5</h1>
    </section>
  );
}

const PAGES = [PageOne, PageTwo, PageThree, PageFour, PageFive];

export default function HorizontalScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAdjusting = useRef(false);

  // We render: [clone of last] [1] [2] [3] [4] [5] [clone of first]
  // Total = 7 panels. The "real" pages are at indices 1–5.
  const panels = [
    { type: "clone-last", pageIndex: PAGES.length - 1, key: "clone-last" },
    ...PAGES.map((_, idx) => ({ type: "real", pageIndex: idx, key: `real-${idx}` })),
    { type: "clone-first", pageIndex: 0, key: "clone-first" },
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
        scrollToIndex(PAGES.length);
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
      {panels.map((panel) => {
        const PageComponent = PAGES[panel.pageIndex];
        return (
          <div
            key={panel.key}
            className="flex h-screen w-screen flex-shrink-0"
            style={{
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
            }}
          >
            <PageComponent />
          </div>
        );
      })}
    </div>
  );
}
