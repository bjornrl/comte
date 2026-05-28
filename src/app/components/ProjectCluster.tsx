"use client";

import { useRef, useEffect, useState, useCallback, useMemo, useLayoutEffect, type CSSProperties, type RefObject } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { METHOD_LABELS, DOMAIN_COLORS, DOMAIN_LABELS } from "./projectNetworkData";
import type {
  Project as NetProject,
  Domain,
  Method,
} from "./projectNetworkData";
import { CONTENT_TOP, NAV_HEIGHT_TOTAL, PANEL_PADDING } from "./sections/SectionShell";

const VISIBLE_DOMAINS: Domain[] = [
  "education",
  "culture",
  "health",
  "climate",
  "digital",
  "integration",
  "urban",
  "policy",
];

type ViewMode = "node" | "tile";

/** Node constellation view — disabled; tile view only. */
const NODE_VIEW_ENABLED = false;

const BOTTOM_TAG_ROW_GAP = 4;
const BOTTOM_OFFSET = "clamp(16px, 3vh, 32px)";
/** Vertical gap below nav (and above tag bar) — matches tile-area top inset. */
const TILE_VERTICAL_MARGIN = "clamp(1rem, 2vw, 1.5rem)";
/** Extra breathing room between the card grid bottom and the tag menu. */
const TILE_GRID_TO_TAG_EXTRA = "clamp(2rem, 4vh, 3rem)";
/** Extra space below navbar before cards + category row (dots/pagination stay put). */
const TILE_CARDS_TOP_EXTRA = "clamp(2rem, 5vh, 3.5rem)";

// Tile view — embedded detail cards fill viewport-sized grid rows.
// Reclaim section panel padding; top inset matches TILE_VERTICAL_MARGIN below the nav.
const TILE_SECTION_TOP = `calc(${CONTENT_TOP} - ${PANEL_PADDING} + ${TILE_VERTICAL_MARGIN})`;
const TILE_HEADING_BLOCK = "clamp(1.65rem, 3.3vw, 2.75rem)";
const TILE_GRID_GAP_BELOW_HEADING = "8px";
const TILE_GRID_TOP = `calc(${TILE_SECTION_TOP} + ${TILE_CARDS_TOP_EXTRA})`;
const TILE_GRID_TOP_WITH_HEADING = `calc(${TILE_SECTION_TOP} + ${TILE_HEADING_BLOCK} + ${TILE_GRID_GAP_BELOW_HEADING} + ${TILE_CARDS_TOP_EXTRA})`;
const TILE_FILTER_TRANSITION_S = 0.38;
const TILE_FILTER_EASE = [0.25, 1, 0.5, 1] as const;
/** Tile grid row count — cards and nav column share full block height. */
const TILE_VISIBLE_ROWS = 4;
/** Horizontal inset for tile/node stage — matches nav and section content margins. */
const CLUSTER_STAGE_INSET = PANEL_PADDING;
const CLUSTER_PAD_X = 8;
const CLUSTER_PAD_Y = 8;

const FG_DARK = "#1F3A32";
const BG_CREAM = "#F5F5E9";
const TILE_GRID_GAP = 4;
const TILE_MIN_COL_WIDTH = 148;
const TILE_PAGINATION_COLOR = "#242423";
/** Embedded tile card surface — prev/next buttons match this. */
const TILE_CARD_BG = "#2a2a2a";
const TILE_PAGINATION_HOVER_BG = "#5A7482";
/** Fixed tile grid width — was ~9 cols at desktop; now 8 with hybrid page-1 layout. */
const TILE_GRID_COLUMNS = 8;
/** Projects visible per page in tile view. */
const TILE_GROUP_SIZE = 4;
/** Card area spans cols 1–7; col 8 reserved for nav/dots. */
const TILE_CARD_COL_START = 1;
const TILE_CARD_COL_SPAN = 7;
/** Match BlobNav BOX_HEIGHT — shared control height for category row. */
const NAV_BOX_HEIGHT = 42;
const TILE_CONTROL_FONT_SIZE = "1rem";
const TILE_CATEGORY_FONT_SIZE = "clamp(0.5625rem, 0.65vw, 0.6875rem)";
const TILE_PROGRESS_DOT_SIZE = 14;
/** Dots per row in the progress grid (left → right, then next row down). */
const TILE_PROGRESS_DOTS_PER_ROW = 4;
/** Stagger + duration when the highlighted dot set changes (page turn). */
const TILE_DOT_STAGGER_S = 0.14;
const TILE_DOT_FADE_S = 0.32;
const TILE_DOT_FADE_EASE_OUT: [number, number, number, number] = [0.55, 0, 1, 0.45];
const TILE_DOT_FADE_EASE_IN: [number, number, number, number] = [0.25, 1, 0.5, 1];

/** Same domain order as the bottom tag menu (left → right), then title A–Z. */
function sortProjectsForTileGrid(projects: NetProject[]): NetProject[] {
  return [...projects].sort((a, b) => {
    const ai = VISIBLE_DOMAINS.indexOf(a.domain);
    const bi = VISIBLE_DOMAINS.indexOf(b.domain);
    if (ai !== bi) return ai - bi;
    return a.name.localeCompare(b.name);
  });
}

type TileGridLayout = {
  columns: number;
  rows: number;
  tileHeightPx: number;
  paginationWidth: number;
  colWidth: number;
};

/** Match default tile row height at 16px root — approximate for layout helpers. */
function getTileHeightPx(rootFontSize = 16, stageHeight = 0): number {
  if (stageHeight > 0) {
    const clusterTopPx = rootFontSize * 5;
    const gapPx = rootFontSize * 1.25;
    const panelPadPx = rootFontSize * 2.5;
    const blockPx = stageHeight - clusterTopPx - gapPx - NAV_BOX_HEIGHT - panelPadPx;
    return Math.max(120, (blockPx - (TILE_VISIBLE_ROWS - 1) * TILE_GRID_GAP) / TILE_VISIBLE_ROWS);
  }
  return 120;
}

/** Card grid height — fills viewport so tag bar bottom matches team section inset. */
function getTileGridBlockHeight(clusterStageTop: string, navToTileAreaGap: string): string {
  return `calc(100vh - ${clusterStageTop} - ${navToTileAreaGap} - ${NAV_BOX_HEIGHT}px - ${PANEL_PADDING})`;
}

function getTileRowHeight(clusterStageTop: string, navToTileAreaGap: string): string {
  const block = getTileGridBlockHeight(clusterStageTop, navToTileAreaGap);
  return `calc((${block} - ${(TILE_VISIBLE_ROWS - 1) * TILE_GRID_GAP}px) / ${TILE_VISIBLE_ROWS})`;
}

/** Inner width of the tile stage (between horizontal insets, minus column gaps). */
function getTileStageWidthExpr(): string {
  return `(100% - 2 * ${CLUSTER_STAGE_INSET} - ${(TILE_GRID_COLUMNS - 1) * TILE_GRID_GAP}px)`;
}

function getTileGridColumnWidthExpr(): string {
  return `${getTileStageWidthExpr()} / ${TILE_GRID_COLUMNS}`;
}

/** Width of the four-card row (grid cols 1–7). */
function getTileCardAreaWidth(): string {
  return `calc(${getTileGridColumnWidthExpr()} * ${TILE_CARD_COL_SPAN} + ${(TILE_CARD_COL_SPAN - 1) * TILE_GRID_GAP}px)`;
}

/** Section-level `right` offset — start of grid col 8 (after the card row). */
function getTileCardRowRightOffset(): string {
  return `calc(${CLUSTER_STAGE_INSET} + (${getTileStageWidthExpr()} + ${TILE_GRID_GAP}px) / ${TILE_GRID_COLUMNS})`;
}

/** Width of grid column 8 — right-side nav/dots strip. */
function getTileNavColumnWidth(): string {
  return `calc(${getTileGridColumnWidthExpr()})`;
}

function computeTileGridLayout(width: number, height = 0): TileGridLayout {
  const gap = TILE_GRID_GAP;
  const columns = TILE_GRID_COLUMNS;
  const tileHeightPx = getTileHeightPx(16, height);
  const rows = TILE_VISIBLE_ROWS;
  const colWidth = (width - (columns - 1) * gap) / columns;
  const paginationWidth = colWidth;
  return {
    columns,
    rows,
    tileHeightPx,
    paginationWidth,
    colWidth,
  };
}

function getFeaturedPageCount(projectCount: number): number {
  return Math.max(1, Math.ceil(projectCount / TILE_GROUP_SIZE));
}

function wrapPageIndex(index: number, pageCount: number): number {
  if (pageCount <= 0) return 0;
  return ((index % pageCount) + pageCount) % pageCount;
}

/** Shortest path on the wrapped page ring — used to stagger dots forward vs backward. */
function getPageTransitionReversed(
  fromPage: number,
  toPage: number,
  pageCount: number,
): boolean {
  if (pageCount <= 1 || fromPage === toPage) return false;
  const forwardSteps = (toPage - fromPage + pageCount) % pageCount;
  const backwardSteps = (fromPage - toPage + pageCount) % pageCount;
  return backwardSteps < forwardSteps;
}

function getFeaturedPageIndices(pageIndex: number, projectCount: number): number[] {
  if (projectCount === 0) return [];
  const start = pageIndex * TILE_GROUP_SIZE;
  return Array.from({ length: TILE_GROUP_SIZE }, (_, slot) => (start + slot) % projectCount);
}

function getFeaturedSlice(projects: NetProject[], pageIndex: number): NetProject[] {
  return getFeaturedPageIndices(pageIndex, projects.length).map((index) => projects[index]);
}

