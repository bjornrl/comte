"use client";

import {
  useRef,
  useEffect,
  useCallback,
  type MutableRefObject,
} from "react";
import Image from "next/image";
import ProjectCluster from "./ProjectCluster";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function PageOne() {
  return (
    <section className="flex h-screen w-screen flex-shrink-0 items-center justify-center bg-background px-6 md:px-12 lg:px-24">
      <h1 className="font-sans font-light text-foreground text-center leading-tight tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl max-w-[18ch]">
        INNOVATION FOR SOCIETAL IMPACT
      </h1>
    </section>
  );
}

function PageTwo() {
  return (
    <section
      className="h-screen w-screen flex-shrink-0 bg-background"
      style={{
        display: "grid",
        gridTemplateColumns: ".1fr repeat(2, 1fr) .1fr",
        gridTemplateRows: ".2fr repeat(2, 1fr) .2fr",
        columnGap: 2,
        rowGap: 2,
      }}
    >
      <div
        className="relative overflow-hidden flex items-end justify-start"
        style={{ gridArea: "2 / 2 / 3 / 3" }}
      >
        <h2 className="text-5xl font-light text-foreground">Section 1</h2>
      </div>
      <div
        className="h-full min-h-0"
        style={{ gridArea: "3 / 2 / 4 / 3" }}
      >
        <div className="relative overflow-hidden h-full w-full">
          <Image
            src={PLACEHOLDER_IMAGE}
            alt=""
            fill
            className="object-cover"
            sizes="50vw"
          />
        </div>

      </div>
      <div
        className="relative overflow-hidden flex items-end justify-start"
        style={{ gridArea: "2 / 3 / 3 / 4" }}
      ><h2 className="text-2xl font-light text-foreground">Section 3</h2>
        {/* <Image
          src={PLACEHOLDER_IMAGE}
          alt=""
          fill
          className="object-cover"
          sizes="50vw"
        /> */}
      </div>
      <div
        className="relative overflow-hidden"
        style={{ gridArea: "3 / 3 / 4 / 4" }}
      ><h2 className="text-5xl font-light text-foreground">Section 4</h2>
        <Image
          src={PLACEHOLDER_IMAGE}
          alt=""
          fill
          className="object-cover"
          sizes="50vw"
        />
      </div>
    </section>
  );
}

function PageThree() {
  return (
    <section
      className="h-screen w-screen flex-shrink-0 bg-background"
      style={{
        display: "grid",
        gridTemplateColumns: ".1fr repeat(2, 1fr) .1fr",
        gridTemplateRows: ".2fr repeat(2, 1fr) .2fr",
        columnGap: 2,
        rowGap: 2,
      }}
    >
      <div
        className="relative overflow-hidden flex items-end justify-start"
        style={{ gridArea: "2 / 2 / 3 / 3" }}
      >
        <h2 className="text-5xl font-light text-foreground">Why &ldquo;Comte&rdquo;?</h2>
      </div>
      <div
        className="grid grid-cols-2 gap-1 h-full min-h-0"
        style={{ gridArea: "3 / 2 / 4 / 3" }}
      >
        <div className="relative overflow-hidden min-h-0">
          <Image
            src={PLACEHOLDER_IMAGE}
            alt=""
            fill
            className="object-cover"
            sizes="50vw"
          />
        </div>
        <div className="relative overflow-hidden min-h-0">
          <Image
            src={PLACEHOLDER_IMAGE}
            alt=""
            fill
            className="object-cover"
            sizes="50vw"
          />
        </div>
      </div>
      <div
        className="relative overflow-hidden grid grid-cols-2"
        style={{ gridArea: "2 / 3 / 4 / 4" }}
      >
        <p>aijwdbaodw</p>
        <p>aijwdbaodw</p>
      </div>
    </section>
  );
}

