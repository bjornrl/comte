"use client";

import { useState } from "react";
import Link from "next/link";
import BlobNav from "../../components/BlobNav";
import Footer from "../../components/Footer";
import ProductCard from "@/app/components/ProductCard";
import UnitVisualization from "@/app/components/UnitVisualization";
import { comteColors } from "@/lib/comte-colors";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const PLACEHOLDER_INSIGHTS = [
  {
    year: "2024",
    title: "Design as a strategic tool",
    forum: "Design Week Norway",
    link: "/article/design-strategic-tool",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    year: "2024",
    title: "Brand building in the Nordics",
    forum: "Nordic Business Review",
    link: "/article/brand-building-nordics",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    year: "2023",
    title: "Why editorial design still matters",
    forum: "Grafill Magazine",
    link: "/article/editorial-design-matters",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    year: "2023",
    title: "From launch to legacy",
    forum: "TechCrunch",
    link: "/article/launch-to-legacy",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    year: "2023",
    title: "Exhibition identity in public space",
    forum: "Museums Bulletin",
    link: "/article/exhibition-identity",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    year: "2022",
    title: "Reporting on sustainability",
    forum: "Annual Report Quarterly",
    link: "/article/sustainability-reporting",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    year: "2022",
    title: "Fashion and visual narrative",
    forum: "Vogue Scandinavia",
    link: "/article/fashion-visual-narrative",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    year: "2022",
    title: "The future of print",
    forum: "Food & Wine",
    link: "/article/future-of-print",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    year: "2021",
    title: "Portfolio as process",
    forum: "Architectural Digest",
    link: "/article/portfolio-as-process",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    year: "2021",
    title: "Public campaigns that work",
    forum: "Local Government Today",
    link: "/article/public-campaigns",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    year: "2021",
    title: "Pitch decks that get funded",
    forum: "Startup Magazine",
    link: "/article/pitch-decks-funded",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    year: "2020",
    title: "Catalogue design in the digital age",
    forum: "Gallery One",
    link: "/article/catalogue-design",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    year: "2020",
    title: "UI and trust in health apps",
    forum: "Health Tech Review",
    link: "/article/ui-trust-health",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    year: "2020",
    title: "Craft and identity in packaging",
    forum: "Craft Beer & Brewing",
    link: "/article/craft-identity-packaging",
    imageUrl: PLACEHOLDER_IMAGE,
  },
];

const INSIGHT_HOVER_COLORS = [
  { bg: comteColors.darkGreen, text: comteColors.cream },
  { bg: comteColors.deepRed, text: comteColors.cream },
  { bg: comteColors.coolBlue, text: comteColors.lightBase },
  { bg: comteColors.mutedGreen, text: comteColors.cream },
  { bg: comteColors.gold, text: comteColors.nearBlack },
  { bg: comteColors.coral, text: comteColors.nearBlack },
] as const;

const RESOURCES = [
  {
    slug: "service-blueprint-template",
    title: "Service blueprint template",
    subtitle: "A lightweight template for mapping touchpoints, backstage work, and dependencies.",
    meta: "Template",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    slug: "research-consent-pack",
    title: "Research consent pack",
    subtitle: "Consent form + participant info sheet you can reuse in discovery work.",
    meta: "Doc pack",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    slug: "workshop-agenda-kit",
    title: "Workshop agenda kit",
    subtitle: "A modular set of agendas for 60\u2013180 minute sessions, ready to adapt.",
    meta: "Toolkit",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    slug: "stakeholder-map-canvas",
    title: "Stakeholder map canvas",
    subtitle: "A simple canvas for aligning on stakeholders, roles, and influence.",
    meta: "Canvas",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    slug: "accessibility-checklist",
    title: "Accessibility checklist",
    subtitle: "A pragmatic checklist aligned with WCAG essentials and product delivery.",
    meta: "Checklist",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    slug: "design-crit-prompts",
    title: "Design crit prompts",
    subtitle: "Prompts that make critique more specific, actionable, and kind.",
    meta: "Prompts",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    slug: "copy-tone-guide",
    title: "Copy & tone guide",
    subtitle: "Guidance for writing UI copy with clarity, rhythm, and consistency.",
    meta: "Guide",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    slug: "pilot-metrics-sheet",
    title: "Pilot metrics sheet",
    subtitle: "A starter sheet for defining outcomes, signals, and measurement cadence.",
    meta: "Spreadsheet",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    slug: "roadmap-now-next-later",
    title: "Now / Next / Later roadmap",
    subtitle: "A clean roadmap format for communicating priorities without false precision.",
    meta: "Roadmap",
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    slug: "handoff-spec-template",
    title: "Handoff spec template",
    subtitle: "A minimal spec format for faster handoff without losing intent.",
    meta: "Template",
    imageUrl: PLACEHOLDER_IMAGE,
  },
] as const;

