import type { CSSProperties, ReactNode } from "react";

export const PANEL_PADDING = "clamp(2rem, 5vw, 5rem)";

// Vertical space taken up by the nav at the top of every panel.
// Must stay in sync with BlobNav: TOP_MARGIN + BOX_HEIGHT.
const NAV_HEIGHT_TOTAL = "calc(clamp(1rem, 2.5vw, 2.5rem) + 48px)";

/**
 * Y-coordinate at which "regular" content starts inside a panel.
 * Equals (nav height) + (PANEL_PADDING gap) so the content sits one full
 * horizontal-padding's worth of space below the nav.
 */
export const CONTENT_TOP = `calc(${NAV_HEIGHT_TOTAL} + ${PANEL_PADDING})`;

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
