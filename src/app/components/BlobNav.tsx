"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, Fragment } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export type NavItem = { label: string; sectionId: string };

export const NAV_ITEMS: NavItem[] = [
  { label: "About", sectionId: "about-intro" },
  { label: "Projects", sectionId: "projects" },
  { label: "Team", sectionId: "team" },
  { label: "Publications", sectionId: "publications" },
  { label: "Ventures", sectionId: "ventures" },
  { label: "Contact", sectionId: "contact" },
];

const BOX_BG = "#F5F5E9";
const BOX_FG = "#5A7482";
const BOX_HOVER_BG = "#FF5252";
const NAV_ITEM_BG = "#5A7482";
const NAV_ITEM_FG = "#F4F4E8";
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

// Collapse timing. STAGGER_MS = 0 makes the whole row open and close in
// one continuous motion — every element (including the inserted
// publications item-title button) animates in unison rather than as a
// staggered cascade. The back-button still sits in its natural slot
// between Publications and Ventures; its wrapper-width animation grows
// in lockstep with the row, so Ventures/Contact glide into place
// without a visible "joint".
const ITEM_ANIM_MS = 420;
const STAGGER_MS = 0;

/** Sections that highlight the About nav item. */
const ABOUT_SECTION_IDS = new Set(["about-intro", "what-we-do"]);

function isNavItemActive(sectionId: string, activeSection?: string): boolean {
  if (!activeSection) return false;
  if (activeSection === sectionId) return true;
  if (sectionId === "about-intro" && ABOUT_SECTION_IDS.has(activeSection)) return true;
  return false;
}

function isLogoActive(activeSection?: string): boolean {
  return activeSection === "home" || activeSection === "motto";
}

function navLogoSrc(activeSection: string | undefined, highlighted: boolean): string {
  if (highlighted) return "/comte-coral.svg";
  if (activeSection === "projects") return "/logo-blue.svg";
  return "/logo-white.svg";
}

function navItemColors(isActive: boolean): { background: string; color: string } {
  return isActive
    ? { background: BOX_HOVER_BG, color: NAV_ITEM_FG }
    : { background: NAV_ITEM_BG, color: NAV_ITEM_FG };
}

function applyNavItemColors(el: HTMLElement, isActive: boolean) {
  const colors = navItemColors(isActive);
  el.style.background = colors.background;
  el.style.color = colors.color;
}

function applyNavHoverColors(el: HTMLElement) {
  el.style.background = BOX_HOVER_BG;
  el.style.color = NAV_ITEM_FG;
}

type Props = {
  onNavigate?: (sectionId: string) => void;
  activeSection?: string;
  /** When true, the nav forces itself closed regardless of activeSection. */
  isScrolling?: boolean;
  /**
   * When provided, the navbar stays open and the publications nav item is
   * outlined in pink. The navbar expands in its ordinary width first; once
   * that open animation has settled, a pink-filled button is inserted to
   * its right showing the viewed item's title. Clicking either button
   * returns to the publications overview.
   */
  publicationsItemView?: { onClick: () => void; itemTitle: string } | null;
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
        stroke={NAV_ITEM_FG}
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
  transition: "background 0.2s ease, color 0.2s ease",
  ...extra,
});

