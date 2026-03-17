"use client";

import Link from "next/link";
import BlobNav from "../components/BlobNav";

const PLACEHOLDER_INSIGHTS = [
    { year: "2024", title: "Design as a strategic tool", forum: "Design Week Norway", link: "/article/design-strategic-tool" },
    { year: "2024", title: "Brand building in the Nordics", forum: "Nordic Business Review", link: "/article/brand-building-nordics" },
    { year: "2023", title: "Why editorial design still matters", forum: "Grafill Magazine", link: "/article/editorial-design-matters" },
    { year: "2023", title: "From launch to legacy", forum: "TechCrunch", link: "/article/launch-to-legacy" },
    { year: "2023", title: "Exhibition identity in public space", forum: "Museums Bulletin", link: "/article/exhibition-identity" },
    { year: "2022", title: "Reporting on sustainability", forum: "Annual Report Quarterly", link: "/article/sustainability-reporting" },
    { year: "2022", title: "Fashion and visual narrative", forum: "Vogue Scandinavia", link: "/article/fashion-visual-narrative" },
    { year: "2022", title: "The future of print", forum: "Food & Wine", link: "/article/future-of-print" },
    { year: "2021", title: "Portfolio as process", forum: "Architectural Digest", link: "/article/portfolio-as-process" },
    { year: "2021", title: "Public campaigns that work", forum: "Local Government Today", link: "/article/public-campaigns" },
    { year: "2021", title: "Pitch decks that get funded", forum: "Startup Magazine", link: "/article/pitch-decks-funded" },
    { year: "2020", title: "Catalogue design in the digital age", forum: "Gallery One", link: "/article/catalogue-design" },
    { year: "2020", title: "UI and trust in health apps", forum: "Health Tech Review", link: "/article/ui-trust-health" },
    { year: "2020", title: "Craft and identity in packaging", forum: "Craft Beer & Brewing", link: "/article/craft-identity-packaging" },
];

export default function InsightsPage() {
    return (
        <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
            <BlobNav />
            <div className="w-full h-[50vh] flex flex-col items-start justify-end pt-12 bg-white">
                <h1 className="text-5xl font-light text-black">Insights</h1>
            </div>
            <div
                className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 bg-white pt-2 pb-2"
                style={{ height: "calc(100vh - 5rem)" }}
            >
                <div className="relative overflow-hidden min-h-0 rounded-lg bg-gray-100">
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-light text-black/50">
                        1
                    </span>
                </div>
                <div className="relative overflow-hidden min-h-0 rounded-lg bg-gray-100">
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-light text-black/50">
                        2
                    </span>
                </div>
                <div className="relative overflow-hidden min-h-0 rounded-lg bg-gray-100">
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-light text-black/50">
                        3
                    </span>
                </div>
                <div className="relative overflow-hidden min-h-0 rounded-lg bg-gray-100">
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-light text-black/50">
                        4
                    </span>
                </div>
            </div>



            <section className="flex flex-col h-fit w-screen flex-shrink-0 items-center justify-center bg-[#fafafa] p-24">
                <p className="text-2xl font-light text-black/50 pb-24">Vi både skriver ting og blir noen ganger skrevet om. Vi prøver å samle det meste her.</p>
                <div className="rounded-xl border border-black/30 bg-[#EEEEEE] w-full h-full">
                    <div className="grid grid-cols-3 gap-x-4 border-b border-black/30 px-4 py-3 text-left text-sm font-medium text-black/70 bg-[#EEEEEE] sticky top-0 z-10">
                        <span>Year</span>
                        <span>Title</span>
                        <span>Forum</span>
                    </div>
                    {PLACEHOLDER_INSIGHTS.map((p, i) => (
                        <Link
                            key={i}
                            href={p.link}
                            className="grid grid-cols-3 gap-x-4 border-b border-black/20 px-4 py-4 text-left hover:bg-black/5 transition-colors"
                        >
                            <p className="text-lg font-light">{p.year}</p>
                            <p className="text-lg font-light">{p.title}</p>
                            <p className="text-lg font-light">{p.forum}</p>
                        </Link>
                    ))}
                </div>

            </section >


        </div >
    );
}