"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import SectionShell from "./SectionShell";
import TiltedHeading from "../TiltedHeading";
import { urlFor } from "@/sanity/lib/image";
import type { CardItem } from "./SectionCardGrid";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop";

/** Bisects the team / publications boundary — same pattern as motto + what-we-do. */
const SECTION_BORDER_LINES = ["Publication", "Publicati/ons"];
const SECTION_BORDER_TEXT = "#FFD2D2";

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

// Nav alignment constants — mirror BlobNav.tsx so the item view content lines
// up below the nav row.
const NAV_BOX_HEIGHT = 42;
const NAV_SIDE_MARGIN = "clamp(2rem, 5vw, 5rem)";
const NAV_TOP_MARGIN = "clamp(1rem, 2.5vw, 2.5rem)";
/** Top padding shared by the item view's left content and right carousel. */
const ITEM_CONTENT_TOP = `calc(${NAV_TOP_MARGIN} + ${NAV_BOX_HEIGHT}px + 2rem)`;

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
  const [hovered, setHovered] = useState(false);
  const imageUrl = sanityImageUrl(item.image, 800) ?? PLACEHOLDER_IMAGE;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => {
        setHovered(true);
        onHover();
      }}
      onMouseLeave={() => {
        setHovered(false);
        onLeave();
      }}
      aria-label={item.title ? `Read more about ${item.title}` : "Read more about this publication"}
      className="relative block w-full overflow-hidden bg-gray-100 text-left"
      style={{ height: MARQUEE_TILE_HEIGHT, flexShrink: 0, cursor: "pointer", border: "none", padding: 0 }}
    >
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
          Read more and order
        </span>
      </div>
    </button>
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
// Carousel column (item view) — 3 fixed slots: 2 image tiles + 1 chevron tile
// ---------------------------------------------------------------------------

