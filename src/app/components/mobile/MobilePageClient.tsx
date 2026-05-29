"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type HomeData } from "../HomePageClient";
import { type CardItem } from "../sections/SectionCardGrid";
import { type Connection, type Domain, type Project } from "../projectNetworkData";
import {
  LANDING_HERO_ACCENT,
  LANDING_HERO_TEXT,
  LANDING_HOME_BG,
  MOTTO_DEFAULT_BG,
} from "../homeLayout";
import { comteColors } from "@/lib/comte-colors";
import MobileNav, { MOBILE_NAV_BOX_HEIGHT } from "./MobileNav";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";

type TeamMember = {
  _id?: string;
  name?: string;
  role?: string;
  photoUrl?: string;
};

export type ContactLocation = {
  title: string;
  address: string;
  description: string;
  zoom?: number;
};

type Props = {
  data: HomeData;
  projects: Project[];
  // Accepted but unused on mobile — kept so the component shares a prop
  // shape with HomePageClient and can be swapped in via ResponsiveHome.
  connections: Connection[];
  /** Location blocks for the contact section, sourced from aboutOffice. */
  contactLocations?: ContactLocation[];
};

/** Section IDs the mobile nav links to (must match BlobNav.NAV_ITEMS). */
const TRACKED_SECTION_IDS = [
  "home",
  "motto",
  "about-intro",
  "what-we-do",
  "projects",
  "team",
  "publications",
  "contact",
];

/**
 * Watch which mobile section is most in view and report it back so the nav
 * can highlight the right item / pick the right logo variant.
 */
function useActiveSection(): string | undefined {
  const [active, setActive] = useState<string | undefined>("home");

  useEffect(() => {
    const elements = TRACKED_SECTION_IDS.map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const visibility: Record<string, number> = {};
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility[entry.target.id] = entry.intersectionRatio;
        }
        let bestId: string | undefined;
        let bestRatio = 0;
        for (const id of TRACKED_SECTION_IDS) {
          const r = visibility[id] ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestId = id;
          }
        }
        if (bestId) setActive(bestId);
      },
      // Many thresholds → smooth handoff between sections as the user scrolls.
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return active;
}

/**
 * Mobile entry point — vertical scrolling counterpart to HomePageClient.
 *
 * First pass: each home section is rendered as a simple vertical block, ~svh
 * tall, with heading + primary content. No horizontal-scroll machinery, no
 * shared landing layer, no nav blob. We'll refine each section's design
 * in follow-up passes — this scaffold just gets vertical scroll working
 * end-to-end without touching the desktop experience.
 */
