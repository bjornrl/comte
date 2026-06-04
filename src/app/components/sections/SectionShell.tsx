import type { CSSProperties, ReactNode } from "react";

export const PANEL_PADDING = "clamp(2rem, 5vw, 5rem)";

// Vertical space taken up by the nav at the top of every panel.
// Must stay in sync with BlobNav: TOP_MARGIN + BOX_HEIGHT.
export const NAV_HEIGHT_TOTAL = "calc(clamp(1rem, 2.5vw, 2.5rem) + 48px)";

/**
 * Y-coordinate at which "regular" content starts inside a panel.
 * Equals (nav height) + (PANEL_PADDING gap) so the content sits one full
 * horizontal-padding's worth of space below the nav.
 */
export const CONTENT_TOP = `calc(${NAV_HEIGHT_TOTAL} + ${PANEL_PADDING})`;

/** Drop below nav before section body copy — what-we-do textbox is the reference. */
export const SECTION_BODY_TOP_OFFSET = "clamp(5rem, 12vh, 8rem)";

/** Body copy start Y when SectionShell uses padding: 0 on the section root. */
export const SECTION_BODY_CONTENT_TOP = `calc(${CONTENT_TOP} + ${SECTION_BODY_TOP_OFFSET})`;

/** Section title scale — shared by intro blocks, contact, and hero alignment. */
export const SECTION_TITLE_SIZE = "clamp(1.875rem, 2.5vw, 2.25rem)";

/** Panel section heading — a step above body scale; weight matches SectionBodyText. */
export const SECTION_PANEL_HEADING_SIZE = "clamp(1.75rem, 3.5vw, 2.875rem)";
export const SECTION_PANEL_HEADING_WEIGHT = 500;
export const SECTION_PANEL_HEADING_LINE_HEIGHT = 1.1;
export const SECTION_TITLE_TO_BODY_GAP = "0.75rem";

/** Body copy Y when a section title sits above it (contact block 1, intro textboxes). */
export const SECTION_BODY_BELOW_TITLE_TOP = `calc(${SECTION_BODY_CONTENT_TOP} + ${SECTION_TITLE_SIZE} * 1.25 + ${SECTION_TITLE_TO_BODY_GAP})`;

/** Estimated height of intro's two title+body blocks (centred column). */
export const INTRO_TEXT_CLUSTER_HEIGHT = "clamp(20rem, 45vh, 32rem)";

/** Top edge of intro text cluster — shared with what-we-do body alignment. */
export const INTRO_TEXT_CLUSTER_TOP = `calc(${PANEL_PADDING} + max(0px, (100vh - 2 * ${PANEL_PADDING} - ${INTRO_TEXT_CLUSTER_HEIGHT}) / 2))`;

/** Project tile view — vertical inset below nav. */
export const PROJECT_TILE_VERTICAL_MARGIN = "clamp(1rem, 2vw, 1.5rem)";
export const PROJECT_TILE_CARDS_TOP_EXTRA = "clamp(2rem, 5vh, 3.5rem)";
export const PROJECT_TILE_SECTION_TOP = `calc(${CONTENT_TOP} - ${PANEL_PADDING} + ${PROJECT_TILE_VERTICAL_MARGIN})`;
/** Reserved height for a panel title row (Projects, What we do, etc.). */
export const PROJECT_TILE_HEADING_BLOCK = "clamp(1.9rem, 3.65vw, 3.2rem)";
export const PROJECT_TILE_GAP_BELOW_HEADING = "8px";
/** Top edge of the project card grid (no section heading). */
export const PROJECT_CARD_AREA_TOP = `calc(${PROJECT_TILE_SECTION_TOP} + ${PROJECT_TILE_CARDS_TOP_EXTRA})`;
/** Card grid / body text below a panel title — matches Projects with heading. */
export const PROJECT_CONTENT_TOP_BELOW_PANEL_TITLE = `calc(${PROJECT_TILE_SECTION_TOP} + ${PROJECT_TILE_HEADING_BLOCK} + ${PROJECT_TILE_GAP_BELOW_HEADING} + ${PROJECT_TILE_CARDS_TOP_EXTRA})`;

type SectionShellProps = {
  id: string;
  bgColor?: string;
  children: ReactNode;
  style?: CSSProperties;
  /** Extra utility classes appended to the section container. */
  className?: string;
};

/**
 * Common wrapper for each horizontal-scroll panel.
 * - Fills its parent (the snap-wrapper in HorizontalScroll, which controls
 *   the panel width — defaults to 100vw, but team and other wide blocks
 *   can specify a larger width).
 * - Background colour driven by CMS.
 * - Top padding uses CONTENT_TOP so content clears the nav; other sides
 *   use PANEL_PADDING. Sections that need full-bleed content can override
 *   via the `style` prop (e.g. `style={{ padding: 0 }}`).
 */
export default function SectionShell({ id, bgColor, children, style, className = "" }: SectionShellProps) {
  return (
    <section
      id={id}
      data-section-id={id}
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        background: bgColor ?? undefined,
        paddingTop: CONTENT_TOP,
        paddingRight: PANEL_PADDING,
        paddingBottom: PANEL_PADDING,
        paddingLeft: PANEL_PADDING,
        ...style,
      }}
    >
      {children}
    </section>
  );
}
