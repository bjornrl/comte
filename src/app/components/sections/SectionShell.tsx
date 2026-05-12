import type { CSSProperties, ReactNode } from "react";

export const PANEL_PADDING = "clamp(2rem, 5vw, 5rem)";

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
 * - Full viewport (100vw x 100svh).
 * - Background colour driven by CMS.
 * - Provides consistent padding via PANEL_PADDING.
 */
export default function SectionShell({ id, bgColor, children, style, className = "" }: SectionShellProps) {
  return (
    <section
      id={id}
      data-section-id={id}
      className={`relative h-svh w-screen flex-shrink-0 overflow-hidden ${className}`}
      style={{
        background: bgColor ?? undefined,
        padding: PANEL_PADDING,
        ...style,
      }}
    >
      {children}
    </section>
  );
}
