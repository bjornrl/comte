const DEFAULT_LOCALE = "en";

/** Resolve Sanity `localeString` / plain string / number to display text. */
export function resolveLocaleString(
  value: unknown,
  locale: string = DEFAULT_LOCALE,
): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const localized = record[locale];
    if (typeof localized === "string") return localized;
    for (const key of Object.keys(record)) {
      if (key === "_type") continue;
      const entry = record[key];
      if (typeof entry === "string") return entry;
    }
  }
  return undefined;
}

/** Alias for `localeText` fields — same resolution rules as strings. */
export function resolveLocaleText(
  value: unknown,
  locale: string = DEFAULT_LOCALE,
): string | undefined {
  return resolveLocaleString(value, locale);
}

export function resolveDatapoint(
  value: unknown,
  locale: string = DEFAULT_LOCALE,
):
  | {
      value?: string;
      label?: string;
    }
  | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  return {
    value: resolveLocaleString(record.value, locale),
    label: resolveLocaleString(record.label, locale),
  };
}
