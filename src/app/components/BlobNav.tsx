"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "How we work", href: "/how-we-work" },
  { label: "Contact", href: "/contact" },
];

function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  const lineStyle: React.CSSProperties = {
    display: "block",
    width: "20px",
    height: "2px",
    background: "#141414",
    borderRadius: "1px",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    transformOrigin: "center",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: isOpen ? "0px" : "5px",
        width: "20px",
        height: "20px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <span
        style={{
          ...lineStyle,
          transform: isOpen ? "translateY(1px) rotate(45deg)" : "none",
        }}
      />
      <span
        style={{
          ...lineStyle,
          opacity: isOpen ? 0 : 1,
        }}
      />
      <span
        style={{
          ...lineStyle,
          transform: isOpen ? "translateY(-1px) rotate(-45deg)" : "none",
        }}
      />
    </div>
  );
}

export default function BlobNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [burgerHovered, setBurgerHovered] = useState(false);

  const blobStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 100,
    background: "#ffffff",
    pointerEvents: "all",
    transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
    overflow: "hidden",
    left: "50%",
    transform: "translateX(-50%)",
    top: "1.5rem",
    ...(isOpen
      ? {
        width: "min(90vw, 500px)",
        height: "440px",
        borderRadius: "1.5rem",
      }
      : {
        width: "min(90vw, 500px)",
        height: "52px",
        borderRadius: "26px",
      }),
  };

  const barStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: "0 1.25rem",
    height: "52px",
    flexShrink: 0,
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "6px",
    flex: 1,
    padding: "0 1rem 1rem 1rem",
    opacity: isOpen ? 1 : 0,
    transition: "opacity 0.3s ease 0.2s",
    pointerEvents: isOpen ? "all" : "none",
  };

  const backdropStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 99,
    background: "rgba(0,0,0,0.4)",
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? "all" : "none",
    transition: "opacity 0.4s ease",
  };

  return (
    <nav style={{ pointerEvents: "none", position: "fixed", inset: 0, zIndex: 100 }}>
      {/* Backdrop */}
      <div style={backdropStyle} onClick={() => setIsOpen(false)} />

      {/* Blob */}
      <div
        style={blobStyle}
      >
        {/* Top bar: hamburger + "comte" */}
        <div style={barStyle}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            onMouseEnter={() => setBurgerHovered(true)}
            onMouseLeave={() => setBurgerHovered(false)}
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s ease",
              position: "absolute" as const,
              left: "1.25rem",
              ...(burgerHovered ? { background: "rgba(0,0,0,0.06)" } : {}),
            }}
          >
            <HamburgerIcon isOpen={isOpen} />
          </button>

          <Link
            href="/"
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: "1rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "#141414",
              textDecoration: "none",
              textTransform: "uppercase",
              pointerEvents: "all",
            }}
          >
            Comte
          </Link>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100% - 52px)",
          }}
        >
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
                  padding: "2rem",
                  borderRadius: "0.75rem",
                  background:
                    hoveredIndex === i
                      ? "rgba(0,0,0,0.08)"
                      : "rgba(0,0,0,0.04)",
                  transition: "background 0.2s ease",
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  color: "#141414",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