export default function MobilePageClient({
  data,
  projects,
  contactLocations,
}: Props) {
  const activeSection = useActiveSection();
  return (
    <>
      <MobileNav activeSection={activeSection} />
      <main
        className="min-h-svh w-full"
        // overflowX: 'clip' prevents inner horizontal scrollers from
        // spilling sideways without establishing a scroll container —
        // unlike overflow-x: hidden, this keeps position:sticky working
        // for descendants like the projects section filter bar.
        style={{
          overflowX: "clip",
          scrollPaddingTop: MOBILE_NAV_BOX_HEIGHT + 24,
        }}
      >
        <SectionHomeMobile />
        <SectionFlowMobile />
        <SectionMottoMobile />
        <SectionAboutIntroMobile {...data.aboutIntro} />
        <SectionImagePlaceholderMobile
          imageUrl={data.aboutIntro.imageUrl}
          imageAlt={data.aboutIntro.imageAlt}
        />
        <SectionWhatWeDoMobile {...data.whatWeDo} />
        <SectionProjectsMobile
          heading={data.projects.heading}
          bg={data.projects.backgroundColor}
          projects={projects}
        />
        <SectionTeamMobile heading={data.team.heading} members={data.team.members} />
        <SectionPublicationsMobile
          heading={data.publications.heading}
          body={data.publications.body}
          items={data.publications.items}
        />
        <SectionContactMobile locations={contactLocations} />
      </main>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Section blocks — minimal first pass. Match desktop colors so the
 * mobile experience reads as the same brand, but layout is vertical
 * and natively scrollable.
 * ------------------------------------------------------------------ */

const SECTION_BASE = "relative w-full flex flex-col px-6 py-16 sm:px-8";

/* Project section palette — mirrors the desktop ProjectCluster tuning
 * for the cream (#F5F5E9) background. Kept local so the mobile section
 * can stand alone if the desktop palette ever drifts. */
const PROJECT_BG = "#F5F5E9";
const PROJECT_FG = "#1F3A32";

const PROJECT_DOMAIN_COLORS: Record<Domain, string> = {
  health: "#2E7855",
  education: "#C73D74",
  integration: "#C04B1F",
  urban: "#3D5C75",
  climate: "#4F6F33",
  digital: "#CC4444",
  culture: "#7A3D8A",
  policy: "#555E70",
};

const PROJECT_DOMAIN_LABELS: Record<Domain, string> = {
  health: "Health & Care",
  education: "Childhood & Education",
  integration: "Inclusion & Participation",
  urban: "Urban Development",
  climate: "Climate & Sustainability",
  digital: "Digital Transformation",
  culture: "Culture",
  policy: "Policy",
};

const PROJECT_VISIBLE_DOMAINS: Domain[] = [
  "education",
  "culture",
  "health",
  "climate",
  "digital",
  "integration",
  "urban",
  "policy",
];

/* Mobile landing palette. Pulled from the brand palette in
 * src/lib/comte-colors.ts; independent of the desktop landing tokens
 * so the desktop home doesn't change. */
const MOBILE_LANDING_BG = LANDING_HOME_BG;
const MOBILE_LANDING_TEXT = LANDING_HERO_TEXT;
const MOBILE_LANDING_COMTE = LANDING_HERO_ACCENT;

function SectionHomeMobile() {
  return (
    <section
      id="home"
      className="relative w-full flex flex-col px-6 py-16 sm:px-8"
      style={{
        height: "80svh",
        minHeight: "80svh",
        background: MOBILE_LANDING_BG,
        color: MOBILE_LANDING_TEXT,
      }}
    >
      <div className="mt-auto">
        <h1
          className="font-[var(--font-abhaya-libre)] leading-[0.95] tracking-tight"
          style={{
            fontSize: "clamp(3.5rem, 18vw, 7rem)",
            color: MOBILE_LANDING_TEXT,
          }}
        >
          <span className="block" style={{ color: MOBILE_LANDING_COMTE }}>
            comte
          </span>
          <span className="block">creates</span>
          <span className="block">change</span>
          <span className="block">that</span>
          <span className="block">
            matters
            <span style={{ color: LANDING_HERO_ACCENT }}>.</span>
          </span>
        </h1>
      </div>
    </section>
  );
}

/**
 * Decorative square showing the drifting-lights landing animation
 * (the same /public/lights.html the desktop motto uses). Placed directly
 * after the hero so the motion reads as a continuation of the landing.
 */
function SectionFlowMobile() {
  return (
    <section
      aria-hidden="true"
      className="relative w-full"
      style={{ background: MOBILE_LANDING_BG }}
    >
      <div className="relative mx-auto aspect-square w-full overflow-hidden">
        <iframe
          src="/lights.html"
          title=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </section>
  );
}

function SectionMottoMobile() {
  return (
    <section
      id="motto"
      className="relative w-full flex flex-col justify-center py-16"
      // overflow visible so the heading can lift up out of the section and
      // sit on top of the lights iframe above. Sibling order in the DOM
      // (motto comes after lights) handles stacking — no z-index needed.
      style={{ background: MOTTO_DEFAULT_BG, color: "#F5F5E9", overflow: "visible" }}
    >
      {/* Heading + paragraphs run edge-to-edge — no horizontal padding here.
          The heading is pulled up by a negative margin so its top half
          overlaps the drifting-lights animation in the section above. */}
      <h2
        className="relative font-[var(--font-abhaya-libre)] leading-[0.9] tracking-tight"
        style={{
          fontSize: "clamp(4.5rem, 22vw, 10rem)",
          marginTop: "clamp(-9rem, -22vw, -5rem)",
          paddingLeft: 0,
          paddingRight: 0,
          color: comteColors.lightBase,
        }}
      >
        Design to evolve
        <span style={{ color: LANDING_HERO_ACCENT }}>.</span>
      </h2>
      <p className="mt-10 text-[clamp(1rem,4.2vw,1.25rem)] leading-relaxed">
        We help organizations adapt early, sharpen ideas, and turn them into action that creates
        value for people, organizations, and society.
      </p>
    </section>
  );
}

function SectionAboutIntroMobile({
  imageUrl,
  imageAlt,
  whoIsComteTitle,
  whoIsComte,
  whoAreWeTitle,
  whoAreWe,
}: HomeData["aboutIntro"]) {
  return (
    <section id="about-intro" className="relative flex w-full flex-col px-6 pb-16 sm:px-8" style={{ background: "#FFD2D2", color: "#1F3A32" }}>
      {imageUrl ? (
        // Negative horizontal margins cancel out SECTION_BASE's px-6 / sm:px-8
        // so the image bleeds to both screen edges while the text below
        // keeps its normal inset.
        <div className="relative mb-8 -mx-6 aspect-[4/5] w-screen max-w-none overflow-hidden sm:-mx-8">
          <Image
            src={imageUrl}
            alt={imageAlt ?? ""}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="space-y-8">
        {whoAreWeTitle || whoAreWe ? (
          <div>
            <h2 className="mb-3 font-[var(--font-abhaya-libre)] leading-[0.95] tracking-tight text-[#FF5252]"
                style={{ fontSize: "clamp(2.5rem, 10vw, 4rem)" }}>
              {whoAreWeTitle}
            </h2>
            <p className="text-[clamp(1rem,4vw,1.125rem)] leading-relaxed">
              {whoAreWe}
            </p>
          </div>
        ) : null}
        {whoIsComteTitle || whoIsComte ? (
          <div>
            <h2 className="mb-3 font-[var(--font-abhaya-libre)] leading-[0.95] tracking-tight text-[#FF5252]"
                style={{ fontSize: "clamp(2.5rem, 10vw, 4rem)" }}>
              {whoIsComteTitle}
            </h2>
            <p className="text-[clamp(1rem,4vw,1.125rem)] leading-relaxed">
              {whoIsComte}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Full-bleed placeholder image slot between the about-intro and
 * what-we-do sections. Will be swapped for a real CMS image later.
 *
 * Adds a light scroll-parallax: the inner stripe layer is taller than
 * the visible frame and translates Y at a fraction of the page scroll,
 * so the pattern drifts as the section passes through the viewport.
 * Respects prefers-reduced-motion.
 */
function SectionImagePlaceholderMobile({
  imageUrl,
  imageAlt,
}: {
  imageUrl?: string;
  imageAlt?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  // Total vertical travel of the inner layer relative to the frame.
  // The layer is overscanned by this amount on top and bottom so it
  // always fully covers the frame regardless of scroll position.
  const PARALLAX_PX = 80;

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const section = sectionRef.current;
      const inner = innerRef.current;
      if (!section || !inner) return;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // -1 when section is fully above the viewport, 0 when its centre
      // sits at the viewport centre, +1 when fully below.
      const denom = (vh + rect.height) / 2;
      const progress = (rect.top + rect.height / 2 - vh / 2) / denom;
      const clamped = Math.max(-1, Math.min(1, progress));
      const offset = -clamped * PARALLAX_PX;
      inner.style.transform = `translate3d(0, ${offset}px, 0)`;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ background: "#E8E8DC" }}
    >
      <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
        <div
          ref={innerRef}
          className="absolute left-0 right-0"
          style={{
            top: -PARALLAX_PX,
            bottom: -PARALLAX_PX,
            willChange: "transform",
          }}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt ?? ""}
              fill
              sizes="100vw"
              className="object-cover"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

function SectionWhatWeDoMobile({ textbox, datapoint1, datapoint2 }: HomeData["whatWeDo"]) {
  const datapoints = [datapoint1, datapoint2].filter(
    (d): d is NonNullable<typeof d> => !!d && !!(d.value || d.label),
  );
  // Deterministic but scattered placement for the stat circles. Each entry
  // gives a circle a unique size and position within the field.
  const circlePlacements: Array<{
    size: string;
    top: string;
    left?: string;
    right?: string;
  }> = [
    { size: "clamp(9rem, 36vw, 14rem)", top: "0%", left: "0%" },
    { size: "clamp(10rem, 40vw, 15rem)", top: "32%", right: "0%" },
  ];
  return (
    <section
      id="what-we-do"
      className={SECTION_BASE}
      style={{ background: "#F5F5E9", color: "#1F3A32" }}
    >
      <h2
        className="mb-6 font-[var(--font-abhaya-libre)] leading-[0.95] tracking-tight"
        style={{ fontSize: "clamp(3rem, 12vw, 5rem)" }}
      >
        What we do
        <span style={{ color: LANDING_HERO_ACCENT }}>.</span>
      </h2>
      {textbox ? (
        <p className="mb-12 max-w-prose text-[clamp(1rem,4vw,1.125rem)] leading-relaxed">
          {textbox}
        </p>
      ) : null}
      {datapoints.length ? (
        <div
          className="relative w-full"
          // Container height holds two overlapping circles; sized so the
          // second one (positioned at top: 32%) sits just inside the
          // bottom edge without leaving a tall empty band below.
          style={{ height: "clamp(16rem, 65vw, 24rem)" }}
        >
          {datapoints.map((d, i) => {
            const p = circlePlacements[i] ?? circlePlacements[0];
            const isProjects = i === 1;
            const background = isProjects ? comteColors.yellow : LANDING_HERO_ACCENT;
            const fg = isProjects ? comteColors.darkGreen : "#F4F4E8";
            return (
              <div
                key={i}
                className="absolute flex aspect-square flex-col items-center justify-center rounded-full text-center"
                style={{
                  width: p.size,
                  top: p.top,
                  left: p.left,
                  right: p.right,
                  background,
                  color: fg,
                }}
              >
                <div
                  className="font-[var(--font-abhaya-libre)] font-semibold leading-none"
                  style={{ fontSize: "clamp(3rem, 13vw, 5rem)" }}
                >
                  {d.value}
                </div>
                {d.label ? (
                  <div
                    className="mt-3 px-3 uppercase tracking-wider"
                    style={{ fontSize: "clamp(0.875rem, 3.2vw, 1.125rem)" }}
                  >
                    {d.label}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function SectionProjectsMobile({
  heading,
  bg,
  projects,
}: {
  heading?: string;
  bg?: string;
  projects: Project[];
}) {
  const [activeFilter, setActiveFilter] = useState<Domain | null>(null);
  // Filter chips are hidden behind a "filter" toggle by default — keeps
  // the sticky header compact and matches the mobile-nav hamburger.
  const [filterOpen, setFilterOpen] = useState(false);
  // Page size for the "show more" pagination — six tiles (three rows of
  // two) fits comfortably in the viewport before the user needs to ask
  // for the next page.
  const PAGE_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleProjects = projects.filter((p) =>
    PROJECT_VISIBLE_DOMAINS.includes(p.domain),
  );
  const filtered = activeFilter
    ? visibleProjects.filter((p) => p.domain === activeFilter)
    : visibleProjects;
  const shown = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > shown.length;

  const setFilter = (next: Domain | null) => {
    setActiveFilter(next);
    setVisibleCount(PAGE_SIZE);
    // Close the chip menu after a pick so the tile grid takes back
    // the screen — same UX as the mobile nav hamburger collapsing
    // after a section jump.
    setFilterOpen(false);
  };

  const activeLabel = activeFilter
    ? PROJECT_DOMAIN_LABELS[activeFilter]
    : null;
  const activeColor = activeFilter
    ? PROJECT_DOMAIN_COLORS[activeFilter]
    : PROJECT_FG;

  return (
    <section
      id="projects"
      className={SECTION_BASE}
      style={{ background: bg ?? PROJECT_BG, color: PROJECT_FG }}
    >
      <h2
        className="mb-8 font-[var(--font-abhaya-libre)] leading-[0.95] tracking-tight"
        style={{ fontSize: "clamp(3rem, 12vw, 5rem)" }}
      >
        {heading ?? "Projects"}
        <span style={{ color: LANDING_HERO_ACCENT }}>.</span>
      </h2>

      {/* Filter bar — single "filter" toggle pinned below the top nav
          while the projects section is in view. Tapping reveals the
          category chips with a staggered slide-in (mirrors the mobile
          hamburger nav). Negative horizontal margins extend the section
          background to both screen edges so tiles underneath stay
          covered while the bar is sticky. */}
      <div
        className="sticky -mx-6 mb-6 sm:-mx-8"
        style={{
          top: MOBILE_NAV_BOX_HEIGHT + 12,
          zIndex: 10,
          background: bg ?? PROJECT_BG,
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
        }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            aria-expanded={filterOpen}
            aria-controls="mobile-projects-filter-list"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "8px 14px",
              border: `1px solid ${activeColor}`,
              background: filterOpen ? activeColor : "transparent",
              color: filterOpen ? PROJECT_BG : activeColor,
              fontFamily: "var(--font-work-sans), system-ui, sans-serif",
              fontSize: "0.8125rem",
              letterSpacing: "0.04em",
              textTransform: "lowercase",
              cursor: "pointer",
              minHeight: 36,
              lineHeight: 1.1,
              transition:
                "background 0.2s ease, color 0.2s ease, border-color 0.2s ease",
            }}
          >
            <span>filter{activeLabel ? `: ${activeLabel.toLowerCase()}` : ""}</span>
            {/* Chevron flips when the menu is open. */}
            <span
              aria-hidden
              style={{
                display: "inline-block",
                transform: filterOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                fontSize: "0.625rem",
                lineHeight: 1,
              }}
            >
              ▾
            </span>
          </button>
          {activeFilter ? (
            <button
              type="button"
              onClick={() => setFilter(null)}
              aria-label="Clear filter"
              style={{
                padding: "4px 8px",
                border: "none",
                background: "transparent",
                color: PROJECT_FG,
                fontFamily: "var(--font-work-sans), system-ui, sans-serif",
                fontSize: "0.6875rem",
                letterSpacing: "0.04em",
                textTransform: "lowercase",
                cursor: "pointer",
                opacity: 0.7,
              }}
            >
              clear
            </button>
          ) : null}
        </div>
      </div>

      {/* Chip list — collapses to zero height when closed, then expands
          with a staggered slide-in per chip (matches the mobile nav
          hamburger reveal). Not sticky; scrolls with the section. */}
      <div
        id="mobile-projects-filter-list"
        aria-hidden={!filterOpen}
        style={{
          overflow: "hidden",
          // 3 rows of ~52px chips + gaps + breathing room.
          maxHeight: filterOpen ? 320 : 0,
          marginBottom: filterOpen ? 24 : 0,
          transition:
            "max-height 380ms cubic-bezier(0.25, 1, 0.5, 1), margin-bottom 380ms cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      >
        {/* 3 × 3 grid — eight categories fill the first eight cells, the
            last cell stays empty. Wider chips mean labels wrap on word
            boundaries instead of mid-glyph, so no hyphenation needed. */}
        <div className="grid grid-cols-3 gap-1">
          {PROJECT_VISIBLE_DOMAINS.map((domain, i) => {
            const color = PROJECT_DOMAIN_COLORS[domain];
            const isActive = activeFilter === domain;
            // Staggered slide-in mirroring MobileNav: items reveal left
            // → right when opening, reverse when closing.
            const STEP_MS = 35;
            const BASE_MS = 380;
            const reverseI = PROJECT_VISIBLE_DOMAINS.length - 1 - i;
            const delay = filterOpen ? i * STEP_MS : reverseI * STEP_MS;
            return (
              <button
                key={domain}
                type="button"
                onClick={() => setFilter(isActive ? null : domain)}
                aria-pressed={isActive}
                aria-label={`Filter by ${PROJECT_DOMAIN_LABELS[domain]}`}
                tabIndex={filterOpen ? 0 : -1}
                style={{
                  // Flex with both-axis centering so the wrapped lines of
                  // long labels (e.g. "Inclusion & Participation") sit
                  // visually centered inside the chip.
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 10px",
                  border: `1px solid ${color}`,
                  background: isActive ? color : "transparent",
                  color: isActive ? PROJECT_BG : color,
                  fontFamily: "var(--font-work-sans), system-ui, sans-serif",
                  fontSize: "0.8125rem",
                  letterSpacing: "0.01em",
                  textTransform: "lowercase",
                  cursor: "pointer",
                  minHeight: 52,
                  lineHeight: 1.15,
                  textAlign: "center",
                  // Wrap on word boundaries only — no mid-word breaks.
                  overflowWrap: "normal",
                  wordBreak: "normal",
                  hyphens: "none",
                  opacity: filterOpen ? 1 : 0,
                  transform: filterOpen
                    ? "translateY(0)"
                    : "translateY(-8px)",
                  pointerEvents: filterOpen ? "auto" : "none",
                  transition: `background 0.2s ease, color 0.2s ease, opacity ${BASE_MS}ms cubic-bezier(0.25, 1, 0.5, 1) ${delay}ms, transform ${BASE_MS}ms cubic-bezier(0.25, 1, 0.5, 1) ${delay}ms`,
                }}
              >
                {PROJECT_DOMAIN_LABELS[domain]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tile grid — domain-bordered cards matching the desktop tile view,
          stacked 2 columns wide on mobile. Title block holds up to 5
          lines like the desktop tile. Renders the first `visibleCount`
          tiles; the rest sit behind the "Show more" button below. */}
      <div className="grid grid-cols-2 gap-1">
        {shown.map((p) => {
          const color = PROJECT_DOMAIN_COLORS[p.domain];
          // PROJECTS_QUERY maps gallery[0].asset->url to heroImageUrl;
          // fall back to the explicit gallery list if the projection
          // ever changes shape.
          const thumb = p.heroImageUrl ?? p.galleryUrls?.[0];
          const inner = (
            <>
              {thumb ? (
                <div
                  className="relative mb-3 aspect-[4/3] w-full overflow-hidden"
                  style={{ background: `${color}1A` }}
                >
                  <Image
                    src={thumb}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="mb-3 aspect-[4/3] w-full"
                  style={{ background: `${color}1A` }}
                  aria-hidden
                />
              )}
              <div
                className="line-clamp-3"
                style={{
                  fontFamily: "var(--font-work-sans), system-ui, sans-serif",
                  fontSize: "0.875rem",
                  lineHeight: 1.25,
                  color,
                }}
              >
                {p.name}
              </div>
              <div className="mt-auto pt-3 text-xs" style={{ color, opacity: 0.7 }}>
                {p.year}
                {p.customers?.[0] ? ` · ${p.customers[0]}` : ""}
              </div>
            </>
          );
          const tileStyle: React.CSSProperties = {
            padding: 12,
            border: `1px solid ${color}`,
            background: "transparent",
            display: "flex",
            flexDirection: "column",
            transition: "background 0.2s ease",
          };
          return p.slug ? (
            <Link
              key={p.id}
              href={`/projects/${p.slug}`}
              style={tileStyle}
              className="active:bg-black/5 no-underline"
            >
              {inner}
            </Link>
          ) : (
            <div key={p.id} style={tileStyle}>
              {inner}
            </div>
          );
        })}
      </div>

      {hasMore ? (
        <button
          type="button"
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          className="mt-6 inline-flex items-center justify-center self-center"
          style={{
            minHeight: 44,
            padding: "10px 20px",
            border: `1px solid ${PROJECT_FG}`,
            background: "transparent",
            color: PROJECT_FG,
            fontFamily: "var(--font-work-sans), system-ui, sans-serif",
            fontSize: "0.8125rem",
            letterSpacing: "0.04em",
            textTransform: "lowercase",
            cursor: "pointer",
            transition: "background 0.2s ease, color 0.2s ease",
          }}
        >
          Show more ({filtered.length - shown.length} left)
        </button>
      ) : null}

      {filtered.length === 0 ? (
        <p
          className="mt-8 text-sm"
          style={{ color: PROJECT_FG, opacity: 0.65 }}
        >
          No projects in this category yet.
        </p>
      ) : null}
    </section>
  );
}

function SectionTeamMobile({
  heading,
  members,
}: {
  heading?: string;
  members: TeamMember[];
}) {
  return (
    <section
      id="team"
      className="relative flex w-full flex-col px-6 pb-16 sm:px-8"
      style={{
        background: "#5F7C8B",
        color: "#F5F5E9",
        // visible so the heading can lift up out of the section onto
        // whatever sits above it.
        overflow: "visible",
      }}
    >
      <h2
        className="relative mb-8 font-[var(--font-abhaya-libre)] leading-[0.9] tracking-tight"
        style={{
          fontSize: "clamp(4.5rem, 22vw, 10rem)",
          marginTop: "clamp(-3rem, -6vw, -1.25rem)",
          color: comteColors.darkGreen,
        }}
      >
        {heading ?? "Team"}
        <span style={{ color: LANDING_HERO_ACCENT }}>.</span>
      </h2>
      {/*
        Horizontal scroller: 2 rows × N auto-columns. grid-auto-flow:column
        fills the top row first then the bottom, so a list of 8 members
        becomes 4 columns of 2 stacked cards. Negative horizontal margins
        let the strip bleed to both screen edges; matching padding on the
        inner grid keeps the first card aligned with the heading.
      */}
      <div
        className="-mx-6 overflow-x-auto sm:-mx-8"
        style={{
          scrollSnapType: "x mandatory",
          scrollPaddingLeft: 40,
          WebkitOverflowScrolling: "touch",
        }}
      >
        <ul
          className="grid gap-4 pl-10 pr-6 sm:pl-12 sm:pr-8"
          style={{
            gridTemplateRows: "1fr 1fr",
            gridAutoFlow: "column",
            gridAutoColumns: "minmax(60vw, 18rem)",
          }}
        >
          {members.map((m, i) => (
          <li key={m?._id ?? i} style={{ scrollSnapAlign: "start" }}>
            {m?.photoUrl ? (
              <div className="relative mb-3 aspect-[3/4] w-full overflow-hidden bg-black/5">
                <Image src={m.photoUrl} alt={m?.name ?? ""} fill sizes="60vw" className="object-cover" />
              </div>
            ) : (
              <div className="mb-3 aspect-[3/4] w-full bg-black/5" />
            )}
            <div className="text-[clamp(1rem,4vw,1.125rem)] font-medium">{m?.name}</div>
            {m?.role ? <div className="text-sm opacity-70">{m.role}</div> : null}
          </li>
        ))}
        </ul>
      </div>
    </section>
  );
}

function SectionPublicationsMobile({
  heading,
  body,
  items,
}: {
  heading?: string;
  body?: string;
  items: CardItem[];
}) {
  return (
    <section
      id="publications"
      className="relative flex w-full flex-col px-6 pb-16 sm:px-8"
      style={{ background: "#F5F5E9", color: "#5A7482", overflow: "visible" }}
    >
      <h2
        className="relative mb-4 -mx-6 font-[var(--font-abhaya-libre)] leading-[0.9] tracking-tight sm:-mx-8"
        style={{
          fontSize: "clamp(5rem, 26vw, 12rem)",
          marginTop: "clamp(-3rem, -6vw, -1.25rem)",
          color: "#FFD2D2",
          // Allow this single long word to break mid-glyph when it
          // exceeds the viewport width.
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}
      >
        {heading ?? "Publications"}
        <span style={{ color: LANDING_HERO_ACCENT }}>.</span>
      </h2>
      {body ? (
        <p className="mb-8 max-w-prose text-[clamp(1rem,4vw,1.125rem)] leading-relaxed">
          {body}
        </p>
      ) : null}
      {/*
        Horizontal scroller — one card per snap target, ~85vw wide. Strip
        bleeds to both screen edges; inner padding keeps the first card
        aligned with the heading and lets the last one rest visible at
        the right edge after snap. scroll-snap-stop: always means the
        snap engages even on quick flicks.
      */}
      <div
        className="-mx-6 overflow-x-auto sm:-mx-8"
        style={{
          scrollSnapType: "x mandatory",
          scrollPaddingLeft: 40,
          WebkitOverflowScrolling: "touch",
        }}
      >
        <ul className="flex gap-4 pl-10 pr-6 sm:pl-12 sm:pr-8">
          {items.map((it, i) => {
            const href = it?.slug ? `/publications/${it.slug}` : null;
            const cardClass = "flex h-full flex-col no-underline";
            const cardStyle = {
              color: "inherit",
            } as const;
            const inner = (
              <>
                {it?.imageUrl ? (
                  <div className="relative mb-5 aspect-square w-full overflow-hidden">
                    <Image
                      src={it.imageUrl}
                      alt={it.title ?? ""}
                      fill
                      sizes="85vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div
                  className="font-[var(--font-abhaya-libre)] leading-tight"
                  style={{ fontSize: "clamp(1.5rem, 6vw, 2.25rem)" }}
                >
                  {it?.title}
                </div>
                {it?.description ? (
                  <p
                    className="mt-4 text-[clamp(0.95rem,4vw,1.0625rem)] leading-relaxed"
                    style={{ opacity: 0.85 }}
                  >
                    {it.description}
                  </p>
                ) : null}
                <span
                  className="mt-3 inline-flex h-[42px] w-full items-center justify-center px-5 text-[0.75rem] font-semibold uppercase tracking-[0.15em]"
                  style={{ background: "#FF5252", color: "#F5F5E9" }}
                >
                  Read more and order →
                </span>
              </>
            );
            return (
              <li
                key={it?._id ?? i}
                style={{
                  flex: "0 0 85vw",
                  maxWidth: "32rem",
                  minHeight: "60svh",
                  scrollSnapAlign: "start",
                  scrollSnapStop: "always",
                }}
              >
                {href ? (
                  <Link href={href} className={cardClass} style={cardStyle}>
                    {inner}
                  </Link>
                ) : (
                  <div className={cardClass} style={cardStyle}>
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

// Two studios → two location blocks. Coordinates are placeholders aimed
// at the city centres; the address strings below them are placeholders
// too and should be wired through Sanity later.
/**
 * Default contact blocks — used if the aboutOffice CMS singleton hasn't
 * been wired up yet, or as the coordinate source (CMS doesn't ship
 * lat/lng for each office).
 */
const CONTACT_LOCATION_DEFAULTS: Array<{
  title: string;
  address: string;
  center: [number, number];
  zoom: number;
}> = [
  {
    title: "Norway",
    address: "Pilestredet Park 31\n0169 Oslo",
    center: [10.7522, 59.9139],
    zoom: 13,
  },
  {
    title: "Portugal",
    address: "Rua Sr da Fortuna 83\n4990-163 Ponte de Lima",
    center: [-8.582, 41.768],
    zoom: 13,
  },
];

/**
 * Merge CMS locations (from aboutOffice) with the defaults: the CMS
 * supplies title + address (free text), the defaults supply the
 * lat/lng coordinates the embedded MapLibre map needs. Coordinates are
 * matched on title; an unknown title falls back to the first default.
 */
function resolveContactLocations(cms: ContactLocation[] | undefined) {
  if (!cms || cms.length === 0) return CONTACT_LOCATION_DEFAULTS;
  return cms.map((entry) => {
    const fallback =
      CONTACT_LOCATION_DEFAULTS.find(
        (d) => d.title.toLowerCase() === entry.title.toLowerCase(),
      ) ?? CONTACT_LOCATION_DEFAULTS[0];
    return {
      title: entry.title || fallback.title,
      // Prefer the multi-line `description` (matches how the field is
      // authored in Studio); fall back to `address`.
      address: entry.description || entry.address || fallback.address,
      center: fallback.center,
      zoom: entry.zoom ?? fallback.zoom,
    };
  });
}

function ContactLocationBlock({
  title,
  address,
  center,
  zoom,
}: {
  title: string;
  address: string;
  center: [number, number];
  zoom: number;
}) {
  return (
    <div className="mb-14">
      <h3
        className="mb-3 font-[var(--font-abhaya-libre)] leading-[0.95] tracking-tight"
        style={{ fontSize: "clamp(2.5rem, 10vw, 4rem)", color: "#FF5252" }}
      >
        {title}
      </h3>
      <p className="mb-6 whitespace-pre-line text-[clamp(1rem,4vw,1.125rem)] leading-relaxed">
        {address}
      </p>
      {/* Map bleeds to both screen edges to match the rest of the mobile
          layout's full-bleed treatments. aspect-square gives the WebGL
          container an explicit height to mount into. */}
      <div className="relative -mx-6 aspect-square sm:-mx-8">
        <Map
          theme="light"
          viewport={{ center, zoom }}
          interactive={false}
          attributionControl={false}
        >
          <MapMarker longitude={center[0]} latitude={center[1]}>
            <MarkerContent>
              <div
                className="rounded-full"
                style={{
                  width: 14,
                  height: 14,
                  background: "#FF5252",
                  border: "2px solid #F4F4E8",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                }}
              />
            </MarkerContent>
          </MapMarker>
        </Map>
      </div>
    </div>
  );
}

function SectionContactMobile({
  locations,
}: {
  locations?: ContactLocation[];
}) {
  const resolved = resolveContactLocations(locations);
  return (
    <section
      id="contact"
      className="relative flex w-full flex-col px-6 sm:px-8"
      style={{
        background: comteColors.mutedGreen,
        color: "#F5F5E9",
        overflow: "visible",
      }}
    >
      <h2
        className="relative mb-10 -mx-6 font-[var(--font-abhaya-libre)] leading-[0.9] tracking-tight sm:-mx-8"
        style={{
          fontSize: "clamp(4.5rem, 22vw, 10rem)",
          marginTop: "clamp(-3rem, -6vw, -1.25rem)",
          color: comteColors.red,
        }}
      >
        Contact
        <span style={{ color: LANDING_HERO_ACCENT }}>.</span>
      </h2>
      <div className="mb-14">
        <h3
          className="mb-3 font-[var(--font-abhaya-libre)] leading-[0.95] tracking-tight"
          style={{ fontSize: "clamp(2.5rem, 10vw, 4rem)", color: "#FF5252" }}
        >
          Get in touch
        </h3>
        <div className="flex flex-col gap-6 text-[clamp(1rem,4vw,1.125rem)] leading-relaxed">
          <div className="flex flex-col gap-1">
            <span className="text-sm uppercase tracking-[0.15em] opacity-70">
              General
            </span>
            <a
              href="mailto:kontakt@comte.no"
              className="underline-offset-4 hover:underline"
              style={{ color: "inherit" }}
            >
              kontakt@comte.no
            </a>
            <a
              href="tel:+4795463335"
              className="underline-offset-4 hover:underline"
              style={{ color: "inherit" }}
            >
              +47 954 63 335
            </a>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm uppercase tracking-[0.15em] opacity-70">
              Projects
            </span>
            <a
              href="mailto:adrian@comte.no"
              className="underline-offset-4 hover:underline"
              style={{ color: "inherit" }}
            >
              adrian@comte.no
            </a>
            <a
              href="tel:+4795463335"
              className="underline-offset-4 hover:underline"
              style={{ color: "inherit" }}
            >
              +47 954 63 335
            </a>
          </div>
        </div>
      </div>
      {resolved.map((loc) => (
        <ContactLocationBlock key={loc.title} {...loc} />
      ))}
    </section>
  );
}
