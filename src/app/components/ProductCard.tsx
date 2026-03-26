"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

export type ProductCardProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  imageUrl?: string;
  href: string;
  ctaLabel?: string;
  className?: string;
};

export default function ProductCard({
  title,
  subtitle,
  meta,
  imageUrl,
  href,
  ctaLabel = "Download",
  className = "",
}: ProductCardProps) {
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

  return (
    <Link href={href} className="block h-full w-full">
      <div
        ref={cardRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMove}
        className={[
          "group relative min-h-[44vh] overflow-hidden rounded-lg p-1",
          "flex flex-col justify-start items-start",
          "transition-colors duration-300",
        
          className,
        ].join(" ")}
      >
        {/* Image */}
        <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-md bg-foreground/5">
          <Image
            src={imageUrl ?? "/globe.svg"}
            alt=""
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>

        <div className="relative z-10">
          {meta ? (
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-foreground/50">
              {meta}
            </div>
          ) : null}
          <h3 className="text-2xl font-light tracking-tight text-foreground">{title}</h3>
          {subtitle ? (
            <p className="mt-3 text-base font-light leading-relaxed text-foreground/60">
              {subtitle}
            </p>
          ) : null}
        </div>

        {/* Follower circle */}
        <div
          className={[
            "pointer-events-none absolute left-0 top-0 z-20",
            "transition-opacity duration-200",
            isHovering ? "opacity-100" : "opacity-0",
          ].join(" ")}
          style={{
            transform: `translate(${cursorPos.x}px, ${cursorPos.y}px) translate(-50%, -50%)`,
          }}
        >
          <div className="h-20 w-20 rounded-full border border-background/40 bg-background/90 text-foreground flex items-center justify-center text-sm font-medium tracking-wide shadow-lg">
            {ctaLabel}
          </div>
        </div>
      </div>
    </Link>
  );
}
