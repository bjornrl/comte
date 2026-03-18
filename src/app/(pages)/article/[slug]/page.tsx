"use client";

import { use, useRef, useEffect, useState } from "react";
import BlobNav from "@/app/components/BlobNav";
import Footer from "@/app/components/Footer";

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
                className="font-light text-black text-center leading-tight"
            >
                {children}
            </h1>
        </div>
    );
}

export default function ArticlePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = use(params);

    return (
        <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
            <BlobNav />
            <div className="w-full h-[80vh] flex flex-col items-center justify-start pt-12 bg-white">
                <FittingHeadline>{slug || "Article"}</FittingHeadline>
                <p className="text-xl text-gray-500">Author</p>
               
            </div>
            <div className="w-full bg-white px-6 py-12 md:px-12 lg:px-24 max-w-3xl mx-auto">
                <div className="text-[#1a1a1a] font-light space-y-6 text-lg leading-relaxed">
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
            <Footer />
        </div>
    );
}