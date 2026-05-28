import "server-only";
import { headers } from "next/headers";
import { DEFAULT_LOCALE, type Locale, isLocale } from "./locale";

/**
 * Reads the active locale off the x-locale header that middleware.ts
 * stamps onto the request. Falls back to English when the header is
 * missing (build-time prerendering, direct API hits).
 */
export async function getServerLocale(): Promise<Locale> {
  try {
    const h = await headers();
    const raw = h.get("x-locale");
    return isLocale(raw) ? raw : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}
