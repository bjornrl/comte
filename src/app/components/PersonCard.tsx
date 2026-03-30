"use client";

import { useRef, useState } from "react";

export type PersonCardProps = {
  /** Person name (always visible) */
  name: string;
  /** Title/role (always visible) */
  title: string;
  /** Revealed on hover */
  description: string;
  /** Background image */
  imageUrl: string;
  /** Click opens email */
  email?: string;
  /** Optional link target (used for project cards). Falls back to mailto when omitted. */
  href?: string;
  /** Custom cursor shape/content (per card) */
  cursor?: React.ReactNode;
  /** Text color on hover (CSS color), e.g. var(--comte-near-black) */
  hoverTextColor?: string;
  /** Meta text color on hover (CSS color), e.g. "rgba(26,26,26,0.6)" */
  hoverMetaTextColor?: string;
  /**
   * Hover overlay color (CSS color). This layer fades in on hover and sits above the image.
   * Example: "rgba(255,255,255,0.75)" or "rgba(250,250,250,0.9)" or "rgba(0,0,0,0.2)"
   */
  hoverOverlayColor?: string;
  /** Extra className for sizing/layout (e.g. h-full) */
  className?: string;
};

export default function PersonCard({
  name,
  title,
  description,
  imageUrl,
  email,
  href,
  cursor,
  hoverTextColor = "var(--comte-near-black)",
  hoverMetaTextColor = "color-mix(in srgb, var(--comte-near-black) 60%, transparent)",
  hoverOverlayColor = "color-mix(in srgb, var(--comte-light-base) 75%, transparent)",
  className = "",
}: PersonCardProps) {
  const cardRef = useRef<HTMLAnchorElement | null>(null);
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

  const defaultCursor = (
    <div className="h-20 w-20 rounded-full bg-background/90 text-foreground flex items-center justify-center text-sm font-medium tracking-wide shadow-lg">
      Les mer
    </div>
  );

  const resolvedHref = href ?? (email ? `mailto:${email}` : "#");
  const ariaLabel = href ? `Open ${name}` : email ? `Email ${name}` : name;
  const isExternal = !!href && !href.startsWith("/") && !href.startsWith("mailto:");
  const isMailto = resolvedHref.startsWith("mailto:");

  const Inner = (
    <a
      href={resolvedHref}
      aria-label={ariaLabel}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...(isMailto ? { target: "_blank" } : {})}
      ref={cardRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMove}
      className={`group relative h-[60vh] min-h-[45vh] overflow-hidden rounded-lg bg-gray-100 cursor-pointer ${className}`}
    >
      {/* image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 ease-out group-hover:opacity-30"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* hover overlay (customizable) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
        style={{ backgroundColor: hoverOverlayColor }}
      />

      {/* subtle scrim to keep title readable before hover */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 transition-opacity duration-500 ease-out group-hover:opacity-0"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0))",
        }}
      />

      {/* title is always visible */}
      <div className="relative z-10 p-6">
        <p
          className="text-xs font-medium uppercase tracking-wider transition-colors duration-500 ease-out"
          style={{ color: isHovering ? hoverMetaTextColor : "rgba(255,255,255,0.7)" }}
        >
          {title}
        </p>
        <h3
          className="mt-2 text-3xl md:text-4xl font-light leading-tight transition-colors duration-500 ease-out"
          style={{ color: isHovering ? hoverTextColor : "rgba(255,255,255,0.95)" }}
        >
          {name}
        </h3>
      </div>

      {/* hover description */}
      <div className="relative z-10 px-6 pb-6">
        <p
          className="text-lg font-light leading-relaxed opacity-0 translate-y-2 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-y-0"
          style={{ color: isHovering ? hoverTextColor : "rgba(255,255,255,0.9)" }}
        >
          {description}
        </p>
      </div>

      {/* custom cursor (follows pointer; cursor stays pointer) */}
      <div
        className={`pointer-events-none absolute left-0 top-0 z-20 transition-opacity duration-200 ${isHovering ? "opacity-100" : "opacity-0"
          }`}
        style={{
          transform: `translate(${cursorPos.x}px, ${cursorPos.y}px) translate(-50%, calc(-100% - 12px))`,
        }}
      >
        {cursor ?? defaultCursor}
      </div>
    </a>
  );

  return Inner;
}

