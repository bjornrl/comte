"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronUp, ChevronDown, ArrowDown } from "lucide-react";
import SectionShell, {
  CONTENT_TOP,
  PANEL_PADDING,
  PROJECT_CONTENT_TOP_BELOW_PANEL_TITLE,
  PROJECT_TILE_SECTION_TOP,
  SECTION_TITLE_SIZE,
} from "./SectionShell";
import {
  SectionBodyText,
  SECTION_BODY_MAX_WIDTH,
  SECTION_TEXT_COLUMN_MARGIN_LEFT,
  WHAT_WE_DO_BODY_MAX_WIDTH,
} from "./sectionBodyText";
import SectionPanelHeading from "./SectionPanelHeading";
import { urlFor } from "@/sanity/lib/image";
import type { CardItem } from "./SectionCardGrid";
import { useUi } from "../useUi";

function publicationHref(item: CardItem): string | null {
  return item.slug ? `/publications/${item.slug}` : null;
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop";

/** Match about-intro text block title and body colors. */
const ITEM_TITLE_COLOR = "#FF5252";
const ITEM_BODY_COLOR = "#1F3A32";

function sanityImageUrl(imageField: any, width = 800): string | null {
  if (!imageField?.asset) return null;
  return urlFor(imageField).width(width).auto("format").quality(80).url();
}

type Props = {
  backgroundColor: string;
  foregroundColor: string;
  heading?: string;
  body?: string;
  items: CardItem[];
  /** Notifies parent when item-view state changes. Sends the viewed item's
   *  title when in item view, or null when in overview. */
  onItemViewChange?: (itemTitle: string | null) => void;
  /** Lets the parent (BlobNav) trigger back-to-overview from the navbar. */
  registerBackHandler?: (handler: (() => void) | null) => void;
};

const TILE_GAP_PX = 4;
const MARQUEE_TILE_HEIGHT = "40vh";
const MARQUEE_ROTATED_TEXT_MAX = MARQUEE_TILE_HEIGHT;
const MARQUEE_TITLE_SIZE = "clamp(1.5rem, 3.5vw, 2.75rem)";
const MARQUEE_BODY_SIZE = "clamp(1.125rem, 2.5vw, 2rem)";
const MARQUEE_DURATION_S = 80;
const RIGHT_COL_WIDTH = "36%";
const RIGHT_COL_GRID_COLS = 2;
const VIEW_TRANSITION_S = 0.72;
const VIEW_QUICK_TRANSITION_S = 0.24;
const VIEW_EASE = "cubic-bezier(0.45, 0, 0.55, 1)";

const HOVER_OVERLAY_BG = "rgba(31, 58, 50, 0.88)";

type ColumnDirection = "up" | "down";

// ---------------------------------------------------------------------------
// Marquee tile (overview)
// ---------------------------------------------------------------------------

function MarqueeTile({
  item,
  onClick,
  onHover,
  onLeave,
}: {
  item: CardItem;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const ui = useUi();
  const [hovered, setHovered] = useState(false);
  const imageUrl = sanityImageUrl(item.image, 800) ?? PLACEHOLDER_IMAGE;
  const href = publicationHref(item);

  const sharedProps = {
    onMouseEnter: () => {
      setHovered(true);
      onHover();
    },
    onMouseLeave: () => {
      setHovered(false);
      onLeave();
    },
    "aria-label": item.title
      ? ui.publication.readMoreAbout(item.title)
      : ui.publication.readMoreAboutThis,
    className: "relative block w-full overflow-hidden bg-gray-100 text-left",
    style: {
      height: MARQUEE_TILE_HEIGHT,
      flexShrink: 0,
      cursor: "pointer",
      border: "none",
      padding: 0,
    } as const,
  };

  const Wrapper = href
    ? ({ children }: { children: React.ReactNode }) => (
        <Link href={href} {...sharedProps}>
          {children}
        </Link>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <button type="button" onClick={onClick} {...sharedProps}>
          {children}
        </button>
      );

  return (
    <Wrapper>
      <Image
        src={imageUrl}
        alt={item.image?.alt ?? item.title ?? ""}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 50vw, 18vw"
      />

      <div
        className="pointer-events-none absolute bottom-0 left-0 z-10 overflow-hidden transition-opacity duration-300 ease-out"
        style={{
          opacity: hovered ? 0 : 1,
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            transform: "rotate(-90deg)",
            transformOrigin: "left bottom",
            maxWidth: MARQUEE_ROTATED_TEXT_MAX,
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            hyphens: "none",
            WebkitHyphens: "none",
            wordBreak: "normal",
            overflowWrap: "normal",
          }}
        >
          {item.title && (
            <h3
              className="font-[family-name:var(--font-manrope)] font-bold leading-tight"
              style={{
                margin: 0,
                fontSize: MARQUEE_TITLE_SIZE,
                color: "rgba(255,255,255,0.98)",
              }}
            >
              {item.title}
            </h3>
          )}
          {item.description && (
            <p
              className="font-[family-name:var(--font-manrope)] font-light leading-snug whitespace-pre-line"
              style={{
                margin: 0,
                fontSize: MARQUEE_BODY_SIZE,
                color: "rgba(255,255,255,0.9)",
              }}
            >
              {item.description}
            </p>
          )}
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-300 ease-out"
        style={{ background: HOVER_OVERLAY_BG, opacity: hovered ? 1 : 0 }}
      >
        <span
          className="font-[family-name:var(--font-manrope)] text-base font-bold tracking-wide"
          style={{ color: "rgba(255,255,255,0.98)", textAlign: "center", padding: "0 12px" }}
        >
          {ui.publication.readMoreAndOrder}
        </span>
      </div>
    </Wrapper>
  );
}

// ---------------------------------------------------------------------------
// Marquee column (overview)
// ---------------------------------------------------------------------------

function MarqueeColumn({
  items,
  direction,
  paused,
  onTileHover,
  onTileLeave,
  onTileClick,
}: {
  items: CardItem[];
  direction: ColumnDirection;
  paused: boolean;
  onTileHover: () => void;
  onTileLeave: () => void;
  onTileClick: (item: CardItem) => void;
}) {
  if (items.length === 0) return <div />;
  const stack = [...items, ...items];
  const animationName =
    direction === "down" ? "pubMarqueeDown" : "pubMarqueeUp";

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: TILE_GAP_PX,
          animationName,
          animationDuration: `${MARQUEE_DURATION_S}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationPlayState: paused ? "paused" : "running",
          willChange: "transform",
        }}
      >
        {stack.map((item, i) => (
          <MarqueeTile
            key={`${item._id}-${i}`}
            item={item}
            onClick={() => onTileClick(item)}
            onHover={onTileHover}
            onLeave={onTileLeave}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Carousel column (item view) — image tiles with flanking up/down nav
// ---------------------------------------------------------------------------

const CAROUSEL_NAV_HOVER_BG = "#5A7482";
const CAROUSEL_NAV_ACTIVE_BG = "#2a2a2a";
const CAROUSEL_NAV_FG = "#F5F5E9";
/** Match ProjectCluster NAV_BOX_HEIGHT / flank pagination chrome. */
const CAROUSEL_NAV_HEIGHT_PX = 42;
const CAROUSEL_NAV_ICON_SIZE = 24;

function CarouselNavButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "up" | "down";
  disabled: boolean;
  onClick: () => void;
}) {
  const ui = useUi();
  const [hovered, setHovered] = useState(false);
  const Icon = direction === "up" ? ChevronUp : ChevronDown;
  const active = !disabled && hovered;
  const label = direction === "up" ? ui.publication.scrollUp : ui.publication.scrollDown;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={label}
      className="w-full flex-shrink-0"
      style={{
        flex: `0 0 ${CAROUSEL_NAV_HEIGHT_PX}px`,
        height: CAROUSEL_NAV_HEIGHT_PX,
        boxSizing: "border-box",
        border: `1px solid ${active ? CAROUSEL_NAV_ACTIVE_BG : CAROUSEL_NAV_HOVER_BG}`,
        borderRadius: 0,
        background: active ? CAROUSEL_NAV_ACTIVE_BG : CAROUSEL_NAV_HOVER_BG,
        color: CAROUSEL_NAV_FG,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        transition:
          "background 0.2s ease-out, color 0.2s ease-out, border-color 0.2s ease-out, opacity 0.2s ease-out",
      }}
    >
      <Icon size={CAROUSEL_NAV_ICON_SIZE} strokeWidth={2.25} aria-hidden />
    </button>
  );
}

function CarouselSlot({
  item,
  onClick,
  flexBasis,
}: {
  item: CardItem | undefined;
  onClick: () => void;
  flexBasis: string;
}) {
  const ui = useUi();
  const [hovered, setHovered] = useState(false);

  if (!item) return <div style={{ flex: `0 0 ${flexBasis}`, background: "transparent" }} />;

  const imageUrl = sanityImageUrl(item.image, 800) ?? PLACEHOLDER_IMAGE;
  const showHover = hovered;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-label={`${ui.publication.view} ${item.title ?? ui.publication.publicationSuffix.toLowerCase()}`}
      className="relative w-full overflow-hidden bg-gray-100 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F3A32]"
      style={{ flex: `0 0 ${flexBasis}`, cursor: "pointer", border: "none", padding: 0 }}
    >
      <Image
        src={imageUrl}
        alt={item.image?.alt ?? item.title ?? ""}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 30vw, 12vw"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 transition-opacity duration-300 ease-out"
        style={{
          opacity: showHover ? 0 : 1,
          backgroundImage:
            "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0))",
        }}
      />
      {item.title && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1 p-3 transition-opacity duration-300 ease-out"
          style={{ opacity: showHover ? 0 : 1 }}
        >
          <h3
            className="font-[family-name:var(--font-manrope)] text-sm font-bold leading-tight"
            style={{ color: "rgba(255,255,255,0.98)" }}
          >
            {item.title}
          </h3>
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-300 ease-out"
        style={{ background: HOVER_OVERLAY_BG, opacity: showHover ? 1 : 0 }}
      >
        <span
          className="font-[family-name:var(--font-manrope)] text-sm font-bold tracking-wide sm:text-base"
          style={{ color: "rgba(255,255,255,0.98)", textAlign: "center", padding: "0 12px" }}
        >
          {ui.publication.readMoreAndOrder}
        </span>
      </div>
    </button>
  );
}

function CarouselColumn({
  items,
  onItemClick,
}: {
  items: CardItem[];
  onItemClick: (item: CardItem) => void;
}) {
  const [topIndex, setTopIndex] = useState(0);
  const total = items.length;

  // Reset to top whenever the set of "other items" changes (the currently
  // viewed publication changed, so the exclusion list shifts).
  const firstId = items[0]?._id ?? null;
  useEffect(() => {
    setTopIndex(0);
  }, [total, firstId]);

  const visibleSlots = Math.min(3, Math.max(total, 1));
  const slotBasis = `calc((100% - ${(visibleSlots - 1) * TILE_GAP_PX}px) / ${visibleSlots})`;

  const visibleItems = Array.from({ length: visibleSlots }, (_, i) =>
    total > 0 ? items[(topIndex + i) % total] : undefined,
  );

  const canScroll = total > 0;

  return (
    <div className="flex h-full w-full min-h-0 flex-col" style={{ gap: TILE_GAP_PX }}>
      <CarouselNavButton
        direction="up"
        disabled={!canScroll}
        onClick={() =>
          setTopIndex((i) => (total > 0 ? (i - 1 + total) % total : 0))
        }
      />

      <div className="flex min-h-0 flex-1 flex-col" style={{ gap: TILE_GAP_PX }}>
        {visibleItems.map((item, i) => (
          <CarouselSlot
            key={`${topIndex}-${item?._id ?? i}`}
            item={item}
            onClick={() => item && onItemClick(item)}
            flexBasis={slotBasis}
          />
        ))}
      </div>

      <CarouselNavButton
        direction="down"
        disabled={!canScroll}
        onClick={() =>
          setTopIndex((i) => (total > 0 ? (i + 1) % total : 0))
        }
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Item view
// ---------------------------------------------------------------------------

function ItemView({
  item,
  otherItems,
  onItemClick,
}: {
  item: CardItem;
  otherItems: CardItem[];
  onItemClick: (item: CardItem) => void;
}) {
  const imageUrl = sanityImageUrl(item.image, 1600) ?? PLACEHOLDER_IMAGE;

  return (
    <div
      className="relative h-full w-full grid"
      style={{
        gridTemplateColumns: `1fr ${RIGHT_COL_WIDTH}`,
        gap: 0,
      }}
    >
      {/* Left: gallery + description. */}
      <div
        className="relative h-full min-h-0 w-full"
        style={{
          paddingTop: CONTENT_TOP,
          paddingRight: "2rem",
          paddingBottom: PANEL_PADDING,
          paddingLeft: PANEL_PADDING,
        }}
      >
        <div className="flex h-full min-h-0 w-full flex-col gap-6 lg:flex-row">
          {/* Gallery */}
          <div className="relative h-full w-full min-h-0 flex-1 overflow-hidden bg-gray-100">
            <Image
              src={imageUrl}
              alt={item.image?.alt ?? item.title ?? ""}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Description — typography matches about-intro text blocks. */}
          <div
            className="flex h-full min-h-0 w-full min-w-0 flex-shrink-0 flex-col lg:w-[40ch]"
            style={{ maxWidth: SECTION_BODY_MAX_WIDTH }}
          >
            {item.title && (
              <h2
                className="mb-3 font-[family-name:var(--font-manrope)] font-medium leading-tight"
                style={{ color: ITEM_TITLE_COLOR, fontSize: SECTION_TITLE_SIZE }}
              >
                {item.title}
              </h2>
            )}
            {item.description && (
              <div className="min-h-0 overflow-y-auto">
                <SectionBodyText text={item.description} color={ITEM_BODY_COLOR} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: aligned carousel. Padded top so its top edge matches the
          gallery/description, not the section's top edge. */}
      <div
        className="relative h-full w-full"
        style={{
          paddingTop: CONTENT_TOP,
          paddingBottom: PANEL_PADDING,
          paddingRight: "0",
          paddingLeft: "0",
        }}
      >
        <div
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${RIGHT_COL_GRID_COLS}, 1fr)`,
            gap: TILE_GAP_PX,
          }}
        >
          <div aria-hidden />
          <CarouselColumn items={otherItems} onItemClick={onItemClick} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------------

type ViewEntry =
  | { kind: "overview" }
  | { kind: "item"; itemId: string };

export default function SectionPublications({
  backgroundColor,
  foregroundColor,
  heading,
  body,
  items,
  onItemViewChange,
  registerBackHandler,
}: Props) {
  const ui = useUi();
  const [stack, setStack] = useState<ViewEntry[]>([{ kind: "overview" }]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  /** True while the auto-fade-to-overview (triggered by scrolling away) is
   *  in flight. Speeds up the translateY transition so the user sees a
   *  quick dissolve rather than the standard 0.72s slide. */
  const [quickReset, setQuickReset] = useState(false);
  /** True while the panel is sliding forward into item view (stack grew but
   *  activeIndex has not landed yet). Keeps the navbar in phase 1 during
   *  the first frames of the page transition. */
  const [navItemViewPending, setNavItemViewPending] = useState(false);
  const isAnimatingRef = useRef(false);
  /** Tracks the previous stack length so a "grow" auto-bumps activeIndex. */
  const prevStackLengthRef = useRef(1);
  /** A 1×1 view-frame marker — IntersectionObserver watches this to detect
   *  when the publications panel scrolls off the viewport (any direction).
   *  Used to snap the panel back to its overview without relying on
   *  snap-position timing from the horizontal scroller. */
  const viewFrameRef = useRef<HTMLDivElement>(null);

  const [hoveredColumn, setHoveredColumn] = useState<ColumnDirection | null>(null);

  const itemById = useMemo(() => {
    const map = new Map<string, CardItem>();
    for (const item of items) map.set(item._id, item);
    return map;
  }, [items]);

  const leftItems = useMemo(() => items.filter((_, i) => i % 2 === 0), [items]);
  const rightItems = useMemo(() => items.filter((_, i) => i % 2 === 1), [items]);

  const handleSelectItem = useCallback((item: CardItem) => {
    setStack((prev) => {
      const lastIdx = prev.length - 1;
      if (prev[lastIdx]?.kind === "item") {
        // Already in item view — swap content, no slide animation.
        const next = [...prev];
        next[lastIdx] = { kind: "item", itemId: item._id };
        return next;
      }
      // From overview: append item view. activeIndex bump happens in a
      // useEffect watching stack length so the updater stays pure.
      if (isAnimatingRef.current) return prev;
      return [...prev, { kind: "item", itemId: item._id }];
    });
  }, []);

  // When the stack grows (overview → item, or item → next-item-during-slide),
  // bump activeIndex on the next frame so the transform transition animates
  // from the previous translateY to the new one.
  useEffect(() => {
    const prevLen = prevStackLengthRef.current;
    prevStackLengthRef.current = stack.length;
    if (stack.length > prevLen) {
      isAnimatingRef.current = true;
      setNavItemViewPending(true);
      const raf = requestAnimationFrame(() => {
        setActiveIndex(stack.length - 1);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [stack.length]);

  const handleBackToOverview = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setNavItemViewPending(false);
    setActiveIndex(0);
  }, []);

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== "transform") return;
      isAnimatingRef.current = false;
      setQuickReset(false);
      if (activeIndex === 0) {
        setNavItemViewPending(false);
        setStack((prev) => (prev.length > 1 ? [{ kind: "overview" }] : prev));
        return;
      }
      setNavItemViewPending(false);
      // Forward-slide finished — collapse history so back-to-overview is
      // always one hop. Snap activeIndex (with transitions disabled) to
      // match the new shorter stack — visual content stays the same.
      setStack((prev) => {
        if (prev.length <= 2) return prev;
        return [{ kind: "overview" }, prev[activeIndex]];
      });
      if (activeIndex > 1) {
        setTransitionEnabled(false);
        setActiveIndex(1);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setTransitionEnabled(true));
        });
      }
    },
    [activeIndex],
  );

  const inItemView = stack[activeIndex]?.kind === "item";
  const navbarItemViewActive = inItemView || navItemViewPending;

  const viewSlideTransition = transitionEnabled
    ? `transform ${quickReset ? VIEW_QUICK_TRANSITION_S : VIEW_TRANSITION_S}s ${VIEW_EASE}`
    : "none";
  // Notify parent (HomePageClient → BlobNav) of state changes so it can
  // attach a "Back to overview" button to the nav row beside the
  // publications nav item. The button label uses the currently viewed
  // item's title; the click handler returns to the overview.
  const currentItemTitle = useMemo(() => {
    const entry = inItemView
      ? stack[activeIndex]
      : navItemViewPending
        ? stack[stack.length - 1]
        : null;
    if (entry?.kind !== "item") return "";
    return itemById.get(entry.itemId)?.title ?? "";
  }, [inItemView, navItemViewPending, stack, activeIndex, itemById]);

  useLayoutEffect(() => {
    // Announce item view as soon as a card is clicked (including while the
    // page is still sliding) so the navbar can enter phase 1 immediately.
    // Going back clears this right away so the title button retreats in
    // sync with the page scroll. useLayoutEffect keeps the title in sync
    // with item swaps before paint so BlobNav can remeasure width.
    onItemViewChange?.(
      navbarItemViewActive ? currentItemTitle || ui.navAria.backToOverview : null,
    );
  }, [navbarItemViewActive, currentItemTitle, onItemViewChange, ui.navAria.backToOverview]);

  useEffect(() => {
    if (!registerBackHandler) return;
    if (inItemView) {
      registerBackHandler(handleBackToOverview);
      return () => registerBackHandler(null);
    }
    registerBackHandler(null);
  }, [inItemView, handleBackToOverview, registerBackHandler]);

  // Snap back to overview the moment the publications panel scrolls past
  // halfway out of view. Uses IntersectionObserver against a 1×1 marker at
  // the center of the panel (left: 50%, top: 0). The marker leaves the
  // viewport once more than half of the panel has scrolled past either
  // edge — at which point the auto-fade kicks in, animating the slide
  // back to overview quickly so the user sees a smooth dissolve rather
  // than a pop.
  useEffect(() => {
    const el = viewFrameRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting && inItemView && !isAnimatingRef.current) {
            isAnimatingRef.current = true;
            setNavItemViewPending(false);
            setQuickReset(true);
            setActiveIndex(0);
          }
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inItemView]);

  return (
    <SectionShell
      id="publications"
      bgColor={backgroundColor}
      style={{ color: foregroundColor, padding: 0 }}
    >
      <style>{`
        @keyframes pubMarqueeUp {
          from { transform: translateY(0%); }
          to { transform: translateY(-50%); }
        }
        @keyframes pubMarqueeDown {
          from { transform: translateY(-50%); }
          to { transform: translateY(0%); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes pubMarqueeUp { from, to { transform: translateY(0%); } }
          @keyframes pubMarqueeDown { from, to { transform: translateY(-50%); } }
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden">
        {/* IntersectionObserver target — sits at the panel's horizontal
            center so the observer fires once the user has scrolled past
            half the panel's width, triggering the auto-fade-to-overview. */}
        <div
          ref={viewFrameRef}
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            width: 1,
            height: 1,
            pointerEvents: "none",
          }}
        />
        <div
          onTransitionEnd={handleTransitionEnd}
          style={{
            position: "absolute",
            inset: 0,
            height: `${stack.length * 100}%`,
            transform: `translateY(-${activeIndex * (100 / stack.length)}%)`,
            transition: transitionEnabled
              ? `transform ${quickReset ? VIEW_QUICK_TRANSITION_S : VIEW_TRANSITION_S}s ${VIEW_EASE}`
              : "none",
            willChange: "transform",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {stack.map((entry, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                width: "100%",
                height: `${100 / stack.length}%`,
                flexShrink: 0,
              }}
            >
              {entry.kind === "overview" ? (
                <OverviewPanel
                  heading={heading}
                  body={body}
                  backgroundColor={backgroundColor}
                  foregroundColor={foregroundColor}
                  leftItems={leftItems}
                  rightItems={rightItems}
                  hoveredColumn={hoveredColumn}
                  setHoveredColumn={setHoveredColumn}
                  onSelectItem={handleSelectItem}
                  onBrowse={() => {
                    const first = items[0];
                    if (first) handleSelectItem(first);
                  }}
                  hasBrowseTarget={items.length > 0}
                />
              ) : (
                (() => {
                  const item = itemById.get(entry.itemId);
                  if (!item) return null;
                  const others = items.filter((p) => p._id !== entry.itemId);
                  return (
                    <ItemView
                      item={item}
                      otherItems={others}
                      onItemClick={handleSelectItem}
                    />
                  );
                })()
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

// ---------------------------------------------------------------------------
// Overview panel
// ---------------------------------------------------------------------------

function OverviewPanel({
  heading,
  body,
  backgroundColor,
  foregroundColor,
  leftItems,
  rightItems,
  hoveredColumn,
  setHoveredColumn,
  onSelectItem,
  onBrowse,
  hasBrowseTarget,
}: {
  heading?: string;
  body?: string;
  backgroundColor: string;
  foregroundColor: string;
  leftItems: CardItem[];
  rightItems: CardItem[];
  hoveredColumn: ColumnDirection | null;
  setHoveredColumn: (c: ColumnDirection | null) => void;
  onSelectItem: (item: CardItem) => void;
  onBrowse: () => void;
  hasBrowseTarget: boolean;
}) {
  const ui = useUi();
  return (
    <div className="relative h-full w-full">
      <div
        className="relative z-10 h-full"
        style={{
          paddingRight: "2rem",
          paddingBottom: "2rem",
          paddingLeft: PANEL_PADDING,
        }}
      >
        <div
          className="relative min-w-0"
          style={{
            maxWidth: WHAT_WE_DO_BODY_MAX_WIDTH,
            marginLeft: SECTION_TEXT_COLUMN_MARGIN_LEFT,
          }}
        >
          {heading ? (
            <SectionPanelHeading
              snapId="publications"
              color={foregroundColor}
              style={{
                position: "absolute",
                top: PROJECT_TILE_SECTION_TOP,
                left: 0,
                zIndex: 10,
              }}
            >
              {heading}
            </SectionPanelHeading>
          ) : null}
          <div
            className="w-full min-w-0"
            style={{
              paddingTop: heading
                ? PROJECT_CONTENT_TOP_BELOW_PANEL_TITLE
                : PROJECT_TILE_SECTION_TOP,
            }}
          >
            {body ? <SectionBodyText text={body} color={foregroundColor} /> : null}
            <button
            type="button"
            onClick={onBrowse}
            disabled={!hasBrowseTarget}
            aria-label={ui.publication.browse}
            className="inline-flex min-h-11 items-center gap-2 font-[family-name:var(--font-manrope)] text-base font-medium transition-[background-color,color,transform] duration-150 ease-out hover:bg-[var(--section-cta-hover-bg)] hover:text-[var(--section-cta-hover-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[var(--section-cta-fg)]"
            style={{
              marginTop: body || heading ? "2.5rem" : 0,
              padding: "12px 24px",
              border: `1px solid ${foregroundColor}`,
              background: "transparent",
              color: foregroundColor,
              cursor: "pointer",
              ["--section-cta-fg" as string]: foregroundColor,
              ["--section-cta-hover-bg" as string]: foregroundColor,
              ["--section-cta-hover-fg" as string]: backgroundColor,
            }}
          >
            Browse
            <ArrowDown size={16} strokeWidth={2} aria-hidden />
          </button>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden lg:block"
        style={{ width: RIGHT_COL_WIDTH }}
      >
        <div
          className="pointer-events-auto grid h-full w-full"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gap: TILE_GAP_PX,
          }}
        >
          <MarqueeColumn
            items={leftItems}
            direction="down"
            paused={hoveredColumn === "down"}
            onTileHover={() => setHoveredColumn("down")}
            onTileLeave={() => setHoveredColumn(null)}
            onTileClick={onSelectItem}
          />
          <MarqueeColumn
            items={rightItems}
            direction="up"
            paused={hoveredColumn === "up"}
            onTileHover={() => setHoveredColumn("up")}
            onTileLeave={() => setHoveredColumn(null)}
            onTileClick={onSelectItem}
          />
        </div>
      </div>
    </div>
  );
}
