/** Shared body copy scale — matched across section textboxes. */
export const SECTION_BODY_SIZE = "clamp(1.25rem, 1.75vw, 1.5rem)";
export const SECTION_BODY_LINE_HEIGHT = 1.45;
export const SECTION_BODY_MAX_CH = "64ch";
/** Space between paragraphs — same across intro, what-we-do, ventures, publications. */
export const SECTION_BODY_PARAGRAPH_GAP = "1rem";

/** Logo column width in about-intro — used to match textbox width across sections. */
const ABOUT_INTRO_LOGO_ASPECT = 71 / 247;

const INTRO_TEXT_COL_INNER = `calc((100vw - 100svh * ${ABOUT_INTRO_LOGO_ASPECT} - 40vw) * 0.92 - clamp(2.5rem, 5vw, 5rem) - clamp(1.5rem, 4vw, 4rem))`;

/**
 * Cap body width to the about-intro text column's inner measure so what-we-do
 * lines wrap the same as the pink intro textboxes (not the full 64ch on wide panels).
 */
export const SECTION_BODY_MAX_WIDTH = `min(${SECTION_BODY_MAX_CH}, ${INTRO_TEXT_COL_INNER})`;

/** Slightly wider than intro — what-we-do text column. */
export const WHAT_WE_DO_BODY_MAX_WIDTH = `min(${SECTION_BODY_MAX_CH}, calc(${INTRO_TEXT_COL_INNER} * 1.2))`;

/** Publications and ventures — a bit narrower than what-we-do. */
export const PUBLICATIONS_VENTURES_BODY_MAX_WIDTH = `min(${SECTION_BODY_MAX_CH}, ${INTRO_TEXT_COL_INNER})`;

/** Split CMS plain text into paragraphs (blank lines, or single newlines when no blank lines). */
export function splitSectionBodyParagraphs(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (/\n\s*\n/.test(trimmed)) {
    return trimmed
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return trimmed
    .split(/\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

type SectionBodyTextProps = {
  text: string;
  color: string;
};

export function SectionBodyText({ text, color }: SectionBodyTextProps) {
  const paragraphs = splitSectionBodyParagraphs(text);

  return (
    <div
      className="flex w-full min-w-0 flex-col font-[family-name:var(--font-manrope)] font-medium"
      style={{
        color,
        fontSize: SECTION_BODY_SIZE,
        lineHeight: SECTION_BODY_LINE_HEIGHT,
        gap: SECTION_BODY_PARAGRAPH_GAP,
      }}
    >
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="m-0">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
