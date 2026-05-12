"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

export type NavItem = { label: string; sectionId: string };

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", sectionId: "home" },
  { label: "About", sectionId: "about-intro" },
  { label: "What do we do?", sectionId: "what-we-do" },
  { label: "Projects", sectionId: "projects" },
  { label: "Team", sectionId: "team" },
  { label: "Publications", sectionId: "publications" },
  { label: "Ventures", sectionId: "ventures" },
];

type Props = {
  onNavigate?: (sectionId: string) => void;
  activeSection?: string;
  textColor?: string;
};

export default function BlobNav({ onNavigate, activeSection, textColor = "#FFFFFF" }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const handleClick = useCallback(
    (sectionId: string) => {
      if (onNavigate) {
        onNavigate(sectionId);
        return;
      }
      // Off the home page → route to the home page anchor, which the scroll
      // controller picks up via the hash on mount.
      if (pathname !== "/") {
        router.push(`/#${sectionId}`);
        return;
      }
      // On the home page without a direct handler: fire a custom event the
      // HorizontalScroll listens for.
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("comte:navigate", { detail: { sectionId } }));
      }
    },
    [onNavigate, pathname, router],
  );

  return (
    <nav
      aria-label="Main navigation"
      className="pointer-events-auto fixed z-50 hidden md:flex items-center gap-1"
      style={{
        top: "clamp(2rem, 5vw, 5rem)",
        right: "clamp(2rem, 5vw, 5rem)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeSection === item.sectionId;
        return (
          <button
            key={item.sectionId}
            onClick={() => handleClick(item.sectionId)}
            className="rounded-full border border-current px-3 py-1.5 font-[family-name:var(--font-manrope)] text-sm font-medium transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
            style={{
              color: textColor,
              opacity: isActive ? 1 : 0.6,
            }}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