function PageFour() {
  return (
    <section
      className="h-screen w-screen flex-shrink-0 bg-background"
      style={{
        display: "grid",
        gridTemplateColumns: ".1fr repeat(2, 1fr) .1fr",
        gridTemplateRows: ".2fr repeat(2, 1fr) .2fr",
        columnGap: 2,
        rowGap: 2,
      }}
    >
      <div
        className="relative overflow-hidden flex items-end justify-start"
        style={{ gridArea: "2 / 2 / 3 / 3" }}
      >
        <h2 className="text-5xl font-light text-foreground">Section 1</h2>
      </div>
      <div
        className="grid grid-cols-2 gap-1 h-full min-h-0"
        style={{ gridArea: "3 / 2 / 4 / 3" }}
      >
        <div className="relative overflow-hidden min-h-0">
          <Image
            src={PLACEHOLDER_IMAGE}
            alt=""
            fill
            className="object-cover"
            sizes="50vw"
          />
        </div>
        <div className="relative overflow-hidden min-h-0">
          <Image
            src={PLACEHOLDER_IMAGE}
            alt=""
            fill
            className="object-cover"
            sizes="50vw"
          />
        </div>
      </div>
      <div
        className="relative overflow-hidden"
        style={{ gridArea: "2 / 3 / 4 / 4" }}
      >
        <Image
          src={PLACEHOLDER_IMAGE}
          alt=""
          fill
          className="object-cover"
          sizes="50vw"
        />
      </div>
    </section>
  );
}

const PLACEHOLDER_PROJECTS = [
  { year: "2024", customer: "Acme Corp", achievement: "Brand identity & web" },
  { year: "2024", customer: "Nordic Design", achievement: "Campaign concept" },
  { year: "2023", customer: "Studio Oslo", achievement: "Editorial design" },
  { year: "2023", customer: "TechStart", achievement: "Product launch site" },
  { year: "2023", customer: "Museum Nord", achievement: "Exhibition identity" },
  { year: "2022", customer: "Green Energy Co", achievement: "Annual report" },
  { year: "2022", customer: "Fashion House", achievement: "Lookbook & campaign" },
  { year: "2022", customer: "Food & Wine", achievement: "Magazine redesign" },
  { year: "2021", customer: "Architects AS", achievement: "Portfolio site" },
  { year: "2021", customer: "City Council", achievement: "Public campaign" },
  { year: "2021", customer: "Startup Lab", achievement: "Pitch deck & brand" },
  { year: "2020", customer: "Gallery One", achievement: "Exhibition catalogue" },
  { year: "2020", customer: "Health First", achievement: "App UI & branding" },
  { year: "2020", customer: "Local Brewery", achievement: "Packaging & identity" },
];

function PageFive() {
  return (
    <section className="flex h-screen w-screen flex-shrink-0 items-center justify-center bg-background min-pt:18 p-6 md:p-12 lg:p-24">
      <div className="rounded-xl border border-foreground/30 bg-[#EEEEEE] w-full h-full overflow-y-auto">
        <div className="sticky top-0 z-10 grid grid-cols-3 gap-x-4 border-b border-foreground/30 bg-[#EEEEEE] px-4 py-3 text-left text-sm font-medium text-foreground/70">
          <span>Year</span>
          <span>Customer</span>
          <span>Achievement</span>
        </div>
        {PLACEHOLDER_PROJECTS.map((p, i) => (
          <div
            key={i}
            className="grid grid-cols-3 gap-x-4 border-b border-foreground/20 px-4 py-4 text-left"
          >
            <p className="text-lg font-light">{p.year}</p>
            <p className="text-lg font-light">{p.customer}</p>
            <p className="text-lg font-light">{p.achievement}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PageSix() {
  return <ProjectCluster />;
}

const PAGES = [PageOne, PageTwo, PageThree, PageFour, PageFive, PageSix];

export type HorizontalScrollNavApi = {
  goNext: () => void;
  goPrev: () => void;
};

type HorizontalScrollProps = {
  navRef?: MutableRefObject<HorizontalScrollNavApi | null>;
};

export default function HorizontalScroll({ navRef }: HorizontalScrollProps) {
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
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  const goNext = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const panelWidth = el.clientWidth;
    const currentIndex = Math.round(el.scrollLeft / panelWidth);
    const next = Math.min(currentIndex + 1, panels.length - 1);
    if (next !== currentIndex) scrollToIndex(next, true);
  }, [scrollToIndex, panels.length]);

  const goPrev = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const panelWidth = el.clientWidth;
    const currentIndex = Math.round(el.scrollLeft / panelWidth);
    const prev = Math.max(currentIndex - 1, 0);
    if (prev !== currentIndex) scrollToIndex(prev, true);
  }, [scrollToIndex]);

  useEffect(() => {
    if (!navRef) return;
    navRef.current = { goNext, goPrev };
    return () => {
      navRef.current = null;
    };
  }, [navRef, goNext, goPrev]);

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
