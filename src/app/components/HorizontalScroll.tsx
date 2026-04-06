"use client";

import { useRef, useState, useEffect, useCallback, type MutableRefObject } from "react";
import Image from "next/image";
import ProjectNetwork, { type IntroPhase } from "./ProjectNetwork";
import type { Project } from "./projectNetworkData";
import StatCard from "./StatCard";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const LOGO_LETTERS = ["c", "o", "m", "t", "e"];
const DEFAULT_HEADLINE = "Innovation for societal impact";

function PageOne({ heroText }: { heroText?: string }) {
  const HEADLINE_TEXT = heroText || DEFAULT_HEADLINE;
  const HEADLINE_WORDS = HEADLINE_TEXT.split(" ");
  const [phase, setPhase] = useState<IntroPhase>("dot");
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const [dotPos, setDotPos] = useState({ x: 0, y: 0 });
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const played = sessionStorage.getItem("comte-intro-played");
    if (played || reducedMotion.current) {
      setPhase("done");
      return;
    }

    setShouldAnimate(true);
    sessionStorage.setItem("comte-intro-played", "true");

    const timers = [
      setTimeout(() => setPhase("typing-logo"), 250),
      setTimeout(() => setPhase("hold"), 900),
      setTimeout(() => setPhase("springout"), 1100),
      setTimeout(() => setPhase("erasing"), 1800),
      setTimeout(() => setPhase("typing-headline"), 2400),
      setTimeout(() => setPhase("done"), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Measure dot position relative to "comte" text
  useEffect(() => {
    if (!logoRef.current) return;
    const measure = () => {
      const el = logoRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setDotPos({ x: rect.right + 4, y: rect.top - 4 });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const phaseIdx = [
    "dot",
    "typing-logo",
    "hold",
    "springout",
    "erasing",
    "typing-headline",
    "done",
  ].indexOf(phase);
  const showLogo = shouldAnimate && phaseIdx >= 1 && phaseIdx <= 4;
  const showDot = shouldAnimate && phaseIdx >= 0 && phaseIdx <= 3;
  const showHeadline = phase === "typing-headline" || phase === "done";
  const showCta = phase === "done";

  return (
    <section
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        flexShrink: 0,
        background: "#F9F9ED",
        overflow: "hidden",
      }}
    >
      {/* Network map */}
      <ProjectNetwork
        mode="teaser"
        introPhase={shouldAnimate ? phase : "done"}
        logoDotPosition={dotPos}
      />

      {/* Logo dot (before springout) */}
      {showDot && (
        <div
          style={{
            position: "fixed",
            left: dotPos.x + 40,
            top: dotPos.y - 4,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#212121",
            zIndex: 15,
            opacity: phase === "dot" ? 1 : 1,
            transition: "opacity 0.25s ease-out",
            pointerEvents: "none",
          }}
        />
      )}

      {/* "comte" typewriter text — always mounted for measurement, visibility controlled */}
      <div
        ref={logoRef}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "var(--font-bebas)",
          fontSize: "clamp(2.5rem, 7vw, 5rem)",
          lineHeight: 0.95,
          letterSpacing: "0.01em",
          color: "#1F3A32",
          zIndex: 15,
          pointerEvents: "none",
          display: "flex",
          visibility: showLogo ? "visible" : "hidden",
        }}
      >
        {LOGO_LETTERS.map((letter, i) => {
          const isErasing = phase === "erasing";
          const eraseIdx = LOGO_LETTERS.length - 1 - i;
          const typeDelay = 250 + i * 100;
          const eraseDelay = isErasing ? eraseIdx * 80 : 0;

          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: isErasing ? 0 : phaseIdx >= 1 ? 1 : 0,
                transform: isErasing
                  ? "translateX(6px)"
                  : phaseIdx >= 1
                    ? "translateX(0)"
                    : "translateX(6px)",
                transition: isErasing
                  ? `opacity 0.1s ease-in ${eraseDelay}ms, transform 0.1s ease-in ${eraseDelay}ms`
                  : `opacity 0.12s cubic-bezier(0.16, 1, 0.3, 1) ${typeDelay}ms, transform 0.12s cubic-bezier(0.16, 1, 0.3, 1) ${typeDelay}ms`,
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>

      {/* "Innovation for societal impact" typewriter headline */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "var(--font-neue-haas)",
          fontWeight: 300,
          fontSize: "clamp(2.5rem, 7vw, 5rem)",
          lineHeight: 0.95,
          letterSpacing: "0.01em",
          color: "#1F3A32",
          textAlign: "center",
          maxWidth: "60vw",
          zIndex: 5,
          pointerEvents: "none",
          margin: 0,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {!shouldAnimate
          ? HEADLINE_TEXT
          : (() => {
              let charIndex = 0;
              return HEADLINE_WORDS.map((word, wordIndex) => (
                <span
                  key={`${word}-${wordIndex}`}
                  style={{ whiteSpace: "nowrap", display: "inline-block" }}
                >
                  {word.split("").map((char) => {
                    const currentIndex = charIndex++;
                    const charDelay = showHeadline ? currentIndex * 30 : 0;
                    return (
                      <span
                        key={`${wordIndex}-${currentIndex}`}
                        style={{
                          display: "inline-block",
                          opacity: showHeadline ? 1 : 0,
                          transform: showHeadline ? "translateY(0)" : "translateY(4px)",
                          transition: `opacity 0.08s cubic-bezier(0.16, 1, 0.3, 1) ${charDelay}ms, transform 0.08s cubic-bezier(0.16, 1, 0.3, 1) ${charDelay}ms`,
                        }}
                      >
                        {char}
                      </span>
                    );
                  })}
                  {wordIndex < HEADLINE_WORDS.length - 1 ? "\u00A0" : null}
                </span>
              ));
            })()}
      </div>
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
        className="relative overflow-hidden flex items-center justify-start"
        style={{ gridArea: "2 / 2 / 3 / 3" }}
      >
        <h2 className="text-5xl font-light text-foreground">We are Comte.</h2>
      </div>
      <div className="h-full min-h-0" style={{ gridArea: "3 / 2 / 4 / 3" }}>
        <h2 className="text-2xl font-light text-foreground">
          A multidisciplinary innovation agency that designs the human-centered services, products,
          organizations, physical environments and experiences of the future.
          <br /> <br />
          We work with national departments, ministries, municipalities, private companies and
          organizations, in Norway and internationally, achieving societal impact, innovation, and
          wellbeing in all facets of society.
        </h2>
      </div>
      <div
        className="relative overflow-hidden flex items-end justify-start"
        style={{ gridArea: "2 / 3 / 3 / 4" }}
      >
        <div className="relative overflow-hidden h-full w-full">
          <Image
            src="/social-images/comte-social-8.jpg"
            alt=""
            fill
            className="object-cover rounded-lg"
            sizes="50vw"
          />
        </div>

        {/* <Image
          src={PLACEHOLDER_IMAGE}
          alt=""
          fill
          className="object-cover"
          sizes="50vw"
        /> */}
      </div>
      <div className="relative overflow-hidden" style={{ gridArea: "3 / 3 / 4 / 4" }}>
        <Image
          src="/social-images/comte-social-9.jpg"
          alt=""
          fill
          className="object-cover rounded-lg"
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
        className="relative overflow-hidden flex items-center justify-start"
        style={{ gridArea: "2 / 2 / 3 / 3" }}
      >
        <h2 className="text-5xl font-light text-foreground">
          Since 2012 we have becomeone of Norways most experienced innovation agencies.
        </h2>
      </div>
      <div
        className="grid h-full min-h-0 min-w-0 grid-cols-2 gap-2"
        style={{ gridArea: "3 / 2 / 4 / 3" }}
      >
        {/* Brand pairings: domain palette — forest / coral / gold / slate + canvas or ink */}
        <StatCard
          value="250+"
          description="Projects completed"
          bgColorClass="bg-transparent"
          backgroundColor="#1F3A32"
          textColor="#F9F9ED"
        />
        <StatCard
          value="32"
          description="Different municiplaities, counites, public departemnts collaborated and worked with us."
          bgColorClass="bg-transparent"
          backgroundColor="#F27887"
          textColor="#212121"
        />
      </div>
      <div
        className="relative overflow-hidden flex items-end justify-start"
        style={{ gridArea: "2 / 3 / 3 / 4" }}
      >
        <div className="relative overflow-hidden h-full w-full">
          {/* <Image src={PLACEHOLDER_IMAGE} alt="" fill className="object-cover" sizes="50vw" /> */}
        </div>

        {/* <Image
          src={PLACEHOLDER_IMAGE}
          alt=""
          fill
          className="object-cover"
          sizes="50vw"
        /> */}
      </div>
      <div
        className="grid h-full min-h-0 min-w-0 grid-cols-2 gap-2"
        style={{ gridArea: "3 / 3 / 4 / 4" }}
      >
        <StatCard
          value="3500+"
          description="People talked to as interview-subjects"
          bgColorClass="bg-transparent"
          backgroundColor="#D6B84C"
          textColor="#212121"
        />
        <StatCard
          value="18"
          description="Ongoing years of experience"
          bgColorClass="bg-transparent"
          backgroundColor="#5F7C8A"
          textColor="#F9F9ED"
        />
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
        gridTemplateColumns: ".1fr repeat(2, minmax(0, 1fr)) .1fr",
        gridTemplateRows: ".2fr minmax(0, 1fr) .2fr",
        columnGap: 2,
        rowGap: 2,
      }}
    >
      {/* Left half: headline */}
      <div
        className="relative flex min-h-0 min-w-0 items-center justify-start overflow-hidden pr-2 md:pr-4"
        style={{ gridArea: "2 / 2 / 3 / 3" }}
      >
        <h2 className="max-w-[42ch] text-pretty text-5xl font-light text-foreground">
          We focus on projects that are both challenging and impactful, with a scope that enables us
          to see development through from beginning to end.
        </h2>
      </div>
      {/* Right half: 2×2 stat cards (Comte domain palette) */}
      <div
        className="grid min-h-0 min-w-0 grid-cols-2 grid-rows-2 gap-1 md:gap-2"
        style={{ gridArea: "2 / 3 / 3 / 4" }}
      >
        <StatCard
          value="186 → 10"
          description="People in the municipal housing queue"
          bgColorClass="bg-transparent"
          backgroundColor="#1F3A32"
          textColor="#F9F9ED"
          href="/projects/hjemveien"
          linkLabel="View project"
        />
        <StatCard
          value="60%"
          description="Increase in STI testing"
          bgColorClass="bg-transparent"
          backgroundColor="#F27887"
          textColor="#212121"
          href="/projects/hjemveien"
          linkLabel="View project"
        />
        <StatCard
          value="50%"
          description="Reduction in sick leave"
          bgColorClass="bg-transparent"
          backgroundColor="#D6B84C"
          textColor="#212121"
          href="/projects/kindergarten-meals-trondheim"
          linkLabel="View project"
        />
        <StatCard
          value="55,000"
          description="Surgeries per year optimised with new control tower"
          bgColorClass="bg-transparent"
          backgroundColor="#5F7C8A"
          textColor="#F9F9ED"
          href="/projects/ous-control-tower"
          linkLabel="View project"
        />
      </div>
    </section>
  );
}

function PageFive({ projects: _projects }: { projects?: Project[] }) {
  return (
    <section
      className="h-screen w-screen flex-shrink-0 bg-background"
      style={{
        display: "grid",
        gridTemplateColumns: ".1fr repeat(2, minmax(0, 1fr)) .1fr",
        gridTemplateRows: ".2fr minmax(0, 1fr) .2fr",
        columnGap: 2,
        rowGap: 2,
      }}
    >
      {/* Left half: headline */}
      <div
        className="relative flex min-h-0 min-w-0 items-center flex flex-col justify-center items-start overflow-hidden pr-2 md:pr-4"
        style={{ gridArea: "2 / 2 / 3 / 3" }}
      >
        <h3 className="text-2xl font-light text-foreground">Our ambition:</h3>
        <br /> <br />
        <h2 className="max-w-[42ch] text-pretty text-5xl font-light text-foreground">
          Develop solutions that contribute to a sustainable, healthy and happy society.
        </h2>
      </div>
      {/* Right half: 2×2 images */}
      <div
        className="grid min-h-0 min-w-0 grid-cols-2 grid-rows-2 gap-1 md:gap-2"
        style={{ gridArea: "2 / 3 / 3 / 4" }}
      >
        <div className="relative min-h-0 min-w-0 overflow-hidden rounded-sm">
          <Image
            src="/social-images/comte-social-3.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 40vw, 25vw"
          />
        </div>
        <div className="relative min-h-0 min-w-0 overflow-hidden rounded-sm">
          <Image
            src="/social-images/comte-social-7.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 40vw, 25vw"
          />
        </div>
        <div className="relative min-h-0 min-w-0 overflow-hidden rounded-sm">
          <Image
            src="/social-images/comte-social-8.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 40vw, 25vw"
          />
        </div>
        <div className="relative min-h-0 min-w-0 overflow-hidden rounded-sm">
          <Image
            src="/social-images/comte-social-9.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 40vw, 25vw"
          />
        </div>
      </div>
    </section>
  );
}

// function PageSix() {
//   return <ProjectCluster />;
// }

const PAGES = [PageOne, PageTwo, PageThree, PageFour, PageFive];

export type HorizontalScrollNavApi = {
  goNext: () => void;
  goPrev: () => void;
};

type HorizontalScrollProps = {
  navRef?: MutableRefObject<HorizontalScrollNavApi | null>;
  onActiveIndexChange?: (index: number) => void;
  heroText?: string;
  projects?: Project[];
};

export default function HorizontalScroll({ navRef, onActiveIndexChange, heroText, projects }: HorizontalScrollProps) {
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

  const computeActiveIndexFromPanelIndex = useCallback(
    (panelIndex: number) => {
      // panels: [clone-last, real(0), real(1), real(2), real(3), real(4), clone-first]
      if (panelIndex === 0) return PAGES.length - 1; // clone-last -> last real
      if (panelIndex === panels.length - 1) return 0; // clone-first -> first real
      return panelIndex - 1; // real panels start at index 1
    },
    [panels.length],
  );

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

      onActiveIndexChange?.(computeActiveIndexFromPanelIndex(currentIndex));
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
        const pageProps: Record<string, unknown> = {};
        if (panel.pageIndex === 0) pageProps.heroText = heroText;
        if (panel.pageIndex === PAGES.length - 1) pageProps.projects = projects;
        return (
          <div
            key={panel.key}
            className="flex h-screen w-screen flex-shrink-0"
            style={{
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
            }}
          >
            <PageComponent {...pageProps} />
          </div>
        );
      })}
    </div>
  );
}
