"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  measureNavThemeSectionFromScroller,
  resolveBlendedNavTheme,
  type NavThemeBlend,
} from "./navTheme";

function solidBlend(sectionId: string): NavThemeBlend {
  return { fromId: sectionId, toId: sectionId, t: 1 };
}

/**
 * Drives navbar section themes:
 * - Manual scroll: switch when most of the next panel is visible; CSS transitions colors.
 * - Nav click: hold the pre-click colors until scrolling settles, then fade to destination.
 */
export function useNavThemeBlend(
  activeSection: string | undefined,
  isScrolling: boolean,
  navigatingViaClick: boolean,
) {
  const section = activeSection ?? "home";
  const frozenSectionRef = useRef(section);
  const [blend, setBlend] = useState<NavThemeBlend>(() => solidBlend(section));

  // Static pages (no horizontal scroller): follow activeSection directly.
  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>(
      '[data-horizontal-scroll="true"]',
    );
    if (!scroller) {
      frozenSectionRef.current = section;
      setBlend(solidBlend(section));
    }
  }, [section]);

  // After a nav-click scroll completes, snap theme to the destination section.
  useEffect(() => {
    if (isScrolling || navigatingViaClick) return;
    frozenSectionRef.current = section;
    setBlend(solidBlend(section));
  }, [isScrolling, navigatingViaClick, section]);

  // Manual scroll: discrete section theme from scroller (threshold-based).
  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>(
      '[data-horizontal-scroll="true"]',
    );
    if (!scroller) return;

    const update = () => {
      if (navigatingViaClick && isScrolling) {
        setBlend(solidBlend(frozenSectionRef.current));
        return;
      }

      const sectionId = measureNavThemeSectionFromScroller(scroller);
      if (sectionId) setBlend(solidBlend(sectionId));
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isScrolling, navigatingViaClick]);

  /** Call when the user clicks a nav item — freeze colors at the current section. */
  const freezeForNavClick = useCallback(() => {
    frozenSectionRef.current = blend.toId;
    setBlend(solidBlend(blend.toId));
  }, [blend.toId]);

  const resolved = resolveBlendedNavTheme(blend);

  return { ...resolved, freezeForNavClick };
}

/** Static theme helper for pages without horizontal scroll blending. */
export function useStaticNavTheme(activeSection: string | undefined) {
  const section = activeSection ?? "home";
  return resolveBlendedNavTheme(solidBlend(section));
}
