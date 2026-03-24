"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type MutableRefObject,
} from "react";
import Image from "next/image";
import ProjectNetwork, { type IntroPhase } from "./ProjectNetwork";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const LOGO_LETTERS = ["c", "o", "m", "t", "e"];
const HEADLINE_TEXT = "Innovation for societal impact";
const HEADLINE_WORDS = HEADLINE_TEXT.split(" ");

function PageOne() {
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

  const phaseIdx = ["dot", "typing-logo", "hold", "springout", "erasing", "typing-headline", "done"].indexOf(phase);
  const showLogo = shouldAnimate && phaseIdx >= 1 && phaseIdx <= 4;
  const showDot = shouldAnimate && phaseIdx >= 0 && phaseIdx <= 3;
  const showHeadline = phase === "typing-headline" || phase === "done";
  const showCta = phase === "done";

  return (
    <section style={{
      position: "relative",
      width: "100vw",
      height: "100vh",
      flexShrink: 0,
      background: "#F9F9ED",
      overflow: "hidden",
    }}>
      {/* Network map */}
      <ProjectNetwork
        mode="teaser"
        introPhase={shouldAnimate ? phase : "done"}
        logoDotPosition={dotPos}
      />

      {/* Logo dot (before springout) */}
      {showDot && (
        <div style={{
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
        }} />
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
                opacity: isErasing ? 0 : (phaseIdx >= 1 ? 1 : 0),
                transform: isErasing
                  ? "translateX(6px)"
                  : (phaseIdx >= 1 ? "translateX(0)" : "translateX(6px)"),
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
      <div style={{
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
      }}>
        {!shouldAnimate
          ? HEADLINE_TEXT
          : (() => {
            let charIndex = 0;
            return HEADLINE_WORDS.map((word, wordIndex) => (
              <span key={`${word}-${wordIndex}`} style={{ whiteSpace: "nowrap", display: "inline-block" }}>
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

      {/* CTA at bottom */}
      <a href="/projects" style={{
        position: "absolute",
        bottom: "3rem",
        left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "var(--font-geist-sans)",
        fontSize: "0.85rem",
        color: "rgba(0,0,0,0.45)",
        textDecoration: "none",
        zIndex: 5,
        opacity: showCta ? 1 : 0,
        transition: "opacity 0.5s ease 0.3s, color 0.2s ease",
      }}>
        Explore our projects →
      </a>
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
