"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BlobNav from "../components/BlobNav";
import Footer from "../components/Footer";

const PLACEHOLDER_IMAGE =
    "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const GRID_ITEMS = [
    { title: "Item one" },
    { title: "Item two" },
    { title: "Item three" },
    { title: "Item four" },
    { title: "Item five" },
    { title: "Item six" },
    { title: "Item seven" },
    { title: "Item eight" },
];

export default function ProjectPage() {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHoveringCard, setIsHoveringCard] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

    const handleMove = (e: React.MouseEvent) => {
        const el = cardRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setCursorPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
            <BlobNav />
            <div className="w-full h-[50vh] flex flex-col items-start justify-end py-12">
                <h1 className="text-5xl font-light text-black">Projects</h1>
            </div>
            <div
                className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pt-2 pb-2"
                style={{ height: "calc(100vh - 5rem)" }}
            >
                <div className="relative p-6 overflow-hidden min-h-0 rounded-lg bg-gray-100 flex flex-col justify-between">
                    <div className="flex flex-col gap-2"><span className="text-6xl font-light text-black/50">Mann om bord</span><p className="text-lg font-light text-black/50 tracking-tight">Hvordan få unge, arbeidsuføre menn tilbake i jobb?</p></div><p className="text-lg font-light text-black/50">NAV, Trondheim Kommune, Kirkens bymisjon</p>
                </div>
                <div
                    ref={cardRef}
                    onMouseEnter={() => setIsHoveringCard(true)}
                    onMouseLeave={() => setIsHoveringCard(false)}
                    onMouseMove={handleMove}
                    className="group relative cursor-pointer p-6 overflow-hidden min-h-0 rounded-lg flex flex-col justify-between bg-cover bg-center"
                    style={{ backgroundImage: `url(${PLACEHOLDER_IMAGE})` }}
                >
                    {/* gradients for text legibility */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-500 ease-out group-hover:opacity-0" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-500 ease-out group-hover:opacity-0" />

                    <div className="relative z-10 flex flex-col gap-2 transition-opacity duration-500 ease-out group-hover:opacity-50">
                        <span className="text-6xl font-light text-white/90">Mann om bord</span>
                        <p className="text-lg font-light text-white/80 tracking-tight">
                            Hvordan få unge, arbeidsuføre menn tilbake i jobb?
                        </p>
                    </div>
                    <p className="relative z-10 text-lg font-light text-white/80 transition-opacity duration-500 ease-out group-hover:opacity-50">
                        NAV, Trondheim Kommune, Kirkens bymisjon
                    </p>

                    {/* custom cursor */}
                    <div
                        className={`pointer-events-none absolute left-0 top-0 z-20 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${isHoveringCard ? "opacity-100" : "opacity-0"}`}
                        style={{ transform: `translate(${cursorPos.x}px, ${cursorPos.y}px) translate(-50%, -50%)` }}
                    >
                        <div className="h-20 w-20 rounded-full bg-white/90 text-[#1a1a1a] flex items-center justify-center text-sm font-medium tracking-wide shadow-lg">
                            Les mer
                        </div>
                    </div>
                </div>

                <div className="relative p-6 overflow-hidden min-h-0 rounded-lg bg-gray-100 flex flex-col justify-between">
                    <div className="flex flex-col gap-2"><span className="text-6xl font-light text-black/50">Mann om bord</span><p className="text-lg font-light text-black/50 tracking-tight">Hvordan få unge, arbeidsuføre menn tilbake i jobb?</p></div><p className="text-lg font-light text-black/50">NAV, Trondheim Kommune, Kirkens bymisjon</p>
                </div>


            </div>
            <section className="w-full flex flex-col gap-6 justify-center items-center px-6 py-12 md:px-12 lg:px-24 max-w-3xl mx-auto">
                <h2 className="text-6xl font-light text-black">Hva har prosjektene våre til felles?</h2>
                <p className="text-lg font-light text-black/50">Vi har arbeidet med mange prosjekter, og vi er stolte av å ha arbeidet med mange prosjekter.</p>

            </section>

            <section className="w-full flex flex-col gap-6 justify-center items-center px-6 py-12 md:px-12 lg:px-24 max-w-3xl mx-auto">
                <h2 className="text-6xl font-light text-black">Flere prosjekter</h2>
                <p className="text-lg font-light text-black/50">Vi har arbeidet med mange prosjekter, og vi er stolte av å ha arbeidet med mange prosjekter.</p>
                <Link
                    href="/contact"
                    className="w-screen h-[50vh] rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-4xl md:text-6xl font-light tracking-wide hover:bg-[#1a1a1a]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:ring-offset-4"
                    aria-label="Contact us"
                >
                    Contact us
                </Link>
            </section>
            <Footer />
        </div>
    );
}
