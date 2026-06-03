"use client";

import { usePathname } from "next/navigation";
import { localeFromPathname } from "@/lib/locale";
import { getUi, type UiStrings } from "@/lib/uiStrings";

/**
 * Client-side access to localized UI-chrome strings. Derives the active locale
 * from the URL (the /no prefix stays in the address bar even though proxy.ts
 * rewrites it internally), so it tracks whatever language the page is showing.
 */
export function useUi(): UiStrings {
  const pathname = usePathname() ?? "/";
  return getUi(localeFromPathname(pathname));
}
