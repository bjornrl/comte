"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Insights", href: "/insights" },
  { label: "About", href: "/about" },
];

function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  const baseLine: React.CSSProperties = {
    position: "absolute",
    left: 0,
    width: "22px",
    height: "2px",
    borderRadius: "999px",
    backgroundColor: "var(--comte-near-black)",
    transitionProperty: "margin, transform, background-color",
    transitionDuration: "0.2s",
    transitionTimingFunction: "ease",
  };

  const middleStyle: React.CSSProperties = {
    ...baseLine,
    top: "50%",
    marginTop: "-1px",
    backgroundColor: isOpen ? "transparent" : "var(--comte-near-black)",
    transitionDuration: "0s",
    transitionDelay: "0.2s",
  };

  const beforeStyle: React.CSSProperties = {
    ...baseLine,
    top: "50%",
    marginTop: isOpen ? "0px" : "-6px",
    transform: isOpen ? "rotate(45deg)" : "none",
    transitionDelay: isOpen ? "0s, 0.2s" : "0.2s, 0s",
  };

  const afterStyle: React.CSSProperties = {
    ...baseLine,
    top: "50%",
    marginTop: isOpen ? "0px" : "6px",
    transform: isOpen ? "rotate(-45deg)" : "none",
    transitionDelay: isOpen ? "0s, 0.2s" : "0.2s, 0s",
  };

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        width: "22px",
        height: "14px",
      }}
    >
      {/* <span style={middleStyle} /> */}
      <span style={beforeStyle} />
      <span style={afterStyle} />
    </span>
  );
}

export default function BlobNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    },
    [isOpen],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // The blob is always full-size in the DOM. We use clip-path to
  // reveal/hide content — the top bar (40px) is always visible,
  // and the rest clips in/out. No scaling = no blurry text.
  const blobStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 100,
    pointerEvents: "all",
    top: "16px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "min(400px, calc(100vw - 48px))",
    maxWidth: "100%",
    userSelect: "none",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.45)",
    backdropFilter: "blur(40px)",
    WebkitBackdropFilter: "blur(40px)",
    display: "flex",
    flexDirection: "column",
    // clip-path animates on GPU (composited), no layout reflow
    clipPath: isOpen
      ? "inset(0 0 0 0 round 8px)"
      : "inset(0 0 calc(100% - 40px) 0 round 8px)",
    transition: "clip-path 0.45s cubic-bezier(0.25, 1, 0.5, 1)",
  };

  const barStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: "0 16px",
    height: "40px",
    flexShrink: 0,
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    padding: "0 16px 16px 16px",
    opacity: isOpen ? 1 : 0,
    transition: "opacity 0.3s ease 0.15s",
    pointerEvents: isOpen ? "all" : "none",
  };

  const backdropStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 99,
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: isOpen ? "blur(48px)" : "none",
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? "all" : "none",
    transition: "opacity 0.4s ease",
  };

  return (
    <nav className="pointer-events-none fixed inset-0 z-100"
      // style={{ pointerEvents: "none", position: "fixed", inset: 0, zIndex: 100 }}
      aria-label="Main navigation"
    >
      {/* Backdrop */}
      <div style={backdropStyle} onClick={() => setIsOpen(false)} />

      {/* Blob */}
      <div style={blobStyle}>
        {/* Top bar: hamburger + "comte" — never transforms */}
        <div style={barStyle}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isOpen}
            className="pointer-events-auto absolute left-4 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-transparent p-3 transition-colors hover:cursor-pointer"
          >
            <HamburgerIcon isOpen={isOpen} />
          </button>

          <Link
            href="/"
            style={{
              fontFamily: "var(--font-neue-haas)",
              fontSize: "1rem",
              fontWeight: 300,
              letterSpacing: "0.08em",
              color: "var(--comte-near-black)",
              textDecoration: "none",
              pointerEvents: "all",
            }}
          >
            comte
          </Link>
        </div>

        {/* Intro text */}
        <div
          style={{
            flexShrink: 0,
            padding: "0 24px 4px 24px",
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "translateY(0)" : "translateY(-4px)",
            transition: "opacity 0.3s ease 0.18s, transform 0.3s ease 0.18s",
            pointerEvents: isOpen ? "all" : "none",
          }}
        >
          <p
            style={{
              margin: "48px auto",
              textAlign: "center",
              fontStyle: "italic",
              fontFamily: "var(--font-neue-haas)",
              fontSize: "clamp(1.25rem, 2vw, 1.5rem)",
              lineHeight: 1.4,
              color: "#4a4a4a",
            }}
          >
            We help teams design, build, and ship thoughtful digital products.
          </p>
        </div>

        {/* Grid */}
        <div style={gridStyle}>
          {NAV_ITEMS.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                aspectRatio: "1 / 1",
                borderRadius: "12px",
                background:
                  hoveredIndex === i
                    ? "rgba(0,0,0,0.08)"
                    : "rgba(0,0,0,0.04)",
                transition: "background 0.15s ease",
                fontFamily: "var(--font-neue-haas)",
                fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
                fontWeight: 500,
                color: "var(--comte-near-black)",
                textDecoration: "none",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
