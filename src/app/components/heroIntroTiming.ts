/** Shared hero intro timing — keep motto heading in sync with the last line. */
export const HERO_LINE_BASE_DELAY_MS = 900;
export const HERO_LINE_STAGGER_MS = 120;
export const HERO_FADE_DURATION_MS = 700;
export const HERO_LINE_COUNT = 5;

export const HERO_MATTERS_LINE_DELAY_MS =
  HERO_LINE_BASE_DELAY_MS + (HERO_LINE_COUNT - 1) * HERO_LINE_STAGGER_MS;

export const heroFadeEasing = "cubic-bezier(0.25, 1, 0.5, 1)";
