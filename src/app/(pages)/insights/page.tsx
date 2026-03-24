"use client";

import { useState } from "react";
import Link from "next/link";
import BlobNav from "../../components/BlobNav";
import Footer from "../../components/Footer";
import ProjectCard from "@/app/components/projectcard";
import { comteColors } from "@/lib/comte-colors";

const PLACEHOLDER_IMAGE =
    "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const PLACEHOLDER_INSIGHTS = [
    { year: "2024", title: "Design as a strategic tool", forum: "Design Week Norway", link: "/article/design-strategic-tool", imageUrl: PLACEHOLDER_IMAGE },
    { year: "2024", title: "Brand building in the Nordics", forum: "Nordic Business Review", link: "/article/brand-building-nordics", imageUrl: PLACEHOLDER_IMAGE },
    { year: "2023", title: "Why editorial design still matters", forum: "Grafill Magazine", link: "/article/editorial-design-matters", imageUrl: PLACEHOLDER_IMAGE },
    { year: "2023", title: "From launch to legacy", forum: "TechCrunch", link: "/article/launch-to-legacy", imageUrl: PLACEHOLDER_IMAGE },
    { year: "2023", title: "Exhibition identity in public space", forum: "Museums Bulletin", link: "/article/exhibition-identity", imageUrl: PLACEHOLDER_IMAGE },
    { year: "2022", title: "Reporting on sustainability", forum: "Annual Report Quarterly", link: "/article/sustainability-reporting", imageUrl: PLACEHOLDER_IMAGE },
    { year: "2022", title: "Fashion and visual narrative", forum: "Vogue Scandinavia", link: "/article/fashion-visual-narrative", imageUrl: PLACEHOLDER_IMAGE },
    { year: "2022", title: "The future of print", forum: "Food & Wine", link: "/article/future-of-print", imageUrl: PLACEHOLDER_IMAGE },
    { year: "2021", title: "Portfolio as process", forum: "Architectural Digest", link: "/article/portfolio-as-process", imageUrl: PLACEHOLDER_IMAGE },
    { year: "2021", title: "Public campaigns that work", forum: "Local Government Today", link: "/article/public-campaigns", imageUrl: PLACEHOLDER_IMAGE },
    { year: "2021", title: "Pitch decks that get funded", forum: "Startup Magazine", link: "/article/pitch-decks-funded", imageUrl: PLACEHOLDER_IMAGE },
    { year: "2020", title: "Catalogue design in the digital age", forum: "Gallery One", link: "/article/catalogue-design", imageUrl: PLACEHOLDER_IMAGE },
    { year: "2020", title: "UI and trust in health apps", forum: "Health Tech Review", link: "/article/ui-trust-health", imageUrl: PLACEHOLDER_IMAGE },
    { year: "2020", title: "Craft and identity in packaging", forum: "Craft Beer & Brewing", link: "/article/craft-identity-packaging", imageUrl: PLACEHOLDER_IMAGE },
];

const INSIGHT_HOVER_COLORS = [
    { bg: comteColors.darkGreen, text: comteColors.cream },
    { bg: comteColors.deepRed, text: comteColors.cream },
    { bg: comteColors.coolBlue, text: comteColors.lightBase },
    { bg: comteColors.mutedGreen, text: comteColors.cream },
    { bg: comteColors.gold, text: comteColors.nearBlack },
    { bg: comteColors.coral, text: comteColors.nearBlack },
] as const;

export default function InsightsPage() {
    const [heroCtaHover, setHeroCtaHover] = useState(false);
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
        <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
            <BlobNav />
            <div className="w-full h-[50vh] flex flex-col md:flex-row items-end justify-end gap-4 pt-12 px-6 md:px-12 lg:px-0">
                <h1 className="text-5xl font-light text-foreground w-full">Insights</h1>
                <p className="text-lg font-light text-foreground/50 w-full">Denne siden oppdateres jevnlig med innsikt vi kommer over i prosjekter, artikler vi skriver og andre ting vi synes er interessante.</p>
            </div>
            <div
                className="w-full h-fit grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 bg-background pt-2 pb-2"

            >
                <ProjectCard
                    title="3 av 10 studenter starter i relevant jobb"
                    description=""
                    clients="Kun tre av ti studenter som fullfører barnehageutdenningen, starter i en relevant jobb etter studiene."
                    imageUrl={PLACEHOLDER_IMAGE}
                    href="/projects/mann-om-bord"
                    ctaLabel="Les mer"
                />
                <ProjectCard
                    title="3 av 10 studenter starter i relevant jobb"
                    description=""
                    clients="Kun tre av ti studenter som fullfører barnehageutdenningen, starter i en relevant jobb etter studiene."
                    imageUrl={PLACEHOLDER_IMAGE}
                    href="/projects/mann-om-bord"
                    ctaLabel="Les mer"
                />
                <ProjectCard
                    title="3 av 10 studenter starter i relevant jobb"
                    description=""
                    clients="Kun tre av ti studenter som fullfører barnehageutdenningen, starter i en relevant jobb etter studiene."
                    imageUrl={PLACEHOLDER_IMAGE}
                    href="/projects/mann-om-bord"
                    ctaLabel="Les mer"
                />
                <ProjectCard
                    title="3 av 10 studenter starter i relevant jobb"
                    description=""
                    clients="Kun tre av ti studenter som fullfører barnehageutdenningen, starter i en relevant jobb etter studiene."
                    imageUrl={PLACEHOLDER_IMAGE}
                    href="/projects/mann-om-bord"
                    ctaLabel="Les mer"
                />
            </div>



            <section className="flex flex-col h-fit w-screen flex-shrink-0 items-center justify-center bg-background p-2 md:p-12 lg:p-24">
                <p className="text-2xl font-light text-foreground/50 pb-24">Vi både skriver ting og blir noen ganger skrevet om. Vi prøver å samle det meste her.</p>
                <div className="rounded-xl overflow-hidden border border-foreground/30 bg-[#EEEEEE] w-full h-full">
                    <div className="grid grid-cols-3 gap-x-4 border-b border-foreground/30 px-4 py-3 text-left text-sm font-medium text-foreground/70 bg-[#EEEEEE] sticky top-0 z-10">
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
                                    prev && prev.index === i
                                        ? { ...prev, x: e.clientX, y: e.clientY }
                                        : prev,
                                );
                            }}
                            onMouseLeave={() => {
                                setHoveredInsight((prev) => (prev && prev.index === i ? null : prev));
                            }}
                        >
                            <p className="text-lg font-light transition-colors duration-200">{p.year}</p>
                            <p className="text-lg font-light transition-colors duration-200">{p.title}</p>
                            <p className="text-lg font-light transition-colors duration-200">{p.forum}</p>
                        </Link>
                    ))}
                </div>

            </section >
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
                    <img
                        src={hoveredInsight.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                </div>
            ) : null}
            <Footer />

        </div >
    );
}