function getProjectGalleryUrls(project: NetProject): string[] {
  const g = project.galleryUrls?.filter(Boolean);
  if (g && g.length > 0) return g;
  if (project.heroImageUrl) return [project.heroImageUrl];
  return [];
}

type DotGridCell = { project: NetProject; index: number };

/** Lay out dots in rows of four, left → right then downward. Incomplete rows
 *  are padded on the left so dots sit flush to the right edge. */
function chunkDotsIntoRows(
  projects: NetProject[],
  dotsPerRow = TILE_PROGRESS_DOTS_PER_ROW,
): Array<Array<DotGridCell | null>> {
  if (projects.length === 0) return [];

  const rows: Array<Array<DotGridCell | null>> = [];
  for (let start = 0; start < projects.length; start += dotsPerRow) {
    const slice = projects.slice(start, start + dotsPerRow).map((project, offset) => ({
      project,
      index: start + offset,
    }));
    const padCount = dotsPerRow - slice.length;
    rows.push([...Array<null>(padCount).fill(null), ...slice]);
  }
  return rows;
}

function getDotGridRowCount(projectCount: number): number {
  if (projectCount <= 0) return 0;
  return Math.ceil(projectCount / TILE_PROGRESS_DOTS_PER_ROW);
}

function getDotGridHeightPx(rowCount: number): number {
  if (rowCount <= 0) return 0;
  return rowCount * TILE_PROGRESS_DOT_SIZE + (rowCount - 1) * TILE_GRID_GAP;
}

function getDotStaggerSlot(slot: number, reversed: boolean): number {
  return reversed ? TILE_GROUP_SIZE - 1 - slot : slot;
}

function getDotTransitionDelay(
  animateStagger: boolean,
  prevSlot: number,
  currSlot: number,
  reversed: boolean,
): number {
  if (!animateStagger) return 0;
  if (prevSlot >= 0) return getDotStaggerSlot(prevSlot, reversed) * TILE_DOT_STAGGER_S;
  if (currSlot >= 0) return getDotStaggerSlot(currSlot, reversed) * TILE_DOT_STAGGER_S;
  return 0;
}

function getDotTransitionDuration(): number {
  return TILE_DOT_STAGGER_S * (TILE_GROUP_SIZE - 1) + TILE_DOT_FADE_S;
}

