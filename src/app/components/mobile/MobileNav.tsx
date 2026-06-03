"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { NAV_ITEMS } from "../BlobNav";
import LocaleToggle from "../LocaleToggle";
import { useUi } from "../useUi";

const BOX_BG = "#F5F5E9";
const BOX_HOVER_BG = "#FF5252";
const NAV_ITEM_BG = "#5A7482";
const NAV_ITEM_FG = "#F4F4E8";
const BOX_HEIGHT = 42;
const LOGO_ASPECT = 247 / 71;
const LOGO_WIDTH = Math.round(BOX_HEIGHT * LOGO_ASPECT);

const ABOUT_SECTION_IDS = new Set(["about-intro", "what-we-do"]);

function isNavItemActive(itemId: string, active?: string): boolean {
  if (!active) return false;
  if (itemId === active) return true;
  if (itemId === "about-intro" && ABOUT_SECTION_IDS.has(active)) return true;
  return false;
}

function isLogoActive(active?: string): boolean {
  return active === "home" || active === "motto";
}

function logoSrc(active: string | undefined, hot: boolean): string {
  if (hot) return "/comte-coral.svg";
  if (active === "projects") return "/logo-blue.svg";
  return "/logo-white.svg";
}

function HamburgerIcon({ open }: { open: boolean }) {
  const TOP = open ? 5 : 3;
  const BOTTOM = open ? 5 : 7;
  return (
    <svg
      width={22}
      height={10}
      viewBox="0 0 22 10"
      style={{ overflow: "visible", display: "block" }}
      aria-hidden="true"
    >
      <path
        d={
          open
            ? `M 0 ${TOP} L 22 ${BOTTOM} M 0 ${BOTTOM} L 22 ${TOP}`
            : `M 0 ${TOP} L 22 ${TOP} M 0 ${BOTTOM} L 22 ${BOTTOM}`
        }
        stroke={NAV_ITEM_FG}
        strokeWidth={2}
        strokeLinecap="butt"
        fill="none"
        style={{ transition: "d 0.3s cubic-bezier(0.25, 1, 0.5, 1)" }}
      />
    </svg>
  );
}

type Props = {
  /** ID of the currently in-view section, used to highlight nav items. */
  activeSection?: string;
};

/**
 * Mobile top bar + drawer nav. Stays fixed at the top, opens a full-bleed
 * sheet on tap, smooth-scrolls to anchor IDs that match BlobNav's NAV_ITEMS.
 */
export default function MobileNav({ activeSection }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const isHome = pathname === "/" || pathname === "/no";

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const navigate = useCallback((sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  }, []);

  const logoActive = isLogoActive(activeSection);
  const ui = useUi();

  return (
    <>
      {/* Top bar */}
      <div
        role="navigation"
        aria-label="Main navigation"
        className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-between px-4 py-3"
        style={{ pointerEvents: "none" }}
      >
        {/* Logo — always links to the locale's homepage; if we're already
            on it we intercept and smooth-scroll to the home section. */}
        <a
          href={pathname.startsWith("/no") ? "/no" : "/"}
          onClick={(e) => {
            if (!isHome) return;
            e.preventDefault();
            navigate("home");
          }}
          aria-label={ui.navAria.home}
          aria-current={logoActive ? "page" : undefined}
          className="inline-flex"
          style={{
            height: BOX_HEIGHT,
            width: LOGO_WIDTH,
            // Always render the comte logo in its red treatment.
            background: BOX_BG,
            pointerEvents: "auto",
          }}
        >
          <Image
            src="/comte-coral.svg"
            alt="Comte"
            width={LOGO_WIDTH}
            height={BOX_HEIGHT}
            priority
            style={{ display: "block", width: "100%", height: "100%" }}
          />
        </a>

        {/* Right cluster — locale toggle + hamburger sit together. */}
        <div className="flex items-center gap-1" style={{ pointerEvents: "auto" }}>
          <LocaleToggle variant="target" />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? ui.navAria.closeMenu : ui.navAria.openMenu}
            aria-expanded={open}
            aria-controls="comte-mobile-nav-items"
            className="inline-flex items-center justify-center"
            style={{
              width: BOX_HEIGHT,
              height: BOX_HEIGHT,
              background: BOX_HOVER_BG,
              color: NAV_ITEM_FG,
            }}
          >
            <HamburgerIcon open={open} />
          </button>
        </div>
      </div>

      {/* Drawer — buttons float over the page; the wrapper never
          captures pointer events so the user can scroll the content
          underneath while the nav is open. */}
      <div
        id="comte-mobile-nav-items"
        aria-hidden={!open}
        className="fixed inset-x-0 top-0 z-[99]"
        style={{
          pointerEvents: "none",
          background: "transparent",
        }}
      >
        <ul
          className="flex flex-wrap items-start gap-x-1 gap-y-2 px-4"
          style={{
            paddingTop: BOX_HEIGHT + 24,
          }}
        >
          {NAV_ITEMS
            // Ventures is hidden from the mobile nav for now — the
            // section isn't part of the mobile vertical-scroll flow.
            .filter((item) => item.sectionId !== "ventures")
            .map((item, i, items) => {
            const active = isNavItemActive(item.sectionId, activeSection);
            // Staggered per-button slide-in from the left, mirroring the
            // desktop deck-collapse. Items closer to the hamburger move
            // first on open; on close the order reverses so the row tucks
            // away in the opposite direction.
            const STEP_MS = 40;
            const BASE_MS = 380;
            const reverseI = items.length - 1 - i;
            const delay = open ? i * STEP_MS : reverseI * STEP_MS;
            return (
              <li
                key={item.sectionId}
                style={{
                  transform: open ? "translateX(0)" : "translateX(-110vw)",
                  opacity: open ? 1 : 0,
                  transition: `transform ${BASE_MS}ms cubic-bezier(0.25, 1, 0.5, 1) ${delay}ms, opacity ${BASE_MS}ms cubic-bezier(0.25, 1, 0.5, 1) ${delay}ms`,
                  willChange: "transform",
                  pointerEvents: open ? "auto" : "none",
                }}
              >
                <button
                  type="button"
                  onClick={() => navigate(item.sectionId)}
                  aria-current={active ? "page" : undefined}
                  tabIndex={open ? 0 : -1}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: BOX_HEIGHT,
                    minWidth: 44,
                    paddingTop: 2,
                    paddingRight: 16,
                    paddingBottom: 0,
                    paddingLeft: 16,
                    background: BOX_HOVER_BG,
                    color: NAV_ITEM_FG,
                    fontFamily:
                      "var(--font-work-sans), system-ui, sans-serif",
                    fontWeight: 400,
                    fontSize: "1rem",
                    letterSpacing: "0.01em",
                    textTransform: "lowercase",
                    whiteSpace: "nowrap",
                    border: "none",
                    borderRadius: 0,
                    cursor: "pointer",
                    transition: "background 0.2s ease, color 0.2s ease",
                  }}
                >
                  {ui.nav[item.sectionId as keyof typeof ui.nav] ?? item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

export { BOX_HEIGHT as MOBILE_NAV_BOX_HEIGHT };
