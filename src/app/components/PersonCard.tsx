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
      className={`group relative h-[60vh] min-h-[45vh] overflow-hidden bg-gray-100 cursor-pointer ${className}`}
    >
      {/* Photo fills the entire card (edge-to-edge under overlays). */}
      <div className="absolute inset-0 overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt=""
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ease-out group-hover:opacity-30"
        />
      </div>

      {/* hover overlay (customizable) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
        style={{ backgroundColor: hoverOverlayColor }}
      />

      {/* subtle scrim at the bottom to keep role + name readable over images */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 transition-opacity duration-500 ease-out group-hover:opacity-0"
        style={{
          backgroundImage: "linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0))",
        }}
      />

      {/* Bottom-anchored info block: hover description appears above role +
          name, role + name are always visible. */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-6">
        <p
          className="mb-3 text-base font-light leading-normal opacity-0 translate-y-2 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-y-0 md:text-lg"
          style={{ color: isHovering ? hoverTextColor : "rgba(255,255,255,0.9)" }}
        >
          {description}
        </p>
        <p
          className="font-[family-name:var(--font-work-sans)] text-xs font-medium tracking-wider transition-colors duration-500 ease-out"
          style={{
            color: isHovering ? hoverMetaTextColor : "rgba(255,255,255,0.7)",
            // `text-transform: lowercase` strips any capital first letters so
            // every glyph renders at the same small-caps height (input like
            // "Project Manager" → "project manager" → "ᴘʀᴏᴊᴇᴄᴛ ᴍᴀɴᴀɢᴇʀ").
            textTransform: "lowercase",
            fontVariant: "small-caps",
          }}
        >
          {title}
        </p>
        <h3
          className="font-[family-name:var(--font-manrope)] text-lg font-medium leading-tight transition-colors duration-500 ease-out md:text-xl"
          style={{ color: isHovering ? hoverTextColor : "rgba(255,255,255,0.95)" }}
        >
          {name}
        </h3>
      </div>

      {/* custom cursor (follows pointer; cursor stays pointer) */}
      <div
        className={`pointer-events-none absolute left-0 top-0 z-20 transition-opacity duration-200 ${
          isHovering ? "opacity-100" : "opacity-0"
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