function TileProgressDots({
  projects,
  pageIndex,
}: {
  projects: NetProject[];
  pageIndex: number;
}) {
  const [outgoingIndices, setOutgoingIndices] = useState<number[] | null>(null);
  const [transitionReversed, setTransitionReversed] = useState(false);
  const prevPageRef = useRef(pageIndex);
  const clearTransitionRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reduceMotion = useReducedMotion();

  const pageCount = getFeaturedPageCount(projects.length);
  const pageJustChanged =
    prevPageRef.current !== pageIndex && projects.length > 0;
  const activeReversed =
    pageJustChanged
      ? getPageTransitionReversed(prevPageRef.current, pageIndex, pageCount)
      : transitionReversed;
  const activeOutgoingIndices =
    outgoingIndices ??
    (pageJustChanged
      ? getFeaturedPageIndices(prevPageRef.current, projects.length)
      : null);
  const animateStagger = activeOutgoingIndices !== null;

  useLayoutEffect(() => {
    if (!pageJustChanged) return;

    const prevIndices = getFeaturedPageIndices(prevPageRef.current, projects.length);
    const reversed = getPageTransitionReversed(
      prevPageRef.current,
      pageIndex,
      pageCount,
    );
    setOutgoingIndices(prevIndices);
    setTransitionReversed(reversed);
    if (clearTransitionRef.current) clearTimeout(clearTransitionRef.current);
    const durationMs = reduceMotion ? 0 : getDotTransitionDuration() * 1000 + 50;
    clearTransitionRef.current = setTimeout(() => {
      setOutgoingIndices(null);
      setTransitionReversed(false);
    }, durationMs);
    prevPageRef.current = pageIndex;
  }, [pageIndex, projects.length, pageCount, pageJustChanged, reduceMotion]);

  useEffect(() => {
    setOutgoingIndices(null);
    setTransitionReversed(false);
    prevPageRef.current = pageIndex;
    if (clearTransitionRef.current) clearTimeout(clearTransitionRef.current);
  }, [projects]);

  useEffect(
    () => () => {
      if (clearTransitionRef.current) clearTimeout(clearTransitionRef.current);
    },
    [],
  );

  const currVisibleIndices = useMemo(
    () => getFeaturedPageIndices(pageIndex, projects.length),
    [pageIndex, projects.length],
  );

  const visibleIndices = useMemo(
    () => new Set(currVisibleIndices),
    [currVisibleIndices],
  );

  const visibleLabels = useMemo(
    () => currVisibleIndices.map((index) => index + 1),
    [currVisibleIndices],
  );

  const dotRows = useMemo(() => chunkDotsIntoRows(projects), [projects]);

  if (projects.length === 0) return null;

  return (
    <div
      role="group"
      aria-label={`Projects ${visibleLabels.join(", ")} of ${projects.length}`}
      style={{
        width: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        justifyContent: "flex-start",
        gap: TILE_GRID_GAP,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {dotRows.map((row, rowIndex) => (
        <div
          key={`dot-row-${rowIndex}`}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: TILE_GRID_GAP,
          }}
        >
          {row.map((cell, cellIndex) => {
            if (!cell) {
              return (
                <span
                  key={`pad-${rowIndex}-${cellIndex}`}
                  aria-hidden
                  style={{
                    width: TILE_PROGRESS_DOT_SIZE,
                    height: TILE_PROGRESS_DOT_SIZE,
                    flexShrink: 0,
                  }}
                />
              );
            }
            const { project, index } = cell;
            const isVisible = visibleIndices.has(index);
            const prevSlot = activeOutgoingIndices?.indexOf(index) ?? -1;
            const currSlot = currVisibleIndices.indexOf(index);
            const delay = getDotTransitionDelay(
              animateStagger,
              prevSlot,
              currSlot,
              activeReversed,
            );
            const fadingOut = animateStagger && prevSlot >= 0 && currSlot < 0;
            const accent = DOMAIN_COLORS[project.domain];
            return (
              <span
                key={project.id}
                title={project.name}
                style={{
                  position: "relative",
                  width: TILE_PROGRESS_DOT_SIZE,
                  height: TILE_PROGRESS_DOT_SIZE,
                  flexShrink: 0,
                  borderRadius: "50%",
                  border: `1px solid ${accent}`,
                  boxSizing: "border-box",
                }}
              >
                <motion.span
                  aria-hidden
                  initial={false}
                  animate={{ opacity: isVisible ? 1 : 0 }}
                  transition={{
                    duration: reduceMotion ? 0.01 : TILE_DOT_FADE_S,
                    delay: reduceMotion ? 0 : delay,
                    ease: fadingOut ? TILE_DOT_FADE_EASE_OUT : TILE_DOT_FADE_EASE_IN,
                  }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    backgroundColor: accent,
                  }}
                />
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function RotatedPaginationSlot({
  slotHeightPx,
  children,
}: {
  slotHeightPx: number;
  children: React.ReactNode;
}) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [slotWidth, setSlotWidth] = useState(0);

  useLayoutEffect(() => {
    const el = slotRef.current;
    if (!el) return;
    const measure = () => setSlotWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (slotHeightPx <= 0 || slotWidth <= 0) {
    return (
      <div
        ref={slotRef}
        style={{
          width: "100%",
          height: slotHeightPx > 0 ? slotHeightPx : undefined,
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      ref={slotRef}
      style={{
        width: "100%",
        height: slotHeightPx,
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: slotHeightPx,
          height: slotWidth,
          transform: "translate(-50%, -50%) rotate(90deg)",
        }}
      >
        <div style={{ width: "100%", height: "100%" }}>{children}</div>
      </div>
    </div>
  );
}

function TileDotGridMeasure({
  measureRef,
}: {
  measureRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={measureRef}
      aria-hidden
      data-tile-dot-grid-measure
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        display: "flex",
        flexDirection: "row",
        gap: TILE_GRID_GAP,
        visibility: "hidden",
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: TILE_PROGRESS_DOTS_PER_ROW }, (_, index) => (
        <span
          key={index}
          style={{
            width: TILE_PROGRESS_DOT_SIZE,
            height: TILE_PROGRESS_DOT_SIZE,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

function TileProgressDotsColumn({
  projects,
  referenceProjectCount,
  pageIndex,
  height,
  top,
  showPagination,
  onPrev,
  onNext,
}: {
  projects: NetProject[];
  /** Unfiltered project count — locks dot area + button height when filters shrink the grid. */
  referenceProjectCount: number;
  pageIndex: number;
  height: string;
  top: string;
  showPagination: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const columnRef = useRef<HTMLDivElement>(null);
  const gridMeasureRef = useRef<HTMLDivElement>(null);
  const [dotGridWidth, setDotGridWidth] = useState(0);
  const [buttonSlotHeightPx, setButtonSlotHeightPx] = useState(0);
  const referenceDotsHeightPx = getDotGridHeightPx(
    getDotGridRowCount(referenceProjectCount),
  );

  useLayoutEffect(() => {
    const measureGridWidth = () => {
      const el = gridMeasureRef.current;
      if (!el) return;
      setDotGridWidth(el.getBoundingClientRect().width);
    };

    measureGridWidth();
    const gridObserver = new ResizeObserver(measureGridWidth);
    const gridEl = gridMeasureRef.current;
    if (gridEl) gridObserver.observe(gridEl);
    window.addEventListener("resize", measureGridWidth);
    return () => {
      gridObserver.disconnect();
      window.removeEventListener("resize", measureGridWidth);
    };
  }, []);

  useLayoutEffect(() => {
    if (!showPagination) {
      setButtonSlotHeightPx(0);
      return;
    }

    const measureButtonHeights = () => {
      const column = columnRef.current;
      if (!column || referenceDotsHeightPx <= 0) return;

      const paginationArea =
        column.clientHeight - referenceDotsHeightPx - TILE_GRID_GAP;
      const slotHeight = (paginationArea - TILE_GRID_GAP) / 2;
      if (slotHeight > 0) {
        setButtonSlotHeightPx(slotHeight);
      }
    };

    measureButtonHeights();
    const columnObserver = new ResizeObserver(measureButtonHeights);
    const columnEl = columnRef.current;
    if (columnEl) columnObserver.observe(columnEl);
    window.addEventListener("resize", measureButtonHeights);
    return () => {
      columnObserver.disconnect();
      window.removeEventListener("resize", measureButtonHeights);
    };
  }, [showPagination, referenceDotsHeightPx]);

  if (projects.length === 0) return null;

  return (
    <div
      ref={columnRef}
      className="select-none"
      style={{
        position: "absolute",
        top,
        right: CLUSTER_STAGE_INSET,
        zIndex: 20,
        width: getTileNavColumnWidth(),
        height,
        minHeight: 0,
        pointerEvents: "auto",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateRows: showPagination ? "auto 1fr" : "1fr",
        gap: showPagination ? TILE_GRID_GAP : 0,
      }}
    >
      <div
        style={{
          position: "relative",
          minHeight:
            showPagination && referenceDotsHeightPx > 0
              ? referenceDotsHeightPx
              : 0,
          width: "100%",
          overflow: "hidden",
        }}
      >
        <TileDotGridMeasure measureRef={gridMeasureRef} />
        <TileProgressDots projects={projects} pageIndex={pageIndex} />
      </div>
      {showPagination ? (
        <div
          data-tile-pagination
          style={{
            minHeight: 0,
            height: "100%",
            width: dotGridWidth > 0 ? dotGridWidth : undefined,
            justifySelf: "end",
            display: "flex",
            flexDirection: "column",
            gap: TILE_GRID_GAP,
          }}
        >
          <RotatedPaginationSlot slotHeightPx={buttonSlotHeightPx}>
            <TilePaginationButton mode="previous" navColumn onClick={onPrev} />
          </RotatedPaginationSlot>
          <RotatedPaginationSlot slotHeightPx={buttonSlotHeightPx}>
            <TilePaginationButton mode="next" navColumn onClick={onNext} />
          </RotatedPaginationSlot>
        </div>
      ) : null}
    </div>
  );
}

type TilePaginationMode = "next" | "previous";

function TilePaginationButton({
  mode,
  width,
  height,
  onClick,
  inline = false,
  compact = false,
  tall = false,
  navSlot = false,
  navBar = false,
  navColumn = false,
  disabled = false,
  style,
}: {
  mode: TilePaginationMode;
  width?: number | string;
  height?: number | string;
  onClick: () => void;
  inline?: boolean;
  compact?: boolean;
  tall?: boolean;
  navSlot?: boolean;
  navBar?: boolean;
  navColumn?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  const navChrome = navBar || navColumn;
  const label =
    mode === "next"
      ? compact || tall || navSlot || navChrome
        ? "Next"
        : "Next page"
      : compact || tall || navSlot || navChrome
        ? "Prev"
        : "Previous page";
  const Icon = mode === "next" ? ArrowRight : ArrowLeft;
  const active = !disabled && hovered;
  const filled = navChrome || active;
  const foreground = filled ? BG_CREAM : TILE_PAGINATION_COLOR;
  const background = navChrome
    ? active
      ? TILE_CARD_BG
      : TILE_PAGINATION_HOVER_BG
    : active
      ? TILE_PAGINATION_COLOR
      : "transparent";
  const borderColor = navChrome
    ? active
      ? TILE_CARD_BG
      : TILE_PAGINATION_HOVER_BG
    : TILE_PAGINATION_COLOR;
  const iconSize = navChrome ? 16 : navSlot ? 16 : tall ? 22 : compact ? 14 : 18;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={mode === "next" ? "Next page" : "Previous page"}
      style={{
        position: inline || tall || navSlot || navChrome ? "relative" : "absolute",
        ...(inline || tall || navSlot || navChrome ? {} : { bottom: 0, right: 0 }),
        flex: inline && compact ? 1 : navBar ? "1 1 0" : undefined,
        width: navColumn ? "100%" : navBar ? "100%" : navSlot ? undefined : tall ? "100%" : width,
        height: navColumn ? "100%" : navBar ? NAV_BOX_HEIGHT : navSlot ? undefined : tall ? "100%" : height,
        boxSizing: "border-box",
        border: `1px solid ${borderColor}`,
        borderRadius: 0,
        background,
        color: foreground,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1,
        display: "flex",
        flexDirection: navChrome || (!tall && !navSlot) ? "row" : "column",
        alignItems: "center",
        justifyContent: "center",
        gap: navChrome ? 8 : navSlot ? 6 : tall ? 12 : compact ? 4 : 8,
        padding: navChrome ? "0 12px" : navSlot ? "8px 4px" : tall ? "16px 8px" : compact ? "0 4px" : "0 12px",
        fontFamily: "var(--font-work-sans), system-ui, sans-serif",
        fontSize: navChrome ? TILE_CONTROL_FONT_SIZE : navSlot ? "0.7rem" : tall ? "1rem" : compact ? "0.75rem" : "1rem",
        fontWeight: 400,
        letterSpacing: "0.01em",
        lineHeight: 1,
        whiteSpace: "nowrap",
        zIndex: 6,
        minHeight: navBar ? NAV_BOX_HEIGHT : 0,
        minWidth: navChrome || navSlot ? 0 : undefined,
        transition: "background 0.2s ease-out, color 0.2s ease-out, border-color 0.2s ease-out, opacity 0.2s ease-out",
        ...style,
      }}
    >
      {navChrome ? (
        mode === "previous" ? (
          <>
            <Icon size={iconSize} strokeWidth={2} aria-hidden />
            <span>{label}</span>
          </>
        ) : (
          <>
            <span>{label}</span>
            <Icon size={iconSize} strokeWidth={2} aria-hidden />
          </>
        )
      ) : tall || navSlot ? (
        <>
          <Icon size={iconSize} strokeWidth={2} aria-hidden />
          <span>{label}</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <Icon size={iconSize} strokeWidth={2} aria-hidden />
        </>
      )}
    </button>
  );
}

type TileProjectGridProps = {
  tileProjects: NetProject[];
  stageWidth: number;
  stageHeight: number;
  gridBlockHeight: string;
  tileRowHeight: string;
  activeProject: string | null;
  hoveredProject: string | null;
  onProjectClick: (id: string) => void;
  onTileHover: (id: string) => void;
  onGridLeave: () => void;
  pageIndex: number;
  onTilePageChange?: (page: number) => void;
};

function TileProjectGrid({
  tileProjects,
  stageWidth,
  stageHeight,
  gridBlockHeight,
  tileRowHeight,
  activeProject,
  hoveredProject,
  onProjectClick,
  onTileHover,
  onGridLeave,
  pageIndex,
  onTilePageChange,
}: TileProjectGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const onTileHoverRef = useRef(onTileHover);
  const onGridLeaveRef = useRef(onGridLeave);

  useEffect(() => {
    onTileHoverRef.current = onTileHover;
  }, [onTileHover]);
  useEffect(() => {
    onGridLeaveRef.current = onGridLeave;
  }, [onGridLeave]);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const tile = target?.closest("[data-project-tile]");
      if (tile instanceof HTMLElement && tile.dataset.projectId) {
        onTileHoverRef.current(tile.dataset.projectId);
      }
    };
    const onLeave = () => onGridLeaveRef.current();
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointercancel", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointercancel", onLeave);
    };
  }, []);

  useMemo(() => computeTileGridLayout(stageWidth, stageHeight), [stageWidth, stageHeight]);

  const pageCount = getFeaturedPageCount(tileProjects.length);
  const safePageIndex = wrapPageIndex(pageIndex, pageCount);
  const featured = getFeaturedSlice(tileProjects, safePageIndex);

  useEffect(() => {
    onTilePageChange?.(safePageIndex);
  }, [safePageIndex, onTilePageChange]);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 5 }}>
      <div
        style={{
          position: "relative",
          height: gridBlockHeight,
          maxHeight: gridBlockHeight,
        }}
      >
        <div
          style={{
            height: "100%",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div
            ref={gridRef}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${TILE_GRID_COLUMNS}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${TILE_VISIBLE_ROWS}, ${tileRowHeight})`,
              gap: TILE_GRID_GAP,
              alignContent: "start",
              height: "100%",
            }}
          >
            {/* Four equal cards — cols 1–7; col 8 reserved on the right. */}
            <div
              style={{
                gridColumn: `${TILE_CARD_COL_START} / span ${TILE_CARD_COL_SPAN}`,
                gridRow: `1 / span ${TILE_VISIBLE_ROWS}`,
                display: "grid",
                gridTemplateColumns: `repeat(${TILE_GROUP_SIZE}, minmax(0, 1fr))`,
                gap: TILE_GRID_GAP,
                minHeight: 0,
                height: "100%",
                overflow: "hidden",
              }}
            >
              {featured.map((project, slot) => (
                <motion.div
                  key={`expanded-${safePageIndex}-${slot}-${project.id}`}
                  layout={false}
                  style={{
                    minHeight: 0,
                    height: "100%",
                    overflow: "hidden",
                  }}
                >
                  <EmbeddedTileProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Brand colours used by the cluster chrome on the beige background.
// Stable seed for the random scatter so the dot layout doesn't reshuffle on
// every render (which would jitter the constellation as projects load in).
const SCATTER_SEED = "comte-projects-scatter";

// Fallback seed projects (used when Sanity has no projects yet).
type SeedProject = {
  id: string;
  name: string;
  client: string;
  domain: Domain;
  summary: string;
  featured: boolean;
  year: number;
};

const SEED_PROJECTS: SeedProject[] = [
  // Health
  { id: "h1", name: "Redesigning Elderly Care Pathways", client: "Trondheim Municipality", domain: "health", summary: "Rethinking how elderly care is coordinated across home services, GPs, and hospitals.", featured: true, year: 2023 },
  { id: "h2", name: "Digital Health Literacy", client: "Helsedirektoratet", domain: "health", summary: "Improving how patients understand and navigate digital health services.", featured: false, year: 2022 },
  { id: "h3", name: "Mental Health in Schools", client: "Bergen Kommune", domain: "health", summary: "Co-designing early intervention tools for student mental health support.", featured: false, year: 2024 },
  // Education
  { id: "e1", name: "Student Housing Against Loneliness", client: "SiT Trondheim", domain: "education", summary: "Designing common areas in student housing to reduce loneliness and build community.", featured: true, year: 2023 },
  { id: "e2", name: "Vocational Training Futures", client: "Utdanningsdirektoratet", domain: "education", summary: "Reimagining vocational training pathways for a changing job market.", featured: false, year: 2024 },
  // Integration
  { id: "i1", name: "Humanizing the Asylum Process for Children", client: "UDI / UNE / PU", domain: "integration", summary: "Creating child-friendly services across Norway's immigration authorities.", featured: true, year: 2022 },
  { id: "i2", name: "Language Learning Pathways", client: "IMDi", domain: "integration", summary: "Designing personalized language learning journeys for newly arrived refugees.", featured: false, year: 2023 },
  // Urban
  { id: "u1", name: "Neighbourhood Identity Mapping", client: "Oslo Kommune", domain: "urban", summary: "Co-creating neighbourhood identities with residents to guide urban planning.", featured: false, year: 2024 },
  { id: "u2", name: "Car-Free City Centre", client: "Trondheim Kommune", domain: "urban", summary: "Designing the transition to a pedestrian-first city centre experience.", featured: false, year: 2023 },
  // Climate
  { id: "c1", name: "Circular Economy Service Design", client: "Miljødirektoratet", domain: "climate", summary: "Designing public-facing services that make circular economy participation intuitive.", featured: false, year: 2024 },
  { id: "c2", name: "Green Building Behaviour", client: "Enova", domain: "climate", summary: "Nudging residents toward energy-efficient behaviours in new housing developments.", featured: false, year: 2023 },
  // Digital
  { id: "d1", name: "Supporting Vulnerable Young Men", client: "NAV / Trondheim Municipality", domain: "digital", summary: "A new cross-institutional service helping young men in the transition to adulthood.", featured: true, year: 2023 },
  { id: "d2", name: "Digital Inclusion for Seniors", client: "Digitaliseringsdirektoratet", domain: "digital", summary: "Ensuring elderly citizens can access critical public services online.", featured: false, year: 2022 },
];

function seedToNetProject(p: SeedProject): NetProject {
  return {
    id: p.id,
    name: p.name,
    client: p.client,
    domain: p.domain,
    summary: p.summary,
    featured: p.featured,
    year: p.year,
    scale: "municipal",
    methods: [] as Method[],
    innovationLevel: "incremental",
  };
}

const FALLBACK_NET_PROJECTS: NetProject[] = SEED_PROJECTS.map(seedToNetProject);

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  };
}

const DEFAULT_BG = BG_CREAM;

type ProjectClusterProps = {
  projects?: NetProject[];
  backgroundColor?: string;
  heading?: string;
};

export default function ProjectCluster({ projects, backgroundColor, heading }: ProjectClusterProps) {
  // Only include projects whose domain is visible in this view.
  const incoming = projects?.length ? projects : FALLBACK_NET_PROJECTS;
  const activeProjects = useMemo(
    () => incoming.filter((p) => VISIBLE_DOMAINS.includes(p.domain)),
    [incoming],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const clusterStageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Domain | null>(null);
  const [hoveredFilter, setHoveredFilter] = useState<Domain | null>(null);
  const viewMode: ViewMode = NODE_VIEW_ENABLED ? "node" : "tile";
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [photoIdx, setPhotoIdx] = useState(0);
  const [tilePageIndex, setTilePageIndex] = useState(0);

  const tileProjects = useMemo(() => {
    const pool = activeFilter
      ? activeProjects.filter((p) => p.domain === activeFilter)
      : activeProjects;
    return sortProjectsForTileGrid(pool);
  }, [activeProjects, activeFilter]);

  const tilePageCount = getFeaturedPageCount(tileProjects.length);
  const safeTilePageIndex = wrapPageIndex(tilePageIndex, tilePageCount);
  const showTileNavButtons = tilePageCount > 1;

  useEffect(() => {
    setTilePageIndex(0);
  }, [tileProjects]);

  // Refs used by the rAF loop that drives the per-dot drift and cursor-snap
  // motion. Keeping these out of React state means the animation never
  // triggers a re-render — we mutate DOM `transform`s and line endpoint
  // attributes directly each frame.
  const dotWrappersRef = useRef<Map<string, HTMLElement>>(new Map());
  const lineRefsRef = useRef<Map<string, SVGLineElement | null>>(new Map());
  const offsetsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  // Mouse position mirrored into a ref so the rAF closure doesn't have to
  // depend on the mousePos state (which would restart the effect on every
  // pointer move). Start far off-screen so a stationary cursor at (0,0)
  // doesn't snap a dot in the top-left corner.
  const mousePosRef = useRef({ x: -10000, y: -10000 });
  // Last hovered project id that we pushed into state — lets the rAF loop
  // avoid calling setHoveredProject every frame, only on actual transitions.
  const lastHoverIdRef = useRef<string | null>(null);

  useEffect(() => {
    lastHoverIdRef.current = null;
    setHoveredProject(null);
  }, [activeFilter]);

  // Measure the inset tile/node stage (page margins on left and right).
  useEffect(() => {
    const el = clusterStageRef.current;
    if (!el) return;
    const measure = () => setStageSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute dot positions — random scatter with minimum-distance spacing
  // (Poisson-disk-style rejection sampling). Seeded so the layout is stable
  // across renders. Each project gets up to MAX_ATTEMPTS tries to land at
  // least `minDist` pixels from every already-placed dot; if no candidate
  // clears the bar within the budget, the dot is placed at the last
  // candidate (so we never infinite-loop on dense layouts).
  const dotPositions = useMemo(() => {
    if (stageSize.w === 0) return new Map<string, { x: number; y: number }>();
    const padX = CLUSTER_PAD_X;
    const padTop = CLUSTER_PAD_Y;
    const padBottom = CLUSTER_PAD_Y;
    const usableW = Math.max(0, stageSize.w - padX * 2);
    const usableH = Math.max(0, stageSize.h - padTop - padBottom);
    if (usableW === 0 || usableH === 0)
      return new Map<string, { x: number; y: number }>();

    // Min distance scales with the per-dot area so density stays similar on
    // small and large viewports. 0.65× the ideal grid spacing gives some
    // organic clumping without overlap (dots are 10–20 px).
    const minDist =
      Math.sqrt((usableW * usableH) / Math.max(1, activeProjects.length)) * 0.65;
    const MAX_ATTEMPTS = 200;

    const rng = seededRandom(SCATTER_SEED);
    const positions = new Map<string, { x: number; y: number }>();
    const placed: { x: number; y: number }[] = [];

    for (const project of activeProjects) {
      let chosen: { x: number; y: number } | null = null;
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const candidate = {
          x: padX + rng() * usableW,
          y: padTop + rng() * usableH,
        };
        let conflict = false;
        for (const p of placed) {
          if (Math.hypot(p.x - candidate.x, p.y - candidate.y) < minDist) {
            conflict = true;
            break;
          }
        }
        if (!conflict) {
          chosen = candidate;
          break;
        }
        // Keep the last candidate as a fallback so we never end up with null.
        chosen = candidate;
      }
      if (chosen) {
        positions.set(project.id, chosen);
        placed.push(chosen);
      }
    }
    return positions;
  }, [stageSize, activeProjects]);

  // Constellation lines — every node ends up with at most MAX_DEGREE edges.
  // For each project we shuffle its NEAREST_POOL closest neighbours and walk
  // them in random order, accepting an edge only if neither endpoint has
  // already hit the degree cap. The result is a sparse web (≈ N edges for
  // N nodes) where the picks favour the local neighbourhood but the random
  // walk introduces enough variation that lines aren't strictly to the very
  // nearest neighbour. Endpoint IDs are kept so the filter / animation
  // logic can address each line by its endpoints.
  const lines = useMemo(() => {
    if (dotPositions.size === 0) return [];
    const rng = seededRandom("comte-projects-connections");
    const NEAREST_POOL = 7;
    const MAX_DEGREE = 2;
    const result: {
      fromId: string;
      toId: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }[] = [];
    const connected = new Set<string>();
    const degree = new Map<string, number>();
    const getDeg = (id: string) => degree.get(id) ?? 0;

    for (const project of activeProjects) {
      if (getDeg(project.id) >= MAX_DEGREE) continue;
      const pos = dotPositions.get(project.id);
      if (!pos) continue;
      const ranked = activeProjects
        .filter((p) => p.id !== project.id)
        .map((p) => {
          const nPos = dotPositions.get(p.id);
          if (!nPos) return null;
          return {
            id: p.id,
            dist: Math.hypot(nPos.x - pos.x, nPos.y - pos.y),
            pos: nPos,
          };
        })
        .filter((n): n is { id: string; dist: number; pos: { x: number; y: number } } => n !== null)
        .sort((a, b) => a.dist - b.dist);

      // Shuffled nearest pool (Fisher-Yates via the seeded RNG).
      const nearPool = ranked.slice(0, NEAREST_POOL).slice();
      for (let i = nearPool.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [nearPool[i], nearPool[j]] = [nearPool[j], nearPool[i]];
      }

      for (const n of nearPool) {
        if (getDeg(project.id) >= MAX_DEGREE) break;
        if (getDeg(n.id) >= MAX_DEGREE) continue;
        const key = [project.id, n.id].sort().join("-");
        if (connected.has(key)) continue;
        connected.add(key);
        degree.set(project.id, getDeg(project.id) + 1);
        degree.set(n.id, getDeg(n.id) + 1);
        result.push({
          fromId: project.id,
          toId: n.id,
          x1: pos.x,
          y1: pos.y,
          x2: n.pos.x,
          y2: n.pos.y,
        });
      }
    }
    return result;
  }, [dotPositions, activeProjects]);

  // Domain lookup for quick filter-match checks against line endpoints.
  const projectDomainById = useMemo(() => {
    const map = new Map<string, Domain>();
    for (const p of activeProjects) map.set(p.id, p.domain);
    return map;
  }, [activeProjects]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveProject(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Mirror mousePos state into a ref so the animation loop reads the latest
  // cursor coords without depending on the state (which would restart the
  // effect on every pointer move).
  useEffect(() => {
    mousePosRef.current = mousePos;
  }, [mousePos]);

  // rAF loop — every frame we compute a per-dot offset = ambient drift +
  // cursor snap, smoothed toward the previous frame's offset, and apply it
  // to the dot's wrapper as a translate3d. The constellation lines follow:
  // each line's x1/y1/x2/y2 is rewritten using the endpoints' offsets so
  // the web breathes with the dots. All updates go straight to the DOM —
  // no setState, no re-renders.
  useEffect(() => {
    if (!NODE_VIEW_ENABLED) return;
    const stage = clusterStageRef.current;
    if (!stage || dotPositions.size === 0) return;

    // Per-project drift phases/frequencies, seeded from the project ID so
    // the assignments are stable across mounts and every dot wobbles on
    // its own rhythm (no synchronised "marching" effect).
    const phases = new Map<
      string,
      { px: number; py: number; fx: number; fy: number }
    >();
    for (const project of activeProjects) {
      const rng = seededRandom(project.id + "-drift");
      phases.set(project.id, {
        px: rng() * Math.PI * 2,
        py: rng() * Math.PI * 2,
        fx: 0.07 + rng() * 0.06, // 0.07–0.13 Hz
        fy: 0.07 + rng() * 0.06,
      });
    }

    const DRIFT_AMP = 6;        // px — ambient wobble amplitude
    const SNAP_RADIUS = 110;    // px — cursor proximity that triggers snap
    const HOVER_RADIUS = 110;   // px — within this anchor-distance, dot is "hovered"
    // No position smoothing: the dot tracks the cursor instantly when
    // snapped. Drift is already a smooth sine wave, so it doesn't need
    // smoothing either. Engage/release transitions are softened by ramping
    // `snapFactor` over a few frames (see SNAP_RAMP below).
    const SNAP_RAMP = 0.35;     // per-frame ramp rate of snap engagement

    // Per-project ramped snap engagement (0 = pure drift, 1 = pure cursor
    // tracking). Smoothing the FACTOR over a few frames gives the visual
    // a soft engage/release while keeping cursor tracking instant when the
    // factor is at 1.
    const snapFactors = new Map<string, number>();

    let rafId: number | null = null;
    const t0 = performance.now();

    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      const rect = stage.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      const mx = mousePosRef.current.x - rect.left;
      const my = mousePosRef.current.y - rect.top;

      const padX = CLUSTER_PAD_X;
      const padTop = CLUSTER_PAD_Y;
      const padBottom = CLUSTER_PAD_Y;
      const HIT = 44; // px — must match dot button wrapper

      // Single pass: nearest anchor to cursor wins snap/hover for that frame.
      // With an active domain filter, only dots in that domain compete so
      // faded projects never steal snap/hover. Everyone else stays on drift only.
      let nearestId: string | null = null;
      let nearestDist = Infinity;
      for (const project of activeProjects) {
        if (activeFilter && project.domain !== activeFilter) continue;
        const anchor = dotPositions.get(project.id);
        if (!anchor) continue;
        const d = Math.hypot(mx - anchor.x, my - anchor.y);
        if (d < nearestDist) {
          nearestDist = d;
          nearestId = project.id;
        }
      }
      const inSnapRange = nearestId !== null && nearestDist < SNAP_RADIUS;
      const inHoverRange = nearestId !== null && nearestDist < HOVER_RADIUS;

      // Push hover state into React only on transitions — calling setState
      // every frame would re-render the whole cluster constantly. The ref
      // is the local source of truth; the state setter just notifies React.
      const newHoverId = inHoverRange ? nearestId : null;
      if (newHoverId !== lastHoverIdRef.current) {
        lastHoverIdRef.current = newHoverId;
        setHoveredProject(newHoverId);
      }

      for (const project of activeProjects) {
        const anchor = dotPositions.get(project.id);
        if (!anchor) continue;
        const ph = phases.get(project.id);
        if (!ph) continue;

        // Ramp this project's snap engagement. Target = 1 if this is the
        // nearest dot within range, else 0. The ramp gives a soft "grab"
        // when the cursor enters range and a soft "release" when it
        // leaves — without slowing the dot's tracking of the cursor once
        // engagement is at 1.
        const targetSnapFactor =
          inSnapRange && project.id === nearestId ? 1 : 0;
        const currentSF = snapFactors.get(project.id) ?? 0;
        const sf = currentSF + (targetSnapFactor - currentSF) * SNAP_RAMP;
        snapFactors.set(project.id, sf);

        // Raw snap = cursor relative to anchor → dot sits exactly under cursor.
        // The ramped factor `sf` scales both the snap pull and the drift
        // suppression, so engage/release is smooth but tracking is instant.
        const snapX = (mx - anchor.x) * sf;
        const snapY = (my - anchor.y) * sf;

        // Ambient drift around the anchor, faded out by the snap factor so
        // a snapped dot doesn't wobble.
        const driftMult = 1 - sf;
        const driftX =
          Math.sin(2 * Math.PI * ph.fx * t + ph.px) * DRIFT_AMP * driftMult;
        const driftY =
          Math.cos(2 * Math.PI * ph.fy * t + ph.py) * DRIFT_AMP * driftMult;

        let offX = driftX + snapX;
        let offY = driftY + snapY;

        // Clamp translation so the 44×44 hit target never slides into reserved
        // strips (especially the bottom tag bar) when the cursor leaves the field.
        const minOffX = padX - anchor.x + HIT / 2;
        const maxOffX = W - padX - anchor.x - HIT / 2;
        const minOffY = padTop - anchor.y + HIT / 2;
        const maxOffY = H - padBottom - anchor.y - HIT / 2;
        if (minOffX <= maxOffX) {
          offX = Math.max(minOffX, Math.min(maxOffX, offX));
        }
        if (minOffY <= maxOffY) {
          offY = Math.max(minOffY, Math.min(maxOffY, offY));
        }

        offsetsRef.current.set(project.id, { x: offX, y: offY });

        const wrapper = dotWrappersRef.current.get(project.id);
        if (wrapper) {
          wrapper.style.transform = `translate3d(${offX}px, ${offY}px, 0)`;
        }
      }

      // Make the connecting lines follow the dots by writing the offset
      // endpoints back to each <line>'s attributes.
      for (const d of lines) {
        const key = [d.fromId, d.toId].sort().join("-");
        const line = lineRefsRef.current.get(key);
        if (!line) continue;
        const ofFrom = offsetsRef.current.get(d.fromId) ?? { x: 0, y: 0 };
        const ofTo = offsetsRef.current.get(d.toId) ?? { x: 0, y: 0 };
        line.setAttribute("x1", String(d.x1 + ofFrom.x));
        line.setAttribute("y1", String(d.y1 + ofFrom.y));
        line.setAttribute("x2", String(d.x2 + ofTo.x));
        line.setAttribute("y2", String(d.y2 + ofTo.y));
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [dotPositions, activeProjects, lines, activeFilter, viewMode]);

  const handleDotClick = useCallback((projectId: string) => {
    setActiveProject((prev) => (prev === projectId ? null : projectId));
  }, []);
  const handleFilterClick = useCallback((domain: Domain) => {
    setHoveredProject(null);
    setActiveFilter((prev) => (prev === domain ? null : domain));
  }, []);

  const handleTileHover = useCallback((projectId: string) => {
    setHoveredProject(projectId);
  }, []);

  // Native pointer-event listener for the cursor. React's synthetic
  // `onMouseMove` was failing to fire during cursor hover on the user's
  // hardware (only working during click-and-hold). Native pointer events
  // sidestep that entirely and unify mouse + pen + touch.
  //
  // The ref is updated synchronously on every event (read every rAF frame
  // for snap + hover detection). The React state is rate-limited to one
  // update per animation frame so that 120–500 Hz mice don't trigger a
  // re-render flood, which would starve the rAF loop and cause the snap
  // to jitter instead of smoothly converging on the cursor. State is only
  // needed for the tooltip's position, so this throttle is invisible.
  useEffect(() => {
    if (!NODE_VIEW_ENABLED) return;
    const el = clusterStageRef.current;
    if (!el) return;
    let rafPending = false;
    const flushState = () => {
      rafPending = false;
      setMousePos({ ...mousePosRef.current });
    };
    const schedule = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(flushState);
    };
    const onMove = (e: PointerEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      schedule();
    };
    const onLeave = () => {
      // Park cursor far off-screen so the rAF loop's nearest-dot search
      // finds nothing in range — no dot stays stuck snapped/hovered.
      mousePosRef.current = { x: -10000, y: -10000 };
      schedule();
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointercancel", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointercancel", onLeave);
    };
  }, [viewMode]);

  const hoveredData = hoveredProject ? activeProjects.find((p) => p.id === hoveredProject) : null;
  const activeData = activeProject ? activeProjects.find((p) => p.id === activeProject) : null;

  useEffect(() => {
    setPhotoIdx(0);
  }, [activeProject]);

  const galleryUrls = useMemo(() => {
    if (!activeData) return [];
    return getProjectGalleryUrls(activeData);
  }, [activeData]);

  const showOverlayCard = Boolean(activeData);

  const isMobile = stageSize.w > 0 && stageSize.w < 768;
  const clusterStageTop = heading ? TILE_GRID_TOP_WITH_HEADING : TILE_GRID_TOP;
  const baseNavToTileGap = heading
    ? `calc(${TILE_VERTICAL_MARGIN} + ${TILE_HEADING_BLOCK} + ${TILE_GRID_GAP_BELOW_HEADING})`
    : TILE_VERTICAL_MARGIN;
  const cardToTagGap = `calc(${baseNavToTileGap} + ${TILE_GRID_TO_TAG_EXTRA})`;
  const tileGridBlockHeight = getTileGridBlockHeight(clusterStageTop, cardToTagGap);
  const tileRowHeight = getTileRowHeight(clusterStageTop, cardToTagGap);
  /** Top edge of the filter bar — sits below the card grid with cardToTagGap clearance. */
  const tagBarTop = `calc(${clusterStageTop} + ${tileGridBlockHeight} + ${cardToTagGap})`;

  return (
    <section
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: backgroundColor ?? DEFAULT_BG }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setActiveProject(null);
      }}
    >
      {/* Section header */}
      {heading && (
        <div
          style={{
            position: "absolute",
            top: TILE_SECTION_TOP,
            left: CLUSTER_STAGE_INSET,
            zIndex: 10,
            maxWidth: "20ch",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-manrope), system-ui, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
              color: FG_DARK,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {heading}
          </h2>
        </div>
      )}

      {/* Progress dots + prev/next — col 8, aligned with card grid. */}
      <TileProgressDotsColumn
        projects={tileProjects}
        referenceProjectCount={activeProjects.length}
        pageIndex={safeTilePageIndex}
        height={tileGridBlockHeight}
        top={clusterStageTop}
        showPagination={showTileNavButtons}
        onPrev={() => setTilePageIndex((p) => wrapPageIndex(p - 1, tilePageCount))}
        onNext={() => setTilePageIndex((p) => wrapPageIndex(p + 1, tilePageCount))}
      />

      {/* Bottom bar: 8 domain filters — one row, exact card-row width. */}
      <div
        className="select-none"
        style={{
          position: "absolute",
          top: tagBarTop,
          left: CLUSTER_STAGE_INSET,
          width: getTileCardAreaWidth(),
          height: NAV_BOX_HEIGHT,
          zIndex: 10,
          display: "grid",
          gridTemplateColumns: `repeat(${TILE_GRID_COLUMNS}, minmax(0, 1fr))`,
          gap: TILE_GRID_GAP,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
          {VISIBLE_DOMAINS.map((domain) => {
            const isActive = activeFilter === domain;
            const isHovered = hoveredFilter === domain;
            const tagBackground =
              isActive || isHovered ? DOMAIN_COLORS[domain] : "transparent";
            const tagColor = isActive || isHovered ? BG_CREAM : DOMAIN_COLORS[domain];
            return (
              <button
                key={domain}
                onClick={() => handleFilterClick(domain)}
                onMouseEnter={() => setHoveredFilter(domain)}
                onMouseLeave={() => setHoveredFilter(null)}
                aria-label={`Filter by ${DOMAIN_LABELS[domain]}`}
                aria-pressed={isActive}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  height: NAV_BOX_HEIGHT,
                  minHeight: NAV_BOX_HEIGHT,
                  padding: "0 8px",
                  border: `1px solid ${DOMAIN_COLORS[domain]}`,
                  borderRadius: 0,
                  fontFamily: "var(--font-work-sans), system-ui, sans-serif",
                  fontSize: TILE_CATEGORY_FONT_SIZE,
                  fontWeight: 400,
                  letterSpacing: "0.01em",
                  textTransform: "lowercase",
                  color: tagColor,
                  background: tagBackground,
                  cursor: "pointer",
                  transition: "background 0.2s ease-out, color 0.2s ease-out",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {DOMAIN_LABELS[domain]}
              </button>
            );
          })}
      </div>

      {/* Tile + node field — inset to page margins. */}
      <div
        ref={clusterStageRef}
        style={{
          position: "absolute",
          top: clusterStageTop,
          left: CLUSTER_STAGE_INSET,
          right: CLUSTER_STAGE_INSET,
          height: tileGridBlockHeight,
          overflow: "hidden",
        }}
      >
      {/* Tile grid — domain-coloured cards in tag-menu order (LTR, matches bottom bar). */}
      <TileProjectGrid
        tileProjects={tileProjects}
        stageWidth={stageSize.w}
        stageHeight={stageSize.h}
        gridBlockHeight={tileGridBlockHeight}
        tileRowHeight={tileRowHeight}
        activeProject={activeProject}
        hoveredProject={hoveredProject}
        onProjectClick={handleDotClick}
        onGridLeave={() => setHoveredProject(null)}
        onTileHover={handleTileHover}
        pageIndex={tilePageIndex}
      />

      {/* Constellation lines. Dark-green hairlines on beige; the per-line
          opacity reacts to hover / open card / active filter so the web
          recedes when something else demands attention. With endpoints'
          IDs stored, the filter logic dims lines whose endpoints don't
          touch the active filter. */}
      {NODE_VIEW_ENABLED && stageSize.w > 0 && (
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          aria-hidden="true"
        >
          {lines.map((line) => {
            const key = [line.fromId, line.toId].sort().join("-");
            // Quieter baseline: the lines should read as faint connective
            // tissue rather than competing with the dots themselves.
            let lineOpacity = 0.10;
            if (activeFilter) {
              const fromDomain = projectDomainById.get(line.fromId);
              const toDomain = projectDomainById.get(line.toId);
              const touches = fromDomain === activeFilter || toDomain === activeFilter;
              lineOpacity = touches ? 0.18 : 0.03;
            }
            if (activeProject) {
              const touches = line.fromId === activeProject || line.toId === activeProject;
              lineOpacity = touches ? 0.22 : 0.03;
            }
            if (hoveredProject) {
              const touches = line.fromId === hoveredProject || line.toId === hoveredProject;
              lineOpacity = touches ? 0.28 : 0.05;
            }
            return (
              <line
                key={key}
                ref={(el) => {
                  lineRefsRef.current.set(key, el);
                }}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={FG_DARK}
                strokeWidth={1}
                style={{ opacity: lineOpacity, transition: "opacity 0.3s ease-out" }}
              />
            );
          })}
        </svg>
      )}

      {/* Project dots. Each dot is ONE button — the 44×44 wrapper is the
          hit target AND the element the rAF loop translates each frame for
          drift + cursor snap. The visible dot is just a `<span>` styled as
          a coloured circle, centred inside the button with `pointer-events:
          none` so it never competes with the wrapper for events. This
          collapses the old two-button structure (visible + invisible-on-
          top) that was creating hit-test ambiguity. */}
      {NODE_VIEW_ENABLED && stageSize.w > 0 &&
        activeProjects.map((project) => {
          const pos = dotPositions.get(project.id);
          if (!pos) return null;
          const size = project.featured ? 20 : 10;
          const HIT = 44; // px — 44×44 hit area centred on the anchor
          const isHovered = hoveredProject === project.id;
          const isActive = activeProject === project.id;
          // Base full opacity; fade non-matches when a filter / open card /
          // hover demands focus elsewhere. The filter case fades by 80%
          // (opacity 0.2) so the in-filter dots clearly dominate.
          let dotOpacity = 1.0;
          if (activeFilter) dotOpacity = project.domain === activeFilter ? 1.0 : 0.2;
          if (activeProject) dotOpacity = isActive ? 1.0 : 0.3;
          if (hoveredProject && !activeProject) {
            dotOpacity = isHovered ? 1.0 : 0.4;
          }
          // Hover expands the dot noticeably; the active-filter highlight
          // stays a subtle nudge.
          const scale = isHovered ? 1.8 : activeFilter === project.domain ? 1.15 : 1;

          return (
            <button
              key={project.id}
              ref={(el) => {
                if (el) dotWrappersRef.current.set(project.id, el);
                else dotWrappersRef.current.delete(project.id);
              }}
              onClick={() => handleDotClick(project.id)}
              aria-label={`${project.name} — ${project.client}`}
              style={{
                position: "absolute",
                left: pos.x - HIT / 2,
                top: pos.y - HIT / 2,
                width: HIT,
                height: HIT,
                background: "transparent",
                border: "none",
                padding: 0,
                cursor:
                  activeFilter && project.domain !== activeFilter ? "default" : "pointer",
                outline: "none",
                willChange: "transform",
                // Sit below domain tags (z-10); clamped motion should keep overlap
                // rare, but this guarantees pills stay clickable first.
                zIndex: 5,
                pointerEvents:
                  activeFilter && project.domain !== activeFilter ? "none" : "auto",
              }}
            >
              {/* Visible coloured dot — purely visual; pointer-events: none
                  so the wrapper button is the only hit target. */}
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: HIT / 2 - size / 2,
                  top: HIT / 2 - size / 2,
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  background: DOMAIN_COLORS[project.domain],
                  display: "block",
                  pointerEvents: "none",
                  opacity: dotOpacity,
                  transform: `scale(${scale})`,
                  transformOrigin: "center",
                  transition:
                    "transform 0.18s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease-out",
                  willChange: "transform, opacity",
                }}
              />
              {project.featured && !isMobile && (
                <span
                  style={{
                    position: "absolute",
                    left: HIT / 2 + size / 2 + 8,
                    top: HIT / 2 - 6,
                    fontFamily: "var(--font-manrope), system-ui, sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "rgba(31,58,50,0.78)",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    opacity: dotOpacity,
                    transition: "opacity 0.3s ease-out",
                  }}
                >
                  {project.name}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hover tooltip */}
      {NODE_VIEW_ENABLED && hoveredData && !activeProject && !isMobile && (
        <div
          style={{
            position: "fixed",
            left: mousePos.x + 12,
            top: mousePos.y - 8,
            background: "#141414",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 0,
            padding: "8px 12px",
            pointerEvents: "none",
            zIndex: 20,
            maxWidth: 240,
          }}
        >
          <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#fff", fontFamily: "var(--font-manrope), system-ui, sans-serif" }}>
            {hoveredData.name}
          </p>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-manrope), system-ui, sans-serif" }}>
            {hoveredData.client}
          </p>
        </div>
      )}

      {/* Expanded detail card */}
      {showOverlayCard && activeData && (
        <ExpandedProjectCard
          project={activeData}
          galleryUrls={galleryUrls}
          photoIdx={photoIdx}
          setPhotoIdx={setPhotoIdx}
          onClose={() => setActiveProject(null)}
          isMobile={isMobile}
        />
      )}

      <style>{`
        @keyframes clusterCardIn {
          from { opacity: 0; transform: translate(-50%, -48%); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </section>
  );
}

// ---------------------------------------------------------------------------
// EmbeddedTileProjectCard
//
// Tile-grid project card (2×4). Detail layout only: cropped top image +
// full text, tags, and contact — no internal scroll or wheel states.
// ---------------------------------------------------------------------------

const EMBEDDED_DETAIL_IMAGE_FRACTION = 0.32;
const EMBEDDED_SUMMARY_LINE_CLAMP = 9;
const EMBEDDED_FONT = {
  title: "clamp(1.0625rem, 1.35vw, 1.25rem)",
  summary: "clamp(0.875rem, 1.1vw, 1rem)",
  meta: "clamp(0.8125rem, 1vw, 0.9375rem)",
  small: "clamp(0.75rem, 0.95vw, 0.875rem)",
  tag: "clamp(0.75rem, 0.95vw, 0.875rem)",
  contact: "clamp(0.8125rem, 1vw, 0.9375rem)",
} as const;

function EmbeddedTileProjectCard({ project }: { project: NetProject }) {
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    setPhotoIdx(0);
  }, [project.id]);

  const galleryUrls = useMemo(() => getProjectGalleryUrls(project), [project]);
  const accent = DOMAIN_COLORS[project.domain];
  const customers =
    project.customers && project.customers.length > 0
      ? project.customers
      : project.client
        ? [project.client]
        : [];
  const subCategories = project.subCategories ?? project.displayTags ?? [];
  const responsible = project.responsible;
  const methodLabels = (project.methods ?? [])
    .filter((m): m is Method => m in METHOD_LABELS)
    .map((m) => METHOD_LABELS[m]);
  const cardLinks = (project.cardLinks ?? []).filter((l) => l.url);
  const pad = "10px";

  const renderGallery = () => {
    if (galleryUrls.length === 0) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: `linear-gradient(145deg, ${accent}88, ${TILE_CARD_BG})`,
          }}
        />
      );
    }
    return (
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
        <Image
          key={galleryUrls[photoIdx]}
          src={galleryUrls[photoIdx]}
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition: "center top" }}
          sizes="320px"
        />
        {galleryUrls.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                setPhotoIdx((i) => (i - 1 + galleryUrls.length) % galleryUrls.length);
              }}
              style={{
                position: "absolute",
                left: 6,
                top: "50%",
                transform: "translateY(-50%)",
                width: 28,
                height: 28,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(0,0,0,0.45)",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                setPhotoIdx((i) => (i + 1) % galleryUrls.length);
              }}
              style={{
                position: "absolute",
                right: 6,
                top: "50%",
                transform: "translateY(-50%)",
                width: 28,
                height: 28,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(0,0,0,0.45)",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              <ChevronRight size={16} />
            </button>
          </>
        ) : null}
      </div>
    );
  };

  const renderTags = () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        marginTop: 6,
        alignItems: "center",
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: "3px 10px",
          fontSize: EMBEDDED_FONT.tag,
          fontFamily: "var(--font-manrope), system-ui, sans-serif",
          letterSpacing: "0.05em",
          color: BG_CREAM,
          background: "transparent",
          border: `1px solid ${accent}`,
        }}
      >
        {DOMAIN_LABELS[project.domain]}
      </span>
      {subCategories.map((cat) => (
        <span
          key={cat.id}
          style={{
            display: "inline-block",
            padding: "3px 10px",
            fontSize: EMBEDDED_FONT.tag,
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            letterSpacing: "0.05em",
            color: BG_CREAM,
            background: "transparent",
            border: `1px solid ${cat.color ?? "rgba(255,255,255,0.4)"}`,
          }}
        >
          {cat.label}
        </span>
      ))}
    </div>
  );

  const renderContact = () => {
    if (!responsible) return null;
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 8,
          paddingTop: 8,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          minWidth: 0,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 32,
            height: 32,
            flexShrink: 0,
            overflow: "hidden",
            background: "rgba(255,255,255,0.06)",
          }}
        >
          {responsible.photoUrl ? (
            <Image
              src={responsible.photoUrl}
              alt={responsible.name}
              fill
              sizes="32px"
              className="object-cover"
            />
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            fontSize: EMBEDDED_FONT.contact,
            lineHeight: 1.25,
            minWidth: 0,
          }}
        >
          {responsible.phone ? (
            <span style={{ color: "rgba(255,255,255,0.85)" }}>{responsible.phone}</span>
          ) : (
            <span style={{ color: "rgba(255,255,255,0.55)" }}>{responsible.name}</span>
          )}
          {responsible.email ? (
            <span
              style={{
                color: "rgba(255,255,255,0.7)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {responsible.email}
            </span>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <article
      aria-label={project.name}
      data-comte-embedded-card="true"
      className="select-text"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: TILE_CARD_BG,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          flex: `0 0 ${EMBEDDED_DETAIL_IMAGE_FRACTION * 100}%`,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {renderGallery()}
      </div>
      <div
        style={{
          padding: 16,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: EMBEDDED_FONT.title,
            fontWeight: 600,
            color: "#fff",
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            lineHeight: 1.25,
            flexShrink: 0,
          }}
        >
          {project.name}
        </h3>
        {customers.length > 0 ? (
          <p
            style={{
              margin: "16px 0 0",
              fontSize: EMBEDDED_FONT.meta,
              color: "rgba(255,255,255,0.75)",
              fontFamily: "var(--font-manrope), system-ui, sans-serif",
              flexShrink: 0,
            }}
          >
            {customers.join(" · ")}
          </p>
        ) : null}
        <p
          style={{
            margin: customers.length > 0 ? "2px 0 0" : "16px 0 0",
            fontSize: EMBEDDED_FONT.small,
            color: "rgba(255,255,255,0.55)",
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            flexShrink: 0,
          }}
        >
          {project.year}
        </p>
        <p
          style={{
            margin: "16px 0 0",
            fontSize: EMBEDDED_FONT.summary,
            color: "rgba(255,255,255,0.78)",
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            lineHeight: 1.45,
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: EMBEDDED_SUMMARY_LINE_CLAMP,
            paddingBottom: 12,
          }}
        >
          {project.summary}
        </p>
        {methodLabels.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              marginTop: 6,
              flexShrink: 0,
            }}
          >
            {methodLabels.map((label) => (
              <span
                key={label}
                style={{
                  padding: "3px 10px",
                  fontSize: EMBEDDED_FONT.tag,
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                  letterSpacing: "0.05em",
                  color: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(255,255,255,0.35)",
                }}
              >
                {label}
              </span>
            ))}
          </div>
        ) : null}
        {cardLinks.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6, flexShrink: 0 }}>
            {cardLinks.map((link) =>
              link.url ? (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: EMBEDDED_FONT.meta,
                    fontWeight: 500,
                    color: accent,
                    fontFamily: "var(--font-manrope), system-ui, sans-serif",
                    textDecoration: "none",
                  }}
                >
                  {link.label || link.url}
                </a>
              ) : null,
            )}
          </div>
        ) : null}
        {renderTags()}
        {renderContact()}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// ExpandedProjectCard
