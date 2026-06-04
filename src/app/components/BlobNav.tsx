"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, Fragment } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import LocaleToggle from "./LocaleToggle";
import { useUi } from "./useUi";
import {
  NAV_ACTIVE_BG,
  NAV_ACTIVE_FG,
  NAV_BOX_HOVER_BG,
  NAV_COLOR_TRANSITION,
  NAV_COLOR_TRANSITION_MS,
} from "./navTheme";
import { useNavThemeBlend } from "./useNavThemeBlend";

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
/** Gap between projects prev/next controls and where the nav hover band ends. */
const PROJECTS_PAGINATION_HOVER_MARGIN = 16;

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

function navItemColorsForTheme(
  theme: { navItemBg: string; navItemFg: string },
  isActive: boolean,
): { background: string; color: string } {
  return isActive
    ? { background: NAV_ACTIVE_BG, color: NAV_ACTIVE_FG }
    : { background: theme.navItemBg, color: theme.navItemFg };
}

function applyNavItemColorsForTheme(
  el: HTMLElement,
  theme: { navItemBg: string; navItemFg: string },
  isActive: boolean,
) {
  const colors = navItemColorsForTheme(theme, isActive);
  el.style.background = colors.background;
  el.style.color = colors.color;
}

function applyNavHoverColors(el: HTMLElement) {
  el.style.background = NAV_BOX_HOVER_BG;
  el.style.color = NAV_ACTIVE_FG;
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
function HamburgerIcon({ open, strokeColor }: { open: boolean; strokeColor: string }) {
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
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="butt"
        fill="none"
        style={{ transition: `d 0.4s cubic-bezier(0.25, 1, 0.5, 1), stroke ${NAV_COLOR_TRANSITION}` }}
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
  transition: NAV_COLOR_TRANSITION,
  ...extra,
});

