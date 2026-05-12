"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export type NavItem = { label: string; sectionId: string };

export const NAV_ITEMS: NavItem[] = [
  { label: "About", sectionId: "about-intro" },
  { label: "Projects", sectionId: "projects" },
  { label: "Team", sectionId: "team" },
  { label: "Publications and ventures", sectionId: "publications" },
];

const RED = "#FF5252";
const CREAM = "#F5F5E9"; // foreground on the red boxes
const BLACK = "#1F3A32"; // foreground on the white Contact button
const WHITE = "#FFFFFF";
const BOX_HEIGHT = 48; // every red box (logo, hamburger, nav items, contact) shares this height
const GAP = 4;
// Matches PANEL_PADDING in SectionShell so the logo/nav line up with the hero text.
const SIDE_MARGIN = "clamp(2rem, 5vw, 5rem)";
// Half of SIDE_MARGIN at every viewport width.
const TOP_MARGIN = "clamp(1rem, 2.5vw, 2.5rem)";

// Logo SVG viewBox is 247×71, so width follows height by this ratio.
const LOGO_ASPECT = 247 / 71;
const LOGO_WIDTH = Math.round(BOX_HEIGHT * LOGO_ASPECT);

type Props = {
  onNavigate?: (sectionId: string) => void;
  activeSection?: string;
  /** When true, the nav forces itself closed regardless of activeSection. */
  isScrolling?: boolean;
};

function HamburgerIcon({ open }: { open: boolean }) {
  // Open state → chevron pointing left (collapses the menu).
  // Closed state → two horizontal cream lines, close together, no rounded ends.
  if (open) {
    return <ChevronLeft size={22} strokeWidth={2.5} color={CREAM} />;
  }
  return (
    <span
      aria-hidden="true"
      style={{ position: "relative", display: "inline-block", width: 22, height: 10 }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 1,
          width: "100%",
          height: 2,
          background: CREAM,
          borderRadius: 0,
        }}
      />
      <span
        style={{
          position: "absolute",
          left: 0,
          bottom: 1,
          width: "100%",
          height: 2,
          background: CREAM,
          borderRadius: 0,
        }}
      />
    </span>
  );
}

const boxStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
  height: BOX_HEIGHT,
  background: RED,
  color: CREAM,
  borderRadius: 0,
  border: "none",
  padding: "0 14px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "var(--font-work-sans), system-ui, sans-serif",
  fontWeight: 400,
  fontSize: "0.95rem",
  letterSpacing: "0.01em",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "filter 0.2s ease",
  ...extra,
});

export default function BlobNav({ onNavigate, activeSection, isScrolling }: Props) {
  const [open, setOpen] = useState(true); // page starts with menu open (we land on Home)
  const pathname = usePathname();
  const router = useRouter();

  // The nav is only open when the page is stationary on the landing section.
  // Any active scroll, or any active section other than "home", collapses it.
  useEffect(() => {
    setOpen(activeSection === "home" && !isScrolling);
  }, [activeSection, isScrolling]);

  const navigate = useCallback(
    (sectionId: string) => {
      if (onNavigate) {
        onNavigate(sectionId);
        return;
      }
      if (pathname !== "/") {
        router.push(`/#${sectionId}`);
        return;
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("comte:navigate", { detail: { sectionId } }));
      }
    },
    [onNavigate, pathname, router],
  );

  return (
    <>
      {/* Left cluster: logo + hamburger + sliding nav items */}
      <div
        aria-label="Main navigation"
        role="navigation"
        style={{
          position: "fixed",
          top: TOP_MARGIN,
          left: SIDE_MARGIN,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: GAP,
          pointerEvents: "auto",
        }}
      >
        {/* Logo (red rectangle is baked into the SVG) */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            navigate("home");
          }}
          aria-label="Comte – home"
          style={{
            display: "inline-flex",
            height: BOX_HEIGHT,
            width: LOGO_WIDTH,
            background: RED,
            lineHeight: 0,
          }}
        >
          <Image
            src="/logo.svg"
            alt="Comte"
            width={LOGO_WIDTH}
            height={BOX_HEIGHT}
            priority
            style={{ display: "block", width: "100%", height: "100%" }}
          />
        </a>

        {/* Hamburger / chevron toggle (stays fixed in place) */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="comte-nav-items"
          style={{ ...boxStyle({ width: BOX_HEIGHT, padding: 0 }), zIndex: 2 }}
        >
          <HamburgerIcon open={open} />
        </button>

        {/* Nav items — slide out from behind the hamburger toward the right */}
        <div
          id="comte-nav-items"
          style={{
            overflow: "hidden",
            maxWidth: open ? 1400 : 0,
            transition: "max-width 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: GAP,
              transform: open ? "translateX(0)" : "translateX(-20px)",
              opacity: open ? 1 : 0,
              transition:
                "transform 0.45s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease",
            }}
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.sectionId;
              return (
                <button
                  key={item.sectionId}
                  type="button"
                  onClick={() => navigate(item.sectionId)}
                  tabIndex={open ? 0 : -1}
                  aria-current={isActive ? "page" : undefined}
                  style={boxStyle({ filter: isActive ? "brightness(0.92)" : undefined })}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.filter = "brightness(0.92)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.filter = isActive
                      ? "brightness(0.92)"
                      : "";
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right side: persistent Contact button (scrolls to Team section) */}
      <div
        style={{
          position: "fixed",
          top: TOP_MARGIN,
          right: SIDE_MARGIN,
          zIndex: 100,
          pointerEvents: "auto",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("team")}
          aria-label="Contact – go to Team section"
          style={boxStyle()}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.filter = "brightness(0.92)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.filter = "";
          }}
        >
          Contact
        </button>
      </div>
    </>
  );
}