//
// Modal-style card that opens when a project dot is clicked. The card has its
// own vertical scroll (max-height 86vh) so it can host more content than the
// viewport allows. Inside that scroll, the carousel image runs a parallax
// translate at 0.5× the scroll speed so the image LAGS the text — it stays
// visible roughly twice as long as it would with regular flow.
//
// Layout, top to bottom:
//   - Backdrop click target + close button (outside the parallax)
//   - Carousel (image + chevrons), parallax target
//   - Main category chip (filled) + sub-categories (outlined chips)
//   - Title
//   - Customers (joined with " · ") + year on its own line
//   - Description
//   - Method chips on one row
//   - Responsible: small headshot left, phone / email right (two lines)
//   - Optional auxiliary links
// ---------------------------------------------------------------------------

type ExpandedProjectCardProps = {
  project: NetProject;
  galleryUrls?: string[];
  photoIdx?: number;
  setPhotoIdx?: (updater: (i: number) => number) => void;
  onClose: () => void;
  isMobile: boolean;
};

// Parallax factor: scrolled text moves at this fraction of scroll speed (lags the scroll).
const CARD_PARALLAX_FACTOR = 0.5;
/** Extra image height inside the clip so parallax has room to travel (overlay mode). */
const CARD_IMAGE_PARALLAX_HEADROOM = 1.25;
/** Matches BlobNav OUTER_GAP / ITEM_GAP_PX between navbar elements. */
const CARD_MODAL_NAV_GAP = "4px";
/** Centered modal top clears nav bottom by CARD_MODAL_NAV_GAP at max height. */
const CARD_MAX_HEIGHT = `calc(100vh - 2 * (${NAV_HEIGHT_TOTAL}) - 2 * ${CARD_MODAL_NAV_GAP})`;

