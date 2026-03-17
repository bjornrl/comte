"use client";

import BlobNav from "../components/BlobNav";

export default function ArticleListPage() {
    return (
        <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
            <BlobNav />
            <div className="w-full min-h-screen bg-white px-24 py-32">
                <h1 className="text-5xl font-light text-black">Articles</h1>
            </div>
            const PLACEHOLDER_PROJECTS = [
            {year: "2024", customer: "Acme Corp", achievement: "Brand identity & web" },
            {year: "2024", customer: "Nordic Design", achievement: "Campaign concept" },
            {year: "2023", customer: "Studio Oslo", achievement: "Editorial design" },
            {year: "2023", customer: "TechStart", achievement: "Product launch site" },
            {year: "2023", customer: "Museum Nord", achievement: "Exhibition identity" },
            {year: "2022", customer: "Green Energy Co", achievement: "Annual report" },
            {year: "2022", customer: "Fashion House", achievement: "Lookbook & campaign" },
            {year: "2022", customer: "Food & Wine", achievement: "Magazine redesign" },
            {year: "2021", customer: "Architects AS", achievement: "Portfolio site" },
            {year: "2021", customer: "City Council", achievement: "Public campaign" },
            {year: "2021", customer: "Startup Lab", achievement: "Pitch deck & brand" },
            {year: "2020", customer: "Gallery One", achievement: "Exhibition catalogue" },
            {year: "2020", customer: "Health First", achievement: "App UI & branding" },
            {year: "2020", customer: "Local Brewery", achievement: "Packaging & identity" },
            ];

            function PageFive() {
  return (
            <section className="flex h-screen w-screen flex-shrink-0 items-center justify-center bg-[#fafafa] p-24">
                <div className="rounded-xl border border-black/30 bg-[#EEEEEE] w-full h-full overflow-y-auto">
                    <div className="sticky top-0 z-10 grid grid-cols-3 gap-x-4 border-b border-black/30 bg-[#EEEEEE] px-4 py-3 text-left text-sm font-medium text-[#1a1a1a]/70">
                        <span>Year</span>
                        <span>Customer</span>
                        <span>Achievement</span>
                    </div>
                    {PLACEHOLDER_PROJECTS.map((p, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-3 gap-x-4 border-b border-black/20 px-4 py-4 text-left"
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
        </div>
    );
}