function CarouselSlot({
  item,
  onClick,
  flexBasis,
}: {
  item: CardItem | undefined;
  onClick: () => void;
  flexBasis: string;
}) {
  if (!item) return <div style={{ flex: `0 0 ${flexBasis}`, background: "transparent" }} />;
  const imageUrl = sanityImageUrl(item.image, 800) ?? PLACEHOLDER_IMAGE;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View ${item.title ?? "publication"}`}
      className="relative w-full overflow-hidden bg-gray-100 text-left"
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
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0))",
        }}
      />
      {item.title && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1 p-3">
          <h3
            className="font-[family-name:var(--font-manrope)] text-sm font-bold leading-tight"
            style={{ color: "rgba(255,255,255,0.98)" }}
          >
            {item.title}
          </h3>
        </div>
      )}
    </button>
  );
}

function ChevronSlot({
  item,
  flexBasis,
  canUp,
  canDown,
  onUp,
  onDown,
}: {
  item: CardItem | undefined;
  flexBasis: string;
  canUp: boolean;
  canDown: boolean;
  onUp: () => void;
  onDown: () => void;
}) {
  const imageUrl = item
    ? sanityImageUrl(item.image, 800) ?? PLACEHOLDER_IMAGE
    : null;
  return (
    <div
      className="relative w-full overflow-hidden bg-gray-100"
      style={{ flex: `0 0 ${flexBasis}` }}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 30vw, 12vw"
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "rgba(31, 58, 50, 0.55)" }}
      />
      <button
        type="button"
        onClick={onUp}
        disabled={!canUp}
        aria-label="Scroll publications up"
        className="absolute inset-x-0 top-0 z-20 flex items-center justify-center"
        style={{
          height: "50%",
          background: "transparent",
          border: "none",
          cursor: canUp ? "pointer" : "default",
          opacity: canUp ? 1 : 0.35,
          color: "rgba(255,255,255,0.95)",
        }}
      >
        <ChevronUp size={36} strokeWidth={1.8} aria-hidden />
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={!canDown}
        aria-label="Scroll publications down"
        className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center"
        style={{
          height: "50%",
          background: "transparent",
          border: "none",
          cursor: canDown ? "pointer" : "default",
          opacity: canDown ? 1 : 0.35,
          color: "rgba(255,255,255,0.95)",
        }}
      >
        <ChevronDown size={36} strokeWidth={1.8} aria-hidden />
      </button>
    </div>
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

  const topItem = items[topIndex];
  const middleItem = items[topIndex + 1];
  const bottomItem = items[topIndex + 2];

  const canUp = topIndex > 0;
  // Scroll down so long as there's at least one more item after what's
  // currently in the bottom (chevron) slot.
  const canDown = topIndex + 2 < total - 1;

  return (
    <div className="flex h-full w-full flex-col" style={{ gap: TILE_GAP_PX }}>
      {visibleSlots >= 1 && (
        <CarouselSlot
          item={topItem}
          onClick={() => topItem && onItemClick(topItem)}
          flexBasis={slotBasis}
        />
      )}
      {visibleSlots >= 2 && (
        <CarouselSlot
          item={middleItem}
          onClick={() => middleItem && onItemClick(middleItem)}
          flexBasis={slotBasis}
        />
      )}
      {visibleSlots >= 3 && (
        <ChevronSlot
          item={bottomItem}
          flexBasis={slotBasis}
          canUp={canUp}
          canDown={canDown}
          onUp={() => setTopIndex((i) => Math.max(0, i - 1))}
          onDown={() => setTopIndex((i) => Math.min(total - 3, i + 1))}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Item view
// ---------------------------------------------------------------------------

function ItemView({
  item,
  otherItems,
  foregroundColor,
  onItemClick,
}: {
  item: CardItem;
  otherItems: CardItem[];
  foregroundColor: string;
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
          paddingTop: ITEM_CONTENT_TOP,
          paddingRight: "2rem",
          paddingBottom: "2rem",
          paddingLeft: NAV_SIDE_MARGIN,
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

          {/* Description */}
          <div
            className="flex h-full min-h-0 w-full flex-shrink-0 flex-col gap-4 lg:w-[40ch]"
            style={{ color: foregroundColor }}
          >
            {item.title && (
              <h2
                className="font-[family-name:var(--font-manrope)] font-bold leading-tight"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
              >
                {item.title}
              </h2>
            )}
            {item.description && (
              <p className="font-[family-name:var(--font-manrope)] text-base font-light leading-relaxed whitespace-pre-line overflow-y-auto min-h-0">
                {item.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right: aligned carousel. Padded top so its top edge matches the
          gallery/description, not the section's top edge. */}
      <div
        className="relative h-full w-full"
        style={{
          paddingTop: ITEM_CONTENT_TOP,
          paddingBottom: "2rem",
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

  useEffect(() => {
    // Announce item view as soon as a card is clicked (including while the
    // page is still sliding) so the navbar can enter phase 1 immediately.
    // Going back clears this right away so the title button retreats in
    // sync with the page scroll.
    onItemViewChange?.(
      navbarItemViewActive ? currentItemTitle || "back to overview" : null,
    );
  }, [navbarItemViewActive, currentItemTitle, onItemViewChange]);

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
      style={{ color: foregroundColor, padding: 0, overflow: "visible" }}
    >
      <TiltedHeading
        lines={SECTION_BORDER_LINES}
        color={SECTION_BORDER_TEXT}
        parallaxFactor={0.18}
      />

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
                  leftItems={leftItems}
                  rightItems={rightItems}
                  hoveredColumn={hoveredColumn}
                  setHoveredColumn={setHoveredColumn}
                  onSelectItem={handleSelectItem}
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
                      foregroundColor={foregroundColor}
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
  leftItems,
  rightItems,
  hoveredColumn,
  setHoveredColumn,
  onSelectItem,
}: {
  heading?: string;
  body?: string;
  leftItems: CardItem[];
  rightItems: CardItem[];
  hoveredColumn: ColumnDirection | null;
  setHoveredColumn: (c: ColumnDirection | null) => void;
  onSelectItem: (item: CardItem) => void;
}) {
  return (
    <div className="relative h-full w-full">
      <div
        className="relative z-10 flex h-full flex-col gap-6"
        style={{
          paddingTop: `calc(${NAV_TOP_MARGIN} + ${NAV_BOX_HEIGHT}px + 2rem)`,
          paddingRight: "2rem",
          paddingBottom: "2rem",
          paddingLeft: NAV_SIDE_MARGIN,
          maxWidth: "44ch",
        }}
      >
        {heading && (
          <h2
            className="font-[family-name:var(--font-manrope)] font-bold leading-tight"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
          >
            {heading}
          </h2>
        )}
        {body && (
          <p
            className="font-[family-name:var(--font-manrope)] font-bold whitespace-pre-line"
            style={{
              fontSize: "clamp(1.25rem, 1.8vw, 1.6rem)",
              lineHeight: 1.2,
            }}
          >
            {body}
          </p>
        )}
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
