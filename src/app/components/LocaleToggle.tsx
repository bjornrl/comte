"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/locale";
import { localizedPath } from "@/lib/locale";
import { NAV_BOX_HOVER_BG, NAV_COLOR_TRANSITION } from "./navTheme";

/** Keep in sync with BlobNav / MobileNav chrome. */
export const LOCALE_TOGGLE_SIZE = 42;
export const LOCALE_TOGGLE_SIDE_MARGIN = "clamp(2rem, 5vw, 5rem)";
export const LOCALE_TOGGLE_TOP_MARGIN = "clamp(1rem, 2.5vw, 2.5rem)";

const DEFAULT_BG = "#5A7482";
const DEFAULT_FG = "#F4F4E8";

export function localeFromPathname(pathname: string): Locale {
  return pathname === "/no" || pathname.startsWith("/no/") ? "no" : "en";
}

export function localeToggleHref(pathname: string): string {
  const isNorwegian = localeFromPathname(pathname) === "no";
  if (isNorwegian) {
    return pathname.replace(/^\/no(?=\/|$)/, "") || "/";
  }
  if (pathname === "/") return localizedPath("/", "no");
  return localizedPath(pathname, "no");
}

type Props = {
  /** Desktop: show active locale (ENG / NOR). Mobile: show switch target (EN / NO). */
  variant?: "active" | "target";
  /** Pin to top-right with the same inset as the navbar's top/left. */
  fixed?: boolean;
  background?: string;
  color?: string;
};

export default function LocaleToggle({
  variant = "active",
  fixed = false,
  background = DEFAULT_BG,
  color = DEFAULT_FG,
}: Props) {
  const pathname = usePathname() ?? "/";
  const isNorwegian = localeFromPathname(pathname) === "no";
  const href = localeToggleHref(pathname);

  const label =
    variant === "active" ? (isNorwegian ? "NOR" : "ENG") : isNorwegian ? "EN" : "NO";

  const ariaLabel = isNorwegian
    ? "Switch to English"
    : "Bytt til norsk (Switch to Norwegian)";

  // A plain <a> (full document navigation) rather than next/link: the locale
  // lives in the x-locale header that proxy.ts sets from the /no URL prefix,
  // but /no rewrites to the same "/" route tree. A soft client navigation
  // changes the URL without re-running the server render, so the content never
  // switches language. A hard navigation re-renders server-side with the new
  // locale. (Switching language is rare, so the full reload is acceptable.)
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5F5E9]"
      style={{
        ...(fixed
          ? {
              position: "fixed",
              top: LOCALE_TOGGLE_TOP_MARGIN,
              right: LOCALE_TOGGLE_SIDE_MARGIN,
              zIndex: 100,
              pointerEvents: "auto",
            }
          : {}),
        width: LOCALE_TOGGLE_SIZE,
        height: LOCALE_TOGGLE_SIZE,
        boxSizing: "border-box",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background,
        color,
        fontFamily: "var(--font-work-sans), system-ui, sans-serif",
        fontWeight: 600,
        fontSize: variant === "active" ? "0.7rem" : "0.875rem",
        letterSpacing: "0.08em",
        textDecoration: "none",
        textTransform: "uppercase",
        transition: NAV_COLOR_TRANSITION,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = NAV_BOX_HOVER_BG;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = background;
      }}
    >
      {label}
    </a>
  );
}
