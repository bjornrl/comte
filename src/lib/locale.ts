export const SUPPORTED_LOCALES = ["en", "no"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "no";
}

/**
 * Pull the active locale out of a localeString/localeText object, with
 * silent fallback to English when the active language hasn't been
 * translated yet. Tolerates plain strings so unmigrated documents keep
 * rendering instead of returning the literal "[object Object]".
 */
export function pickLocale(
  field: unknown,
  locale: Locale = DEFAULT_LOCALE,
): string {
  if (typeof field === "string") return field;
  if (field && typeof field === "object") {
    const f = field as Record<string, unknown>;
    const active = f[locale];
    if (typeof active === "string" && active.trim().length > 0) return active;
    const fallback = f.en;
    if (typeof fallback === "string") return fallback;
  }
  return "";
}

/**
 * URL helper — prepends /no for Norwegian, leaves English paths bare.
 * Accepts both root-relative paths ("/projects/x") and absolute URLs;
 * absolute URLs are returned untouched.
 */
export function localizedPath(path: string, locale: Locale): string {
  if (/^[a-z]+:\/\//i.test(path)) return path;
  if (path.startsWith("#") || path.startsWith("?")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === "en") return normalized;
  if (normalized === "/") return "/no";
  return `/no${normalized}`;
}
