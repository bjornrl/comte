"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export type NavItem = { label: string; sectionId: string };

export const NAV_ITEMS: NavItem[] = [
  { label: "About", sectionId: "about-intro" },
  { label: "Projects", sectionId: "projects" },
  { label: "Team", sectionId: "team" },
  { label: "Publications", sectionId: "publications" },
  { label: "Ventures", sectionId: "ventures" },
];

const BOX_BG = "#F5F5E9";
const BOX_FG = "#1F3A32";
const BOX_HOVER_BG = "#FBFF00";
const BOX_HEIGHT = 42; // every nav box (logo, hamburger, nav items, contact) shares this height

// Outer gap between the logo / hamburger / nav-items wrapper — restored to
// the original 4px so the three blocks read as separate elements.
const OUTER_GAP = 4;
// Visual gap on each nav item's right edge, produced by clip-path. The
// clipped region is fully transparent, so the section background (or video,
// or anything else behind the nav) shows through. As items overlap during
// the deck-collapse, each layer keeps its own transparent slit, leaving a
// clean break between cards instead of a solid stroke.
const ITEM_GAP_PX = 4;

// Matches PANEL_PADDING in SectionShell so the logo/nav line up with the hero text.
const SIDE_MARGIN = "clamp(2rem, 5vw, 5rem)";
// Half of SIDE_MARGIN at every viewport width.
const TOP_MARGIN = "clamp(1rem, 2.5vw, 2.5rem)";

// Logo SVG viewBox is 247×71, so width follows height by this ratio.
const LOGO_ASPECT = 247 / 71;
const LOGO_WIDTH = Math.round(BOX_HEIGHT * LOGO_ASPECT);

// Collapse timing. STAGGER_MS = 0 makes every nav item slide in unison —
// a single continuous slide under the hamburger rather than a cascading
// deck-fold. Bump it for a staggered fall again.
const ITEM_ANIM_MS = 420;
const STAGGER_MS = 0;

/** Sections that highlight the About nav item. */
const ABOUT_SECTION_IDS = new Set(["about-intro", "about-office", "what-we-do"]);

function isNavItemActive(sectionId: string, activeSection?: string): boolean {
  if (!activeSection) return false;
  if (activeSection === sectionId) return true;
  if (sectionId === "about-intro" && ABOUT_SECTION_IDS.has(activeSection)) return true;
  return false;
}

function isLogoActive(activeSection?: string): boolean {
  return activeSection === "home" || activeSection === "motto";
}

function isContactActive(activeSection?: string): boolean {
  return activeSection === "contact";
}

function navItemBackground(isActive: boolean): string {
  return isActive ? BOX_HOVER_BG : BOX_BG;
}

type Props = {
  onNavigate?: (sectionId: string) => void;
  activeSection?: string;
  /** When true, the nav forces itself closed regardless of activeSection. */
  isScrolling?: boolean;
};

/**
 * Two-line icon that morphs between hamburger and chevron via an animated
 * SVG path `d` attribute.
 *
 *   open=false  (hamburger)              open=true  (chevron pointing left)
 *
 *   ────────────                          ╲
 *   ────────────                           ╲
 *                                          ╱
 *                                         ╱
 *
 * Both paths share the same structure — two sub-paths, each a Move + a Line
 * (M L M L) — so the browser interpolates every coordinate point-for-point:
 *
 *   - The right-edge points (the `M` of each sub-path) animate vertically
 *     OUTWARDS so the right ends fan apart to the corners.
 *   - The left-edge points (the `L` of each sub-path) animate vertically
 *     INWARDS, converging to the chevron's tip at y=5.
 *
 * CSS transitions on the `d` attribute are supported in every recent
 * Chromium-based browser and in Safari 14+. Where unavailable the morph
 * falls back to a snap, but the chevron shape itself still renders.
 */