export default function BlobNav({
  onNavigate,
  activeSection,
  isScrolling = false,
  publicationsItemView,
}: Props) {
  const [open, setOpen] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const [backHovered, setBackHovered] = useState(false);
  const [navigatingViaClick, setNavigatingViaClick] = useState(false);
  /** Pointer is within the full nav row band (including gaps between items). */
  const [navPointerInside, setNavPointerInside] = useState(false);
  const navRowRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const ui = useUi();

  const logoActive = isLogoActive(activeSection);
  /** Coral mark on landing at rest; fades to logo blue once horizontal scroll begins. */
  const logoMarkCoral = logoActive && !isScrolling;
  const logoBoxHighlighted = logoHovered || logoMarkCoral;
  const { colors: navTheme, themeLogoSrc, freezeForNavClick } = useNavThemeBlend(
    activeSection,
    isScrolling,
    navigatingViaClick,
  );
  const displayThemeLogo =
    logoActive && isScrolling ? "/logo-blue.svg" : themeLogoSrc;

  useEffect(() => {
    if (!isScrolling && navigatingViaClick) {
      setNavigatingViaClick(false);
    }
  }, [isScrolling, navigatingViaClick]);

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
  const backButtonSlotRef = useRef<HTMLDivElement | null>(null);
  /** Latest measured title width — readable synchronously before state commits. */
  const backButtonContentWidthRef = useRef(0);
  const [backButtonContentWidth, setBackButtonContentWidth] = useState(0);

  const measureBackButtonWidth = useCallback(() => {
    // Prefer the hidden probe — it always carries the latest title from props,
    // while the visible button can lag one frame behind persistedBackButton.
    const el = backButtonMeasureRef.current ?? backButtonInnerRef.current;
    if (!el) return;
    const next = el.scrollWidth;
    backButtonContentWidthRef.current = next;
    setBackButtonContentWidth((prev) => (prev === next ? prev : next));
  }, []);

  const backButtonSource = itemViewActive ? publicationsItemView : null;
  /** Live title/handler while item view is active; persisted copy for close animation. */
  const slotBackButton =
    itemViewActive && publicationsItemView ? publicationsItemView : persistedBackButton;

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

  const backButtonMounted =
    backButtonState !== "closed" && !!slotBackButton;
  // Use the state value (not the ref) during render — the ref mirrors this
  // state and reading a ref's `.current` during render is unsafe.
  const measuredTitleWidth = backButtonContentWidth;
  const backButtonWrapperWidth =
    backButtonState === "open"
      ? measuredTitleWidth
      : backButtonState === "opening"
        ? ITEM_GAP_PX
        : 0;
  const backButtonSlotMarginLeft =
    backButtonWrapperWidth > 0 ? -ITEM_GAP_PX : 0;
  const backButtonSlotTransition = `width ${ITEM_ANIM_MS}ms cubic-bezier(0.25, 1, 0.5, 1), margin-left ${ITEM_ANIM_MS}ms cubic-bezier(0.25, 1, 0.5, 1)`;

  // Track whether the pointer sits inside the nav row. Gaps between logo,
  // hamburger, items, and the space to Contact are all inside the row rect.
  // On the projects panel, the right edge stops before the tile nav column
  // (dots + prev/next — see `[data-tile-pagination]` in ProjectCluster).
  // Only clear when the pointer exits downward — not when crossing internal
  // gaps or leaving sideways above the row.
  useEffect(() => {
    const updatePointerInside = (e: PointerEvent) => {
      const row = navRowRef.current;
      if (!row) return;
      const rect = row.getBoundingClientRect();

      let hoverRight = rect.right;
      if (activeSection === "projects") {
        const pagination = document.querySelector("[data-tile-pagination]");
        if (pagination) {
          const pagRect = pagination.getBoundingClientRect();
          hoverRight = Math.min(hoverRight, pagRect.left - PROJECTS_PAGINATION_HOVER_MARGIN);
        }
      }

      const inRowY = e.clientY >= rect.top && e.clientY <= rect.bottom;
      const inExcludedProjectsPaginationZone =
        activeSection === "projects" &&
        inRowY &&
        e.clientX > hoverRight;

      if (inExcludedProjectsPaginationZone) {
        setNavPointerInside(false);
        return;
      }

      const inRow =
        e.clientX >= rect.left &&
        e.clientX <= hoverRight &&
        inRowY;
      if (inRow) {
        setNavPointerInside(true);
      } else if (e.clientY >= rect.bottom) {
        setNavPointerInside(false);
      }
    };

    window.addEventListener("pointermove", updatePointerInside, { passive: true });
    return () => window.removeEventListener("pointermove", updatePointerInside);
  }, [activeSection]);

  // Opens when the pointer enters the nav row; stays open while the pointer
  // remains over the row — including during horizontal scroll (e.g. after
  // clicking a nav item). Collapses only once the pointer has left the row
  // and we're not in publications item view.
  useEffect(() => {
    if (itemViewActive) {
      setOpen(true);
      return;
    }
    if (navPointerInside) {
      setOpen(true);
      return;
    }
    setOpen(false);
  }, [navPointerInside, itemViewActive]);

  const navigate = useCallback(
    (sectionId: string) => {
      setNavPointerInside(true);
      freezeForNavClick();
      setNavigatingViaClick(true);
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
    [onNavigate, pathname, router, freezeForNavClick],
  );

  // Measure each nav item's natural offsetLeft within the row. When the nav
  // closes, item i translates by -offsetLefts[i] so it lands at position 0
  // — the row's left edge, which sits directly to the right of the hamburger.
  // Stagger + z-index then turn that uniform "land at 0" into a card-deck
  // collapse: the last item moves first, slides under each predecessor on the
  // way, and the stack ends up tucked behind the hamburger as the row's
  // max-width also animates down to 0.
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const navItemsRowRef = useRef<HTMLDivElement | null>(null);
  const [offsetLefts, setOffsetLefts] = useState<number[]>([]);
  /** Sum of the six nav-item wrapper widths — stable while the title slot resizes. */
  const [baseItemsWidth, setBaseItemsWidth] = useState(0);
  /** Live trailing edge of the flex row (last child right). */
  const [rowWidth, setRowWidth] = useState(0);

  const measureNavLayout = useCallback(() => {
    const row = navItemsRowRef.current;
    if (!row) return;

    const lefts = itemRefs.current.map((el) => el?.offsetLeft ?? 0);
    setOffsetLefts(lefts);

    const base = itemRefs.current.reduce(
      (sum, el) => sum + (el?.offsetWidth ?? 0),
      0,
    );
    setBaseItemsWidth(base);

    const last = row.lastElementChild as HTMLElement | null;
    if (last) {
      setRowWidth(last.offsetLeft + last.offsetWidth);
    } else {
      setRowWidth(base);
    }
  }, []);

  useLayoutEffect(() => {
    measureBackButtonWidth();
    measureNavLayout();

    const row = navItemsRowRef.current;
    if (!row) return;

    const remeasure = () => {
      measureBackButtonWidth();
      measureNavLayout();
    };

    const ro = new ResizeObserver(remeasure);
    ro.observe(row);

    const backBtn = backButtonMeasureRef.current ?? backButtonInnerRef.current;
    if (backBtn) ro.observe(backBtn);

    const backSlot = backButtonSlotRef.current;
    if (backSlot) ro.observe(backSlot);

    window.addEventListener("resize", remeasure);
    const t = window.setTimeout(remeasure, ITEM_ANIM_MS);

    // Second pass after layout — catches title swaps that land between frames.
    let raf = 0;
    if (itemViewActive && publicationsItemView?.itemTitle) {
      raf = requestAnimationFrame(remeasure);
    }

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", remeasure);
      window.clearTimeout(t);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [
    measureNavLayout,
    measureBackButtonWidth,
    backButtonMounted,
    backButtonState,
    backButtonContentWidth,
    backButtonWrapperWidth,
    publicationsItemView?.itemTitle,
    itemViewActive,
    open,
  ]);

  const totalAnimMs = ITEM_ANIM_MS + (NAV_ITEMS.length - 1) * STAGGER_MS;

  // Container max-width must track the title button's *target* width immediately
  // (not lag behind a CSS transition). The flex row layout is:
  //   baseItemsWidth + titleSlotWidth - ITEM_GAP_PX overlap
  // Use max(computed, measured) so shrink animations never clip mid-flight.
  const backButtonLayoutWidth = (() => {
    if (!backButtonMounted) return 0;
    return backButtonContentWidth;
  })();

  const computedRowWidth =
    baseItemsWidth +
    Math.max(0, backButtonLayoutWidth - (backButtonMounted ? ITEM_GAP_PX : 0));

  const effectiveNaturalWidth = open
    ? Math.max(computedRowWidth, rowWidth, 1)
    : 0;

  // Row max-width transition:
  //  - Item view: no transition — max-width must track title resizes instantly.
  //  - Opening: row expands immediately so items have space to slide into.
  //  - Closing: row waits for the staggered item slide to nearly finish, then
  //    collapses to 0. This way the deck-collapse is visible mid-flight rather
  //    than clipped away by an early max-width snap.
  const itemsMaxWidthTransition = itemViewActive
    ? "none"
    : open
      ? `max-width ${ITEM_ANIM_MS}ms cubic-bezier(0.25, 1, 0.5, 1)`
      : `max-width ${ITEM_ANIM_MS}ms cubic-bezier(0.25, 1, 0.5, 1) ${Math.max(
          0,
          totalAnimMs - ITEM_ANIM_MS,
        )}ms`;

  return (
    <>
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
        {/* Hidden probe — always mirrors the live title so width is measured
            before the visible slot catches up on item swaps. */}
        {itemViewActive && publicationsItemView && (
          <button
            ref={backButtonMeasureRef}
            type="button"
            aria-hidden
            tabIndex={-1}
            style={{
              ...boxStyle({
                background: NAV_BOX_HOVER_BG,
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
            {publicationsItemView.itemTitle || ui.navAria.backToOverview}
          </button>
        )}
        {/* Logo — always links to `/`; on the homepage we intercept and
            smooth-scroll to the home section instead of reloading. */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("home");
          }}
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
          aria-label={ui.navAria.home}
          aria-current={logoActive ? "page" : undefined}
          style={{
            display: "inline-flex",
            height: BOX_HEIGHT,
            width: LOGO_WIDTH,
            background: logoBoxHighlighted ? NAV_BOX_HOVER_BG : navTheme.boxBg,
            lineHeight: 0,
            cursor: "pointer",
            transition: NAV_COLOR_TRANSITION,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Image
            src={displayThemeLogo}
            alt=""
            aria-hidden
            width={LOGO_WIDTH}
            height={BOX_HEIGHT}
            priority
            style={{
              position: "absolute",
              inset: 0,
              display: "block",
              width: "100%",
              height: "100%",
              opacity: logoMarkCoral ? 0 : 1,
              transition: `opacity ${NAV_COLOR_TRANSITION_MS}ms ease`,
            }}
          />
          <Image
            src="/comte-coral.svg"
            alt="Comte"
            width={LOGO_WIDTH}
            height={BOX_HEIGHT}
            priority
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              opacity: logoMarkCoral ? 1 : 0,
              transition: `opacity ${NAV_COLOR_TRANSITION_MS}ms ease`,
            }}
          />
        </a>

        {/* Hamburger / chevron toggle (stays fixed in place). z-index sits
            above the nav items so they truly tuck under it on close. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? ui.navAria.closeMenu : ui.navAria.openMenu}
          aria-expanded={open}
          aria-controls="comte-nav-items"
          style={{
            ...boxStyle({
              width: BOX_HEIGHT,
              padding: 0,
              ...navItemColorsForTheme(navTheme, false),
            }),
            position: "relative",
            zIndex: 30,
          }}
          onMouseEnter={(e) => {
            applyNavHoverColors(e.currentTarget);
          }}
          onMouseLeave={(e) => {
            applyNavItemColorsForTheme(e.currentTarget, navTheme, false);
          }}
        >
          <HamburgerIcon open={open} strokeColor={navTheme.navItemFg} />
        </button>

        {/* Nav items — card-deck collapse. Container max-width drives the
            layout space; per-item translateX with stagger and z-index drives
            the deck animation. */}
        <div
          id="comte-nav-items"
          style={{
            overflow: "hidden",
            maxWidth: effectiveNaturalWidth,
            transition: itemsMaxWidthTransition,
          }}
        >
          <div ref={navItemsRowRef} style={{ display: "flex", position: "relative" }}>
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
                    color: NAV_BOX_HOVER_BG,
                    outline: `1px solid ${NAV_BOX_HOVER_BG}`,
                    outlineOffset: "-1px",
                  }
                : navItemColorsForTheme(navTheme, isActive);
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
                          `${NAV_COLOR_TRANSITION}, outline-color 0.2s ease`,
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
                          e.currentTarget.style.color = NAV_BOX_HOVER_BG;
                          return;
                        }
                        applyNavItemColorsForTheme(e.currentTarget, navTheme, isActive);
                      }}
                    >
                      {ui.nav[item.sectionId as keyof typeof ui.nav] ?? item.label}
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
                  {isPublications && slotBackButton && (
                    <div
                      ref={backButtonSlotRef}
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
                        onClick={slotBackButton.onClick}
                        onMouseEnter={() => setBackHovered(true)}
                        onMouseLeave={() => setBackHovered(false)}
                        aria-label={
                          slotBackButton.itemTitle
                            ? `${ui.navAria.backToPublications} (${ui.navAria.currentlyViewing(slotBackButton.itemTitle)})`
                            : ui.navAria.backToPublications
                        }
                        style={{
                          ...boxStyle({
                            background: backHovered ? "#FF7B7B" : NAV_BOX_HOVER_BG,
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
                        {slotBackButton.itemTitle || ui.navAria.backToOverview}
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
      <LocaleToggle
        fixed
        variant="active"
        background={navTheme.navItemBg}
        color={navTheme.navItemFg}
      />
    </>
  );
}