export default function InsightsPage() {
  const [hoveredInsight, setHoveredInsight] = useState<{
    index: number;
    x: number;
    y: number;
    imageUrl: string;
    bg: string;
    text: string;
  } | null>(null);

  const pickRandomHoverColor = () =>
    INSIGHT_HOVER_COLORS[Math.floor(Math.random() * INSIGHT_HOVER_COLORS.length)];

  return (
    <div style={{ background: "#F9F9ED", minHeight: "100vh" }}>
      <BlobNav />

      {/* Hero visualization section — mirrors project page's full-height map */}
      <div className="relative px-2 pt-24 pb-8">
        <div className="mx-auto max-w-[1800px] min-h-[50vh] flex flex-col items-start justify-end pb-8">
          <h1 className="text-5xl font-light text-foreground">
            Insights, statistics and resources
          </h1>
          <p className="mt-3 max-w-[600px] text-lg font-light text-foreground/50">
            The societal challenges we work within. Same people, different lenses.
          </p>
        </div>
        <div className="flex gap-2 w-full justify-center mb-4">
          <a
            href="#unitVisualization"
            className="flex h-8 w-30 items-center justify-center rounded-full border border-foreground bg-background text-xl font-light tracking-wide text-foreground transition-colors hover:cursor-pointer hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-background/30"
            aria-label="Go to insights section"
          >
            Stats
          </a>
          <a
            href="#resources"
            className="flex h-8 w-30 items-center justify-center rounded-full border border-foreground bg-foreground text-xl font-light tracking-wide text-background transition-colors hover:cursor-pointer hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-background/30"
            aria-label="Go to resources section"
          >
            Resources
          </a>
          <a
            href="#insights-table"
            className="flex h-8 w-30 items-center justify-center rounded-full border border-foreground bg-background text-xl font-light tracking-wide text-foreground transition-colors hover:cursor-pointer hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-background/30"
            aria-label="Go to insights section"
          >
            Insights
          </a>
        </div>
        <div id="unitVisualization">
          <UnitVisualization />
        </div>
      </div>

      {/* Resources grid — mirrors project page's grid section */}
      <section className="w-full bg-[var(--comte-light-base)] px-2 pb-2">
        <div className="mx-auto max-w-[1800px]">
          <div className="flex w-full flex-col items-start justify-between gap-4 pb-8 md:flex-row md:items-end">
            <h2 className="text-5xl font-light text-foreground">Resources</h2>
          </div>
          <div
            id="resources"
            className="grid w-full grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4"
          >
            {RESOURCES.map((r) => (
              <ProductCard
                key={r.slug}
                title={r.title}
                subtitle={r.subtitle}
                meta={r.meta}
                imageUrl={r.imageUrl}
                href={`/insights/${r.slug}`}
                ctaLabel="Download"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Insights table */}
      <section
        id="insights-table"
        className="flex h-fit w-full flex-shrink-0 flex-col items-center justify-center bg-[var(--comte-light-base)] p-2 md:p-12 lg:p-24"
      >
        <div className="mx-auto w-full max-w-[1800px]">
          <h2 className="pb-8 text-5xl font-light text-foreground">
            Vi både skriver ting og blir noen ganger skrevet om. Vi prøer å samle det meste her.
          </h2>
          <div className="w-full overflow-hidden rounded-xl border border-foreground/30">
            <div className="sticky top-0 z-10 grid grid-cols-3 gap-x-4 border-b border-foreground/30 px-4 py-3 text-left text-sm font-medium text-foreground/70">
              <span>Year</span>
              <span>Title</span>
              <span>Forum</span>
            </div>
            {PLACEHOLDER_INSIGHTS.map((p, i) => (
              <Link
                key={i}
                href={p.link}
                className="grid grid-cols-3 gap-x-4 border-b border-foreground/20 px-4 py-4 text-left transition-colors duration-200"
                style={{
                  backgroundColor: hoveredInsight?.index === i ? hoveredInsight.bg : undefined,
                  color: hoveredInsight?.index === i ? hoveredInsight.text : undefined,
                }}
                onMouseEnter={(e) => {
                  const hoverColor = pickRandomHoverColor();
                  setHoveredInsight({
                    index: i,
                    x: e.clientX,
                    y: e.clientY,
                    imageUrl: p.imageUrl,
                    bg: hoverColor.bg,
                    text: hoverColor.text,
                  });
                }}
                onMouseMove={(e) => {
                  setHoveredInsight((prev) =>
                    prev && prev.index === i ? { ...prev, x: e.clientX, y: e.clientY } : prev,
                  );
                }}
                onMouseLeave={() => {
                  setHoveredInsight((prev) => (prev && prev.index === i ? null : prev));
                }}
              >
                <p
                  className={`text-lg transition-colors duration-200 ${
                    hoveredInsight?.index === i ? "font-bold" : "font-light"
                  }`}
                >
                  {p.year}
                </p>
                <p
                  className={`text-lg transition-colors duration-200 ${
                    hoveredInsight?.index === i ? "font-bold" : "font-light"
                  }`}
                >
                  {p.title}
                </p>
                <p
                  className={`text-lg transition-colors duration-200 ${
                    hoveredInsight?.index === i ? "font-bold" : "font-light"
                  }`}
                >
                  {p.forum}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Floating hover image */}
      {hoveredInsight ? (
        <div
          className="pointer-events-none fixed z-50 overflow-hidden rounded-md border border-foreground/20 bg-background shadow-lg"
          style={{
            left: hoveredInsight.x,
            top: hoveredInsight.y,
            width: 160,
            height: 104,
            transform: "translate(-50%, calc(-100% - 16px))",
          }}
        >
          <img src={hoveredInsight.imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}

      <Footer />
    </div>
  );
}