function HamburgerIcon({ open }: { open: boolean }) {
  // Closed-state line positions — hamburger lines sit a little closer than
  // the original 1/9 split for a tighter, more refined look.
  const HAM_TOP_Y = 3;
  const HAM_BOTTOM_Y = 7;
  // Chevron corners + tip. Symmetric widening past the SVG's 0–10 viewBox
  // (the SVG has `overflow: visible`) so the chevron's lower arm extends
  // down to the same y as the nav-item text line.
  const CHEV_TOP_Y = 1;
  const CHEV_BOTTOM_Y = 9;
  const CHEV_TIP_Y = 5;

  const d = open
    ? `M 22 ${CHEV_TOP_Y} L 0 ${CHEV_TIP_Y} M 22 ${CHEV_BOTTOM_Y} L 0 ${CHEV_TIP_Y}`
    : `M 22 ${HAM_TOP_Y} L 0 ${HAM_TOP_Y} M 22 ${HAM_BOTTOM_Y} L 0 ${HAM_BOTTOM_Y}`;

  return (
    <svg
      width={22}
      height={10}
      viewBox="0 0 22 10"
      style={{ overflow: "visible", display: "block" }}
      aria-hidden="true"
    >
      <path
        d={d}
        stroke={BOX_FG}
        strokeWidth={2}
        strokeLinecap="butt"
        fill="none"
        style={{ transition: "d 0.4s cubic-bezier(0.25, 1, 0.5, 1)" }}
      />
    </svg>
  );
}

const boxStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
  height: BOX_HEIGHT,
  background: BOX_BG,
  color: BOX_FG,
  borderRadius: 0,
  border: "none",
  // Asymmetric vertical padding nudges text slightly above the box's true
  // vertical centre — sits more comfortably with the cap-height of Work Sans
  // inside a 42px box. Using explicit longhands so the nav-item override of
  // paddingLeft/paddingRight (for the clip-path gap) actually wins — React's
  // style serializer silently drops longhands that collide with a `padding`
  // shorthand sitting earlier in the same object.
  paddingTop: 2,
  paddingRight: 16,
  paddingBottom: 0,
  paddingLeft: 16,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "var(--font-work-sans), system-ui, sans-serif",
  fontWeight: 400,
  fontSize: "1rem",
  // All nav-element labels display in lowercase (e.g. "about" not "About").
  // We keep the source strings sentence-cased so screen readers and PR
  // descriptions still read naturally — CSS lowercases at render time.
  textTransform: "lowercase" as const,
  letterSpacing: "0.01em",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "background 0.2s ease",
  ...extra,
});

