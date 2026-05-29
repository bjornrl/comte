import { PANEL_PADDING } from "./sections/SectionShell";

/** Match ProjectCluster tile grid — flanking prev/next column share. */
export const SECTION_DIVIDER_TILE_GRID_COLUMNS = 8;
export const SECTION_DIVIDER_TILE_GRID_GAP = 4;
export const SECTION_DIVIDER_TILE_FLANKING_NAV_COLS = 0.375;

const TILE_GRID_GAPS_PX =
  (SECTION_DIVIDER_TILE_GRID_COLUMNS - 1) * SECTION_DIVIDER_TILE_GRID_GAP;

/**
 * Inset from a panel's trailing vertical seam toward the interior — exactly one
 * project tile prev/next button width (stage = panel minus horizontal padding).
 */
export const SECTION_DIVIDER_INSET_FROM_TRAILING_SEAM = `calc(((100% - 2 * ${PANEL_PADDING} - ${TILE_GRID_GAPS_PX}px) / ${SECTION_DIVIDER_TILE_GRID_COLUMNS}) * ${SECTION_DIVIDER_TILE_FLANKING_NAV_COLS})`;

/** Flanking nav width when the containing block is the project tile stage (100% wide). */
export const PROJECT_TILE_FLANKING_NAV_WIDTH = `calc((100% - ${TILE_GRID_GAPS_PX}px) / ${SECTION_DIVIDER_TILE_GRID_COLUMNS} * ${SECTION_DIVIDER_TILE_FLANKING_NAV_COLS})`;