function ExpandedProjectCard({
  project,
  galleryUrls: galleryUrlsProp,
  photoIdx: photoIdxProp = 0,
  setPhotoIdx: setPhotoIdxProp,
  onClose,
  isMobile,
}: ExpandedProjectCardProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(false);

  const resolvedGallery =
    galleryUrlsProp && galleryUrlsProp.length > 0
      ? galleryUrlsProp
      : getProjectGalleryUrls(project);
  const photoIdx = photoIdxProp;
  const setPhotoIdx = setPhotoIdxProp ?? (() => {});

  const accent = DOMAIN_COLORS[project.domain];
  const customers =
    project.customers && project.customers.length > 0
      ? project.customers
      : project.client
        ? [project.client]
        : [];
  const subCategories = project.subCategories ?? project.displayTags ?? [];
  const responsible = project.responsible;
  const methodLabels = (project.methods ?? [])
    .filter((m): m is Method => m in METHOD_LABELS)
    .map((m) => METHOD_LABELS[m]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const content = contentRef.current;
    if (!scroller || !content) return;

    const measureMaxHeightPx = () => {
      const probe = document.createElement("div");
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      probe.style.pointerEvents = "none";
      probe.style.height = CARD_MAX_HEIGHT;
      probe.style.maxHeight = CARD_MAX_HEIGHT;
      probe.style.width = "0";
      document.body.appendChild(probe);
      const maxPx = probe.offsetHeight;
      probe.remove();
      return maxPx;
    };

    const measure = () => {
      const maxPx = measureMaxHeightPx();
      setScrollEnabled(content.scrollHeight > maxPx + 1);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(content);
    ro.observe(scroller);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [project.id, resolvedGallery.length, photoIdx]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const parallax = parallaxRef.current;
    if (!scroller || !parallax || !scrollEnabled) {
      if (parallax) parallax.style.transform = "translate3d(0, 0, 0)";
      return;
    }

    const apply = () => {
      const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const y = reduceMotion ? 0 : scroller.scrollTop * CARD_PARALLAX_FACTOR;
      parallax.style.transform = `translate3d(0, ${y}px, 0)`;
      rafIdRef.current = null;
    };
    const onScroll = () => {
      if (rafIdRef.current != null) return;
      rafIdRef.current = requestAnimationFrame(apply);
    };

    scroller.scrollTop = 0;
    apply();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [project.id, resolvedGallery.length, scrollEnabled]);

  const renderGallery = () => {
    if (resolvedGallery.length === 0) return null;
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16/10",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          ref={parallaxRef}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: `${CARD_IMAGE_PARALLAX_HEADROOM * 100}%`,
            willChange: "transform",
          }}
        >
          <div className="relative h-full w-full">
            <Image
              key={resolvedGallery[photoIdx]}
              src={resolvedGallery[photoIdx]}
              alt=""
              fill
              className="object-cover"
              sizes="480px"
            />
          </div>
        </div>
        {resolvedGallery.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                setPhotoIdx((i) => (i - 1 + resolvedGallery.length) % resolvedGallery.length);
              }}
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(0,0,0,0.45)",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                setPhotoIdx((i) => (i + 1) % resolvedGallery.length);
              }}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(0,0,0,0.45)",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              <ChevronRight size={22} />
            </button>
          </>
        ) : null}
      </div>
    );
  };

  const textPadding = "clamp(16px, 3vw, 24px)";

  const renderScrollableText = () => (
    <>
      <h3
        style={{
          margin: "0 0 6px 0",
          fontSize: "1rem",
          fontWeight: 500,
          color: "#fff",
          fontFamily: "var(--font-manrope), system-ui, sans-serif",
          lineHeight: 1.3,
          paddingRight: 24,
        }}
      >
        {project.name}
      </h3>
      {customers.length > 0 ? (
        <p
          style={{
            margin: "0 0 2px 0",
            fontSize: "0.85rem",
            color: "rgba(255,255,255,0.75)",
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
          }}
        >
          {customers.join(" · ")}
        </p>
      ) : null}
      <p
        style={{
          margin: "0 0 14px 0",
          fontSize: "0.8rem",
          color: "rgba(255,255,255,0.55)",
          fontFamily: "var(--font-manrope), system-ui, sans-serif",
        }}
      >
        {project.year}
      </p>
      <p
        style={{
          margin: "0 0 14px 0",
          fontSize: "0.9rem",
          color: "rgba(255,255,255,0.78)",
          fontFamily: "var(--font-manrope), system-ui, sans-serif",
          lineHeight: 1.55,
        }}
      >
        {project.summary}
      </p>
      {methodLabels.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {methodLabels.map((label) => (
            <span
              key={label}
              style={{
                display: "inline-block",
                padding: "3px 10px",
                fontSize: "0.65rem",
                fontFamily: "var(--font-manrope), system-ui, sans-serif",
                letterSpacing: "0.05em",
                color: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(255,255,255,0.35)",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </>
  );

  const renderOverlayCategoryRow = () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        marginBottom: 14,
        alignItems: "center",
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: "3px 10px",
          fontSize: "0.65rem",
          fontFamily: "var(--font-manrope), system-ui, sans-serif",
          letterSpacing: "0.05em",
          color: BG_CREAM,
          background: "transparent",
          border: `1px solid ${accent}`,
        }}
      >
        {DOMAIN_LABELS[project.domain]}
      </span>
      {subCategories.map((cat) => (
        <span
          key={cat.id}
          style={{
            display: "inline-block",
            padding: "3px 10px",
            fontSize: "0.65rem",
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            letterSpacing: "0.05em",
            color: BG_CREAM,
            background: "transparent",
            border: `1px solid ${cat.color ?? "rgba(255,255,255,0.4)"}`,
          }}
        >
          {cat.label}
        </span>
      ))}
    </div>
  );

  const renderOverlayResponsible = () =>
    responsible ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 8,
          paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 40,
            height: 40,
            flexShrink: 0,
            overflow: "hidden",
            background: "rgba(255,255,255,0.06)",
          }}
        >
          {responsible.photoUrl ? (
            <Image
              src={responsible.photoUrl}
              alt={responsible.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            fontSize: "0.78rem",
            lineHeight: 1.3,
            minWidth: 0,
          }}
        >
          {responsible.phone ? (
            <span style={{ color: "rgba(255,255,255,0.85)" }}>{responsible.phone}</span>
          ) : (
            <span style={{ color: "rgba(255,255,255,0.55)" }}>{responsible.name}</span>
          )}
          {responsible.email ? (
            <span
              style={{
                color: "rgba(255,255,255,0.7)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {responsible.email}
            </span>
          ) : null}
        </div>
      </div>
    ) : null;

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, zIndex: 25 }}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-label={project.name}
        className="select-text"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? "calc(100% - 48px)" : 440,
          maxWidth: 480,
          maxHeight: CARD_MAX_HEIGHT,
          background: TILE_CARD_BG,
          border: "1px solid rgba(255,255,255,0.1)",
          padding: 0,
          overflow: "hidden",
          zIndex: 30,
          animation: "clusterCardIn 0.3s ease-out",
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close project details"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(0,0,0,0.55)",
            color: "rgba(255,255,255,0.9)",
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            zIndex: 40,
          }}
        >
          ✕
        </button>

        <div
          ref={scrollerRef}
          data-comte-modal-scroll="true"
          style={{
            maxHeight: CARD_MAX_HEIGHT,
            overflowY: scrollEnabled ? "auto" : "visible",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div ref={contentRef}>
            {renderGallery()}
            <div style={{ padding: textPadding }}>
              {renderOverlayCategoryRow()}
              {renderScrollableText()}
              {renderOverlayResponsible()}
              {(project.cardLinks ?? []).filter((l) => l.url).length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 6,
                    marginTop: 14,
                  }}
                >
                  {(project.cardLinks ?? []).map((link) =>
                    link.url ? (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 500,
                          color: accent,
                          fontFamily: "var(--font-manrope), system-ui, sans-serif",
                          textDecoration: "none",
                        }}
                      >
                        {link.label || link.url}
                      </a>
                    ) : null,
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