export default function BlobNav({ onNavigate, activeSection, isScrolling }: Props) {
  const [open, setOpen] = useState(true); // page starts with menu open (we land on Home)
  const [logoHovered, setLogoHovered] = useState(false);
  /** Pointer is within the full nav row band (including gaps between items). */
  const [navPointerInside, setNavPointerInside] = useState(false);
  const navRowRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const logoActive = isLogoActive(activeSection);
  const contactActive = isContactActive(activeSection);
  const logoHighlighted = logoHovered || logoActive;

  // Track whether the pointer sits inside the nav row. Gaps between logo,
  // hamburger, items, and the space to Contact are all inside the row rect.
  // Only clear when the pointer exits downward — not when crossing internal
  // gaps or leaving sideways above the row.
  useEffect(() => {
    const updatePointerInside = (e: PointerEvent) => {
      const row = navRowRef.current;
      if (!row) return;
      const rect = row.getBoundingClientRect();
      const inRow =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (inRow) {
        setNavPointerInside(true);
      } else if (e.clientY >= rect.bottom) {
        setNavPointerInside(false);
      }
    };

    window.addEventListener("pointermove", updatePointerInside, { passive: true });
    return () => window.removeEventListener("pointermove", updatePointerInside);
  }, []);

  // Open on the landing section when idle; during navbar navigation stay
  // open while the pointer rests anywhere in the nav row.
  useEffect(() => {
    if (activeSection === "home" && !isScrolling) {
      setOpen(true);
    } else if (navPointerInside) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [activeSection, isScrolling, navPointerInside]);

  const navigate = useCallback(
    (sectionId: string) => {
      setNavPointerInside(true);
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
    <div
      ref={navRowRef}
      style={{
        position: "fixed",
        top: TOP_MARGIN,
        left: SIDE_MARGIN,
        right: SIDE_MARGIN,
        height: BOX_HEIGHT,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        pointerEvents: "none",
      }}
    >
      {/* Left cluster: logo + hamburger + sliding nav items */}
      <div
        aria-label="Main navigation"
        role="navigation"
        style={{
          display: "flex",
          alignItems: "center",
          gap: OUTER_GAP,
          pointerEvents: "auto",
        }}
      >
        {/* Logo */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            navigate("home");
          }}
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
          aria-label="Comte – home"
          aria-current={logoActive ? "page" : undefined}
          style={{
            display: "inline-flex",
            height: BOX_HEIGHT,
            width: LOGO_WIDTH,
            background: logoHighlighted ? BOX_HOVER_BG : BOX_BG,
            lineHeight: 0,
            cursor: "pointer",
            transition: "background 0.2s ease",
          }}
        >
          <Image
            src={logoHighlighted ? "/logo-yellow.svg" : "/logo-white.svg"}
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
              const isLastItem = i === NAV_ITEMS.length - 1;
              // Closing: rightmost item moves first (it falls under its left
              // neighbour, which then moves with it under the next, etc.).
              // Opening: leftmost first (the deck fans out).
              const delay = open ? i * STAGGER_MS : reverseI * STAGGER_MS;
              const isActive = isNavItemActive(item.sectionId, activeSection);
              const closedTranslate = -(offsetLefts[i] ?? 0);
              return (
                <button
                  key={item.sectionId}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  data-nav-item={item.sectionId}
                  onClick={() => navigate(item.sectionId)}
                  tabIndex={open ? 0 : -1}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    ...boxStyle({
                      background: navItemBackground(isActive),
                      // clip-path eats the rightmost ITEM_GAP_PX including
                      // the right padding. Pad the right by the same amount
                      // so the visible inner padding stays symmetrical with
                      // the left (matches boxStyle's 16px). The last item
                      // skips the clip — no gap follows it — so it keeps
                      // normal right padding like the Contact button.
                      paddingLeft: 16,
                      paddingRight: isLastItem ? 16 : 16 + ITEM_GAP_PX,
                    }),
                    position: "relative",
                    flexShrink: 0,
                    // clip-path knocks the right ITEM_GAP_PX of each item to
                    // transparency (alpha 0). In the open state this is the
                    // visible gap between items. While they overlap during
                    // the collapse, every layer keeps its own transparent
                    // slit, so the deck stays readable without a colored
                    // stroke and whatever sits behind the nav (section bg,
                    // future video) shows through every gap.
                    ...(isLastItem ? {} : { clipPath: `inset(0 ${ITEM_GAP_PX}px 0 0)` }),
                    transform: open
                      ? "translateX(0)"
                      : `translateX(${closedTranslate}px)`,
                    transition: `transform ${ITEM_ANIM_MS}ms cubic-bezier(0.25, 1, 0.5, 1) ${delay}ms, background 0.2s ease`,
                    // Earlier items render on top → later items slide under
                    // them, deck-style, as they translate leftward.
                    zIndex: NAV_ITEMS.length - i,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = BOX_HOVER_BG;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = navItemBackground(isActive);
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
      <button
        type="button"
        onClick={() => navigate("contact")}
        aria-label="Contact – go to Contact section"
        aria-current={contactActive ? "page" : undefined}
        style={{
          ...boxStyle({ background: navItemBackground(contactActive) }),
          pointerEvents: "auto",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = BOX_HOVER_BG;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = navItemBackground(contactActive);
        }}
      >
        Contact
      </button>
    </div>
  );
}
