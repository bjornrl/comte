/** Shared navbar color tokens and per-section themes for scroll blending. */

export const NAV_BOX_HOVER_BG = "#FF5252";
export const NAV_ACTIVE_BG = "#FF5252";
export const NAV_ACTIVE_FG = "#F4F4E8";

export const NAV_COLOR_TRANSITION_MS = 450;
export const NAV_COLOR_TRANSITION = `background ${NAV_COLOR_TRANSITION_MS}ms ease, color ${NAV_COLOR_TRANSITION_MS}ms ease, stroke ${NAV_COLOR_TRANSITION_MS}ms ease`;

export type NavTheme = {
  boxBg: string;
  boxFg: string;
  navItemBg: string;
  navItemFg: string;
  logoMode: "auto" | "blue";
};

const CREAM = "#F5F5E9";
const BLUE = "#5A7482";
const CREAM_FG = "#F4F4E8";

const CHROME_DEFAULT: NavTheme = {
  boxBg: CREAM,
  boxFg: BLUE,
  navItemBg: BLUE,
  navItemFg: CREAM_FG,
  logoMode: "auto",
};

const CHROME_BLUE: NavTheme = {
  ...CHROME_DEFAULT,
  logoMode: "blue",
};

const CHROME_CREAM: NavTheme = {
  boxBg: CREAM,
  boxFg: BLUE,
  navItemBg: CREAM,
  navItemFg: BLUE,
  logoMode: "auto",
};

/** Resolve static theme for a section id (landing panels share default chrome). */
export function navThemeForSection(sectionId: string | undefined): NavTheme {
  switch (sectionId) {
    case "about-intro":
    case "what-we-do":
    case "publications":
    case "ventures":
    case "contact":
      return CHROME_BLUE;
    case "projects":
      return { ...CHROME_DEFAULT, logoMode: "blue" };
    case "team":
      return CHROME_CREAM;
    default:
      return CHROME_DEFAULT;
  }
}

export function navLogoSrcForTheme(
  theme: NavTheme,
  highlighted: boolean,
): string {
  if (highlighted) return "/comte-coral.svg";
  if (theme.logoMode === "blue") return "/logo-blue.svg";
  return "/logo-white.svg";
}

export type NavThemeBlend = {
  fromId: string;
  toId: string;
  /** 0 = fully `from`, 1 = fully `to`. */
  t: number;
};

/** Switch nav chrome once this fraction of the incoming panel is visible. */
export const NAV_THEME_VISIBILITY_THRESHOLD = 0.5;

export function sectionIdFromNavThemeBlend(blend: NavThemeBlend): string {
  if (blend.fromId === blend.toId) return blend.fromId;
  return blend.t >= NAV_THEME_VISIBILITY_THRESHOLD ? blend.toId : blend.fromId;
}

/** Solid theme for one section — nav elements animate via CSS, not scroll lerp. */
export function resolveBlendedNavTheme(
  blend: NavThemeBlend,
): {
  colors: NavTheme;
  themeLogoSrc: string;
} {
  const sectionId = sectionIdFromNavThemeBlend(blend);
  const colors = navThemeForSection(sectionId);
  return {
    colors,
    themeLogoSrc: navLogoSrcForTheme(colors, false),
  };
}

/** Measure scroll progress between the two snap panels straddling the viewport's left edge. */
export function measureNavThemeBlendFromScroller(
  scroller: HTMLElement,
): NavThemeBlend | null {
  const containerRect = scroller.getBoundingClientRect();
  const panels = Array.from(
    scroller.querySelectorAll<HTMLElement>("[data-snap-id]"),
  ).filter((p) => {
    const id = p.dataset.snapId;
    return id && !id.startsWith("clone");
  });

  if (panels.length === 0) return null;

  const positioned = panels
    .map((panel) => ({
      id: panel.dataset.snapId!,
      relLeft: panel.getBoundingClientRect().left - containerRect.left,
    }))
    .sort((a, b) => a.relLeft - b.relLeft);

  let before: (typeof positioned)[number] | null = null;
  let after: (typeof positioned)[number] | null = null;

  for (const entry of positioned) {
    if (entry.relLeft <= 1) before = entry;
    if (entry.relLeft > 1 && !after) {
      after = entry;
      break;
    }
  }

  if (before && after) {
    const span = after.relLeft - before.relLeft;
    const t = span > 0 ? clamp01(-before.relLeft / span) : 0;
    return { fromId: before.id, toId: after.id, t };
  }

  const current = before ?? after ?? positioned[0];
  return { fromId: current.id, toId: current.id, t: 1 };
}

/** Pick the section whose theme should apply (majority-visible between neighbours). */
export function measureNavThemeSectionFromScroller(
  scroller: HTMLElement,
): string | null {
  const blend = measureNavThemeBlendFromScroller(scroller);
  if (!blend) return null;
  return sectionIdFromNavThemeBlend(blend);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
