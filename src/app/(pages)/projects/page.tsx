"use client";

import Link from "next/link";
import BlobNav from "../../components/BlobNav";
import Footer from "../../components/Footer";
import ProjectCard from "../../components/projectcard";

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
    return (
        <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
            <BlobNav />
            <div className="w-full h-[50vh] flex flex-col items-start justify-end py-12">
                <h1 className="text-5xl font-light text-foreground">Projects</h1>
            </div>
            <div
                className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pt-2 pb-2"
                style={{ height: "calc(100vh - 5rem)" }}
            >

                <ProjectCard
                    title="Mann om bord"
                    description="Hvordan få unge, arbeidsuføre menn tilbake i jobb?"
                    clients="NAV, Trondheim Kommune, Kirkens bymisjon"
                    imageUrl={PLACEHOLDER_IMAGE}
                    href="/projects/mann-om-bord"
                    ctaLabel="Les mer"
                />
                <ProjectCard
                    title="Mann om bord"
                    description="Hvordan få unge, arbeidsuføre menn tilbake i jobb?"
                    clients="NAV, Trondheim Kommune, Kirkens bymisjon"
                    imageUrl={PLACEHOLDER_IMAGE}
                    href="/projects/mann-om-bord"
                    ctaLabel="Les mer"
                />
                <ProjectCard
                    title="Mann om bord"
                    description="Hvordan få unge, arbeidsuføre menn tilbake i jobb?"
                    clients="NAV, Trondheim Kommune, Kirkens bymisjon"
                    imageUrl={PLACEHOLDER_IMAGE}
                    href="/projects/mann-om-bord"
                    ctaLabel="Les mer"
                />
                <ProjectCard
                    title="Mann om bord"
                    description="Hvordan få unge, arbeidsuføre menn tilbake i jobb?"
                    clients="NAV, Trondheim Kommune, Kirkens bymisjon"
                    imageUrl={PLACEHOLDER_IMAGE}
                    href="/projects/mann-om-bord"
                    ctaLabel="Les mer"
                />




            </div>
            <section className="w-full flex flex-col gap-6 justify-center items-center px-6 py-12 md:px-12 lg:px-24 max-w-3xl mx-auto">
                <h2 className="text-6xl font-light text-foreground">Hva har prosjektene våre til felles?</h2>
                <p className="text-lg font-light text-foreground/50">Vi har arbeidet med mange prosjekter, og vi er stolte av å ha arbeidet med mange prosjekter.</p>

            </section>

            <section className="w-full flex flex-col gap-6 justify-center items-center px-6 py-12 md:px-12 lg:px-24 max-w-3xl mx-auto">
                <h2 className="text-6xl font-light text-foreground">Flere prosjekter</h2>
                <p className="text-lg font-light text-foreground/50">Vi har arbeidet med mange prosjekter, og vi er stolte av å ha arbeidet med mange prosjekter.</p>
                <Link
                    href="/contact"
                    className="w-screen h-[50vh] rounded-full bg-foreground text-background flex items-center justify-center text-4xl md:text-6xl font-light tracking-wide hover:bg-foreground/90 transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-4 focus:ring-offset-background"
                    aria-label="Contact us"
                >
                    Contact us
                </Link>
            </section>
            <Footer />
        </div>
    );
}
