"use client";

import Link from "next/link";
import { useRef, useState } from "react";

export type ProjectCardProps = {
    title: string;
    description?: string;
    clients?: string;
    imageUrl?: string;
    href?: string;
    ctaLabel?: string;
    className?: string;
};

export default function ProjectCard({
    title,
    description,
    clients,
    imageUrl,
    href,
    ctaLabel = "Les mer",
    className = "",
}: ProjectCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
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

    const CardInner = (
        <div
            ref={cardRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMove}
            className={`group relative h-[60vh] min-h-[50vh] overflow-hidden rounded-lg p-6 flex flex-col justify-between bg-cover bg-center cursor-pointer ${className}`}
            style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
        >
            {/* gradients for text legibility */}
            {imageUrl && (
                <>
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-foreground/60 to-transparent transition-opacity duration-500 ease-out group-hover:opacity-0" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-foreground/70 to-transparent transition-opacity duration-500 ease-out group-hover:opacity-0" />
                </>
            )}

            <div className="relative z-10 flex flex-col gap-2 transition-opacity duration-500 ease-out group-hover:opacity-50">
                <span
                    className={`text-6xl font-light ${imageUrl ? "text-background/90" : "text-foreground/70"
                        }`}
                >
                    {title}
                </span>
                {description && (
                    <p
                        className={`text-lg font-light tracking-tight ${imageUrl ? "text-background/80" : "text-foreground/60"
                            }`}
                    >
                        {description}
                    </p>
                )}
            </div>

            {clients && (
                <p
                    className={`relative z-10 text-lg font-light transition-opacity duration-500 ease-out group-hover:opacity-50 ${imageUrl ? "text-background/80" : "text-foreground/60"
                        }`}
                >
                    {clients}
                </p>
            )}

            {/* follower circle (doesn't replace cursor) */}
            <div
                className={`pointer-events-none absolute left-0 top-0 z-20 transition-opacity duration-200 ${isHovering ? "opacity-100" : "opacity-0"
                    }`}
                style={{
                    transform: `translate(${cursorPos.x}px, ${cursorPos.y}px) translate(-50%, -50%)`,
                }}
            >
                <div className="h-20 w-20 rounded-full bg-background/90 text-foreground flex items-center justify-center text-sm font-medium tracking-wide shadow-lg">
                    {ctaLabel}
                </div>
            </div>
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full w-full">
                {CardInner}
            </Link>
        );
    }

    return CardInner;
}