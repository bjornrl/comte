"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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

// No gap between nav items — adjacent items touch, and a 1px right border on
// each item provides the visible divider that doubles as the "stroke" the
// collapse animation shows when items overlap.
const GAP = 0;
const ITEM_BORDER = `1px solid rgba(245, 245, 233, 0.35)`;

// Matches PANEL_PADDING in SectionShell so the logo/nav line up with the hero text.
const SIDE_MARGIN = "clamp(2rem, 5vw, 5rem)";
// Half of SIDE_MARGIN at every viewport width.
const TOP_MARGIN = "clamp(1rem, 2.5vw, 2.5rem)";

// Logo SVG viewBox is 247×71, so width follows height by this ratio.
const LOGO_ASPECT = 247 / 71;
const LOGO_WIDTH = Math.round(BOX_HEIGHT * LOGO_ASPECT);

// Card-deck collapse timing.
const ITEM_ANIM_MS = 380;
const STAGGER_MS = 50;

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

  // Measure each nav item's natural offsetLeft within the row. When the nav
  // closes, item i translates by -offsetLefts[i] so it lands at position 0
  // — the row's left edge, which sits directly to the right of the hamburger.
  // Stagger + z-index then turn that uniform "land at 0" into a card-deck
  // collapse: the last item moves first, slides under each predecessor on the
  // way, and the stack ends up tucked behind the hamburger as the row's
  // max-width also animates down to 0.
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [offsetLefts, setOffsetLefts] = useState<number[]>([]);
  const [naturalWidth, setNaturalWidth] = useState<number>(0);

  useLayoutEffect(() => {
    const measure = () => {
      const lefts = itemRefs.current.map((el) => el?.offsetLeft ?? 0);
      setOffsetLefts(lefts);
      // Total natural width = last item's offsetLeft + width.
      const last = itemRefs.current[itemRefs.current.length - 1];
      if (last) {
        setNaturalWidth(last.offsetLeft + last.offsetWidth);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const totalAnimMs = ITEM_ANIM_MS + (NAV_ITEMS.length - 1) * STAGGER_MS;

  // Row max-width transition:
  //  - Opening: row expands immediately so items have space to slide into.
  //  - Closing: row waits for the staggered item slide to nearly finish, then
  //    collapses to 0. This way the deck-collapse is visible mid-flight rather
  //    than clipped away by an early max-width snap.
  const rowMaxWidthTransition = open
    ? `max-width ${ITEM_ANIM_MS}ms cubic-bezier(0.25, 1, 0.5, 1) 0ms`
    : `max-width ${ITEM_ANIM_MS}ms cubic-bezier(0.25, 1, 0.5, 1) ${Math.max(
        0,
        totalAnimMs - ITEM_ANIM_MS,
      )}ms`;

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

        {/* Hamburger / chevron toggle (stays fixed in place). z-index sits
            above the nav items so they truly tuck under it on close. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="comte-nav-items"
          style={{
            ...boxStyle({ width: BOX_HEIGHT, padding: 0 }),
            position: "relative",
            zIndex: 30,
          }}
        >
          <HamburgerIcon open={open} />
        </button>

        {/* Nav items — card-deck collapse. Container max-width drives the
            layout space; per-item translateX with stagger and z-index drives
            the deck animation. */}
        <div
          id="comte-nav-items"
          style={{
            overflow: "hidden",
            maxWidth: open ? Math.max(naturalWidth, 1) : 0,
            transition: rowMaxWidthTransition,
          }}
        >
          <div style={{ display: "flex", position: "relative" }}>
            {NAV_ITEMS.map((item, i) => {
              const reverseI = NAV_ITEMS.length - 1 - i;
              // Closing: rightmost item moves first (it falls under its left
              // neighbour, which then moves with it under the next, etc.).
              // Opening: leftmost first (the deck fans out).
              const delay = open ? i * STAGGER_MS : reverseI * STAGGER_MS;
              const isActive = activeSection === item.sectionId;
              const closedTranslate = -(offsetLefts[i] ?? 0);
              return (
                <button
                  key={item.sectionId}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => navigate(item.sectionId)}
                  tabIndex={open ? 0 : -1}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    ...boxStyle({
                      filter: isActive ? "brightness(0.92)" : undefined,
                      borderRight: ITEM_BORDER,
                    }),
                    position: "relative",
                    flexShrink: 0,
                    transform: open
                      ? "translateX(0)"
                      : `translateX(${closedTranslate}px)`,
                    transition: `transform ${ITEM_ANIM_MS}ms cubic-bezier(0.25, 1, 0.5, 1) ${delay}ms, filter 0.2s ease`,
                    // Earlier items render on top → later items slide under
                    // them, deck-style, as they translate leftward.
                    zIndex: NAV_ITEMS.length - i,
                  }}
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