export default function BlobNav({
  onNavigate,
  activeSection,
  isScrolling,
  publicationsItemView,
}: Props) {
  const [open, setOpen] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const [backHovered, setBackHovered] = useState(false);
  /** Pointer is within the full nav row band (including gaps between items). */
  const [navPointerInside, setNavPointerInside] = useState(false);
  const navRowRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const logoActive = isLogoActive(activeSection);
  const logoHighlighted = logoHovered || logoActive;

  // Phase 1 — item view is active: force the nav open and outline the
  // publications item at ordinary width. Phase 2 — once the nav's open
  // animation has settled, mount the item-title button beside it.
  const itemViewActive = !!publicationsItemView;

  /** Whether the nav was already open at the moment item view began. If
   *  so, there's no expansion animation to wait for before showing the
   *  item-title button. */
  const navWasOpenAtItemViewRef = useRef(false);
  const prevItemViewActiveRef = useRef(false);
  const [backButtonReady, setBackButtonReady] = useState(false);

  useEffect(() => {
    if (itemViewActive && !prevItemViewActiveRef.current) {
      navWasOpenAtItemViewRef.current = open;
    }
    if (!itemViewActive) {
      navWasOpenAtItemViewRef.current = false;
      setBackButtonReady(false);
    }
    prevItemViewActiveRef.current = itemViewActive;
  }, [itemViewActive, open]);

  useEffect(() => {
    if (!itemViewActive) return;
    if (!open) return;
    const delay = navWasOpenAtItemViewRef.current ? 0 : ITEM_ANIM_MS;
    const t = window.setTimeout(() => setBackButtonReady(true), delay);
    return () => window.clearTimeout(t);
  }, [itemViewActive, open]);

  // Mount-presence transition for the inserted item-title button. A small
  // state machine drives both the wrapper *width* (which the flex layout
  // uses to push the items to the right) and the inner button's
  // *translateX* (which gives the button itself the "slide out from
  // under publications" feel):
  //
  //   closed  -> title slot is not in the row.
  //   opening -> slot mounts at gap width (net zero layout delta vs the
  //              ordinary publications→ventures clip gap).
  //   open    -> slot animates to the measured title width.
  //   closing -> slot width + overlap margin animate back to zero.
  //
  // While `open`, swapping the item title re-measures the inner button
  // and the wrapper width animates to the new content width, so items
  // to the right (Ventures, Contact) glide along.
  type BackButtonState = "closed" | "opening" | "open" | "closing";
  const [backButtonState, setBackButtonState] = useState<BackButtonState>("closed");
  const [persistedBackButton, setPersistedBackButton] = useState<
    Props["publicationsItemView"]
  >(null);
  const backButtonInnerRef = useRef<HTMLButtonElement | null>(null);
  const backButtonMeasureRef = useRef<HTMLButtonElement | null>(null);
  const [backButtonContentWidth, setBackButtonContentWidth] = useState(0);

  const measureBackButtonWidth = useCallback(() => {
    const el = backButtonInnerRef.current ?? backButtonMeasureRef.current;
    if (!el) return;
    const next = el.scrollWidth;
    setBackButtonContentWidth((prev) => (prev === next ? prev : next));
  }, []);

  const backButtonSource = itemViewActive ? publicationsItemView : null;

  // Keep title/handler data in sync while item view is active.
  useEffect(() => {
    if (backButtonSource) {
      setPersistedBackButton(backButtonSource);
    }
  }, [backButtonSource]);

  // Phase 1: no title-button DOM — publications keeps its ordinary clip
  // and the ventures gap is unchanged. Phase 2: mount at gap width first,
  // then animate to the full title width so ventures never snap.
  useEffect(() => {
    if (!itemViewActive) {
      setBackButtonState((current) =>
        current === "open" || current === "opening" || current === "closing"
          ? "closing"
          : "closed",
      );
      return;
    }
    if (!backButtonReady || backButtonContentWidth <= 0) return;
    setBackButtonState((current) =>
      current === "open" || current === "opening" ? current : "opening",
    );
  }, [itemViewActive, backButtonReady, backButtonContentWidth]);

  // Clear persisted data once fully closed (including phase-1 exits that
  // never mounted the title button).
  useEffect(() => {
    if (!itemViewActive && backButtonState === "closed") {
      setPersistedBackButton(null);
    }
  }, [itemViewActive, backButtonState]);

  // Drive state transitions that need a timer:
  //  - opening: paint at gap width first, then expand to the measured
  //    title width on the next frame so the CSS width transition runs.
  //  - closing: wait for width + margin to finish, then unmount.
  useLayoutEffect(() => {
    if (backButtonState !== "opening") return;
    if (backButtonContentWidth <= 0) return;

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setBackButtonState("open"));
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [backButtonState, backButtonContentWidth]);

  useEffect(() => {
    if (backButtonState === "closing") {
      const t = window.setTimeout(() => setBackButtonState("closed"), ITEM_ANIM_MS);
      return () => window.clearTimeout(t);
    }
  }, [backButtonState]);

  // Measure title width from a hidden probe during phase 1, then from
  // the live button once the slot is mounted.
  useLayoutEffect(() => {
    measureBackButtonWidth();
  }, [
    itemViewActive,
    publicationsItemView?.itemTitle,
    backButtonState,
    measureBackButtonWidth,
  ]);

  const backButtonMounted =
    backButtonState !== "closed" && !!persistedBackButton;
  const backButtonWrapperWidth =
    backButtonState === "open"
      ? backButtonContentWidth
      : backButtonState === "opening"
        ? ITEM_GAP_PX
        : 0;
  const backButtonSlotMarginLeft =
    backButtonWrapperWidth > 0 ? -ITEM_GAP_PX : 0;
  const backButtonSlotTransition = `width ${ITEM_ANIM_MS}ms cubic-bezier(0.25, 1, 0.5, 1), margin-left ${ITEM_ANIM_MS}ms cubic-bezier(0.25, 1, 0.5, 1)`;

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

  // Collapsed on entry; opens when the pointer enters the nav row. Stays
  // closed while a section scroll is in flight (even in publications item
  // view, so horizontal scrolling collapses the nav normally). When idle
  // and in item view, the nav is forced open so the inserted item-title
  // button is always reachable.
  useEffect(() => {
    if (isScrolling) {
      setOpen(false);
      return;
    }
    if (itemViewActive) {
      setOpen(true);
      return;
    }
    if (navPointerInside) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [isScrolling, navPointerInside, itemViewActive]);

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
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [offsetLefts, setOffsetLefts] = useState<number[]>([]);
  const [naturalWidth, setNaturalWidth] = useState<number>(0);

  useLayoutEffect(() => {
    const measure = () => {
      const lefts = itemRefs.current.map((el) => el?.offsetLeft ?? 0);
      setOffsetLefts(lefts);
      // Natural width = sum of each nav item's own offsetWidth. We
      // deliberately don't use `last.offsetLeft + last.offsetWidth`
      // here because the inserted back-button (when present) sits
      // between Publications and Ventures and pushes the later items
      // right, which would inflate that reading. Summing the items'
      // own widths gives us a *base* that ignores the back button,
      // and the effective container max-width (further below) adds
      // the back button's current content width on top — so the
      // wrapper grows in lockstep with the inserted button and the
      // rightmost items aren't clipped while the button is widening.
      const widths = itemRefs.current.map((el) => el?.offsetWidth ?? 0);
      const total = widths.reduce((a, b) => a + b, 0);
      setNaturalWidth(total);
    };
    measure();
    // Re-measure offsetLefts once the back-button width transition
    // settles, so deck-collapse closedTranslate values for items right
    // of the back button reflect their pushed positions.
    const t = window.setTimeout(measure, ITEM_ANIM_MS);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.clearTimeout(t);
    };
  }, [backButtonMounted, backButtonContentWidth]);

  const totalAnimMs = ITEM_ANIM_MS + (NAV_ITEMS.length - 1) * STAGGER_MS;

  // The container's max-width follows the back button's expansion so
  // Ventures/Contact aren't clipped while the inserted button is
  // animating in, out, or resizing on a title change.
  const expandedBackButtonWidth = (() => {
    if (!backButtonMounted) return 0;
    if (backButtonState === "closing") return backButtonContentWidth;
    return backButtonWrapperWidth;
  })();
  const effectiveNaturalWidth = naturalWidth + expandedBackButtonWidth;

  // Row max-width transition:
  //  - Opening: row expands immediately so items have space to slide into.
  //  - Closing: row waits for the staggered item slide to nearly finish, then
  //    collapses to 0. This way the deck-collapse is visible mid-flight rather
  //    than clipped away by an early max-width snap.
  const itemsMaxWidthTransition = open
    ? `max-width ${ITEM_ANIM_MS}ms cubic-bezier(0.25, 1, 0.5, 1)`
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
          position: "relative",
        }}
      >
        {/* Hidden probe — measures the title width during phase 1 so the
            live slot can expand in one smooth width transition. */}
        {itemViewActive && publicationsItemView && !backButtonMounted && (
          <button
            ref={backButtonMeasureRef}
            type="button"
            aria-hidden
            tabIndex={-1}
            style={{
              ...boxStyle({
                background: BOX_HOVER_BG,
                color: NAV_ITEM_FG,
                paddingLeft: 16,
                paddingRight: 16 + ITEM_GAP_PX,
              }),
              position: "absolute",
              left: -10000,
              top: 0,
              visibility: "hidden",
              pointerEvents: "none",
            }}
          >
            {publicationsItemView.itemTitle || "back to overview"}
          </button>
        )}
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
            transition: "background 0.2s ease, color 0.2s ease",
          }}
        >
          <Image
            src={navLogoSrc(activeSection, logoHighlighted)}
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
            ...boxStyle({ width: BOX_HEIGHT, padding: 0, ...navItemColors(false) }),
            position: "relative",
            zIndex: 30,
          }}
          onMouseEnter={(e) => {
            applyNavHoverColors(e.currentTarget);
          }}
          onMouseLeave={(e) => {
            applyNavItemColors(e.currentTarget, false);
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
            maxWidth: open ? Math.max(effectiveNaturalWidth, 1) : 0,
            transition: itemsMaxWidthTransition,
          }}
        >
          <div style={{ display: "flex", position: "relative" }}>
            {NAV_ITEMS.map((item, i) => {
              const reverseI = NAV_ITEMS.length - 1 - i;
              const isLastItem = i === NAV_ITEMS.length - 1;
              const delay = open ? i * STAGGER_MS : reverseI * STAGGER_MS;
              const isActive = isNavItemActive(item.sectionId, activeSection);
              const closedTranslate = -(offsetLefts[i] ?? 0);
              const isPublications = item.sectionId === "publications";
              const outlined = isPublications && itemViewActive;
              const colorScheme = outlined
                ? {
                    background: "transparent",
                    color: BOX_HOVER_BG,
                    outline: `1px solid ${BOX_HOVER_BG}`,
                    outlineOffset: "-1px",
                  }
                : navItemColors(isActive);
              // Publications keeps the same right clip-path as every other
              // nav item for the entire item-view sequence. The title
              // button overlaps that clipped zone via a negative margin
              // instead of removing the clip (which would snap ventures).
              const showRightClip = !isLastItem;
              return (
                <Fragment key={item.sectionId}>
                  <div
                    ref={(el) => {
                      itemRefs.current[i] = el;
                    }}
                    style={{
                      position: "relative",
                      flexShrink: 0,
                      transform: open
                        ? "translateX(0)"
                        : `translateX(${closedTranslate}px)`,
                      transition: `transform ${ITEM_ANIM_MS}ms cubic-bezier(0.25, 1, 0.5, 1) ${delay}ms`,
                      zIndex: NAV_ITEMS.length - i,
                    }}
                  >
                    <button
                      type="button"
                      data-nav-item={item.sectionId}
                      onClick={() => {
                        if (outlined && publicationsItemView) {
                          // While in item view, clicking the publications
                          // button itself returns to the overview rather
                          // than horizontally re-snapping to the section
                          // we're already on.
                          publicationsItemView.onClick();
                          return;
                        }
                        navigate(item.sectionId);
                      }}
                      tabIndex={open ? 0 : -1}
                      aria-current={isActive ? "page" : undefined}
                      style={{
                        ...boxStyle({
                          ...colorScheme,
                          paddingLeft: 16,
                          paddingRight: showRightClip ? 16 + ITEM_GAP_PX : 16,
                        }),
                        position: "relative",
                        ...(showRightClip ? { clipPath: `inset(0 ${ITEM_GAP_PX}px 0 0)` } : {}),
                        transition:
                          "background 0.2s ease, color 0.2s ease, outline-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        applyNavHoverColors(e.currentTarget);
                      }}
                      onMouseLeave={(e) => {
                        if (outlined) {
                          // Restore outlined look: transparent fill, pink
                          // text + pink outline (set via inline style on
                          // the next render anyway, but reset imperatively
                          // here so the leave is instant).
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = BOX_HOVER_BG;
                          return;
                        }
                        applyNavItemColors(e.currentTarget, isActive);
                      }}
                    >
                      {item.label}
                    </button>
                  </div>

                  {/* Pink-filled item-title button inserted directly after
                      the publications nav item — flush, no gap.
                      Two animations run in parallel:
                       - The wrapper's `width` animates from 0 to the
                         inner button's natural content width. That's
                         the flex track Ventures/Contact occupy, so
                         they slide along with the button on its way
                         in and out, and the wrapper smoothly resizes
                         when the title changes mid-item-view.
                       - The inner button's `translateX` slides from
                         -100% to 0 (and back), so visually it looks
                         like the button is emerging from under the
                         publications item rather than just being
                         revealed by a width wipe. */}
                  {isPublications && persistedBackButton && (
                    <div
                      style={{
                        position: "relative",
                        flexShrink: 0,
                        width: backButtonWrapperWidth,
                        overflow: "hidden",
                        marginLeft: backButtonSlotMarginLeft,
                        zIndex: NAV_ITEMS.length - i - 0.5,
                        transition: backButtonSlotTransition,
                      }}
                    >
                      <button
                        ref={backButtonInnerRef}
                        type="button"
                        onClick={persistedBackButton.onClick}
                        onMouseEnter={() => setBackHovered(true)}
                        onMouseLeave={() => setBackHovered(false)}
                        aria-label={
                          persistedBackButton.itemTitle
                            ? `Back to publications overview (currently viewing ${persistedBackButton.itemTitle})`
                            : "Back to publications overview"
                        }
                        style={{
                          ...boxStyle({
                            background: backHovered ? "#FF7B7B" : BOX_HOVER_BG,
                            color: NAV_ITEM_FG,
                            paddingLeft: 16,
                            paddingRight: 16 + ITEM_GAP_PX,
                          }),
                          position: "relative",
                          clipPath: `inset(0 ${ITEM_GAP_PX}px 0 0)`,
                          whiteSpace: "nowrap",
                          transition: "background 0.2s ease, color 0.2s ease",
                        }}
                      >
                        {persistedBackButton.itemTitle || "back to overview"}
                      </button>
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
