"use client";

import { use, useRef, useEffect, useState } from "react";
import Image from "next/image";
import BlobNav from "@/app/components/BlobNav";
import Footer from "@/app/components/Footer";
import StatCard from "@/app/components/StatCard";
import { comteColors } from "@/lib/comte-colors";

const PLACEHOLDER_IMAGE =
    "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function FittingHeadline({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const [fontSize, setFontSize] = useState(120);

    useEffect(() => {
        const container = containerRef.current;
        const text = textRef.current;
        if (!container || !text) return;

        const fit = () => {
            let size = 200;
            text.style.fontSize = `${size}px`;
            while (
                size > 12 &&
                (text.scrollWidth > container.clientWidth ||
                    text.scrollHeight > container.clientHeight)
            ) {
                size -= 4;
                text.style.fontSize = `${size}px`;
            }
            setFontSize(size);
        };

        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(container);
        return () => ro.disconnect();
    }, [children]);

    return (
        <div
            ref={containerRef}
            className="flex-1 min-h-0 flex items-center justify-center overflow-hidden w-full px-4"
        >
            <h1
                ref={textRef}
                style={{ fontSize: `${fontSize}px` }}
                className="font-light text-foreground text-center leading-tight"
            >
                {children}
            </h1>
        </div>
    );
}

export default function ProjectPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = use(params);

    return (
        <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
            <BlobNav />
            <div className="w-full h-[80vh] flex flex-col items-center justify-start pt-12 bg-background">
                <FittingHeadline>{slug || "Project"}</FittingHeadline>
                <p className="italic text-xl text-gray-500">Prosjektbeskrivelse</p>
                <p className="text-xl text-gray-500">Client</p>
            </div>
            <div className="w-full bg-background px-6 md:px-12 lg:px-24 py-8">
                <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
                    <Image
                        src={PLACEHOLDER_IMAGE}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 70vw"
                        priority
                    />
                </div>
            </div>
            <div className="w-full bg-background px-6 py-12 md:px-12 lg:px-24 max-w-3xl mx-auto">
                <div className="text-foreground font-light space-y-6 text-lg leading-relaxed">
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <p>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                    <p>
                        Curabitur pretium tincidunt lacus. Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna luctus suscipit.
                    </p>
                    <p>
                        Sed lectus. Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget diam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Morbi lacinia molestie dui.
                    </p>
                </div>
            </div>
            <div
                className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-3xl mx-auto gap-2 bg-background pt-2 pb-2 h-[50vh]"

            >
                <StatCard value="30%" description="Redusert klimagassutslipp" backgroundColor={comteColors.coral}
                    textColor={comteColors.cream} />
                <StatCard value="47" description="Menn inkludert i prøveordning" backgroundColor={comteColors.yellow}
                    textColor={comteColors.darkGreen} />
                <StatCard value="25%" description="Voksenandel i styre" backgroundColor={comteColors.mutedGreen}
                    textColor={comteColors.lightBase} />


            </div>

            <div className="w-full bg-background px-6 py-12 md:px-12 lg:px-24 max-w-3xl mx-auto">
                <div className="text-foreground font-light space-y-6 text-lg leading-relaxed">
                    <p>
                        Mann om bord kan vi se tilbake på som både et vellykket prosjekt og som en viktig bidragsyter for selskapets del, til å kunne oppnå vårt mandat som samfunnsbyggende organisasjon. Les mer om vårt mandat her.                    </p>
                    <p>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                    <p>
                        Curabitur pretium tincidunt lacus. Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna luctus suscipit.
                    </p>
                    <p>
                        Sed lectus. Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget diam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Morbi lacinia molestie dui.
                    </p>
                </div>
            </div>


            <Footer />
        </div>
    );
}
