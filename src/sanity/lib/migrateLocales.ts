import { DEFAULT_LOCALE, type LocaleId } from "../schemas/locale";

type LocaleObject = { en?: string; no?: string };

function isLocaleObject(value: unknown): value is LocaleObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return typeof record.en === "string" || typeof record.no === "string";
}

/** Convert a legacy plain string (or partial locale object) to `{ en, no? }`. */
export function toLocaleString(value: unknown): LocaleObject | null | undefined {
  if (value == null) return value as null | undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? { [DEFAULT_LOCALE]: trimmed } : { [DEFAULT_LOCALE]: "" };
  }
  if (isLocaleObject(value)) {
    const next: LocaleObject = {};
    if (typeof value.en === "string") next.en = value.en;
    if (typeof value.no === "string") next.no = value.no;
    return next;
  }
  return undefined;
}

export function toLocaleText(value: unknown): LocaleObject | null | undefined {
  return toLocaleString(value);
}

/** Read display text from locale object or legacy string. */
export function pickLocalePlain(value: unknown, locale: LocaleId = DEFAULT_LOCALE): string {
  if (typeof value === "string") return value;
  if (isLocaleObject(value)) {
    const active = value[locale];
    if (typeof active === "string" && active.trim()) return active;
    if (typeof value.en === "string") return value.en;
    if (typeof value.no === "string") return value.no;
  }
  return "";
}

function migrateGalleryItem(item: Record<string, unknown>): Record<string, unknown> {
  const next = { ...item };
  if ("alt" in next) next.alt = toLocaleString(next.alt) ?? next.alt;
  if ("caption" in next) next.caption = toLocaleString(next.caption) ?? next.caption;
  return next;
}

function migrateLinkItem(item: Record<string, unknown>): Record<string, unknown> {
  const next = { ...item };
  if ("label" in next) next.label = toLocaleString(next.label) ?? next.label;
  return next;
}

function migrateDatapoint(item: Record<string, unknown>): Record<string, unknown> {
  const next = { ...item };
  if ("value" in next) next.value = toLocaleString(next.value) ?? next.value;
  if ("label" in next) next.label = toLocaleString(next.label) ?? next.label;
  return next;
}

function migrateInterstitial(item: Record<string, unknown>): Record<string, unknown> {
  const next = { ...item };
  if ("text" in next) next.text = toLocaleText(next.text) ?? next.text;
  if ("alt" in next) next.alt = toLocaleString(next.alt) ?? next.alt;
  return next;
}

function migrateImageField(item: Record<string, unknown>): Record<string, unknown> {
  const next = { ...item };
  if ("alt" in next) next.alt = toLocaleString(next.alt) ?? next.alt;
  return next;
}

/** Return `{ set: Record<string, unknown> }` patches for legacy locale fields, or null if unchanged. */
export function buildLocaleMigrationPatch(
  doc: Record<string, unknown>,
): Record<string, unknown> | null {
  const set: Record<string, unknown> = {};
  const type = doc._type;

  const maybeSet = (key: string, value: unknown) => {
    const converted = toLocaleString(value);
    if (converted !== undefined && converted !== value) set[key] = converted;
  };

  const maybeSetText = (key: string, value: unknown) => {
    const converted = toLocaleText(value);
    if (converted !== undefined && converted !== value) set[key] = converted;
  };

  if (type === "project") {
    maybeSet("title", doc.title);
    maybeSetText("summary", doc.summary);
    if (Array.isArray(doc.gallery)) {
      const gallery = doc.gallery.map((item) =>
        item && typeof item === "object"
          ? migrateGalleryItem(item as Record<string, unknown>)
          : item,
      );
      if (JSON.stringify(gallery) !== JSON.stringify(doc.gallery)) set.gallery = gallery;
    }
    if (Array.isArray(doc.links)) {
      const links = doc.links.map((item) =>
        item && typeof item === "object"
          ? migrateLinkItem(item as Record<string, unknown>)
          : item,
      );
      if (JSON.stringify(links) !== JSON.stringify(doc.links)) set.links = links;
    }
  }

  if (type === "teamMember") {
    maybeSet("role", doc.role);
  }

  if (type === "venture") {
    maybeSet("title", doc.title);
    maybeSetText("description", doc.description);
    if (doc.image && typeof doc.image === "object") {
      const image = migrateImageField(doc.image as Record<string, unknown>);
      if (JSON.stringify(image) !== JSON.stringify(doc.image)) set.image = image;
    }
  }

  if (
    type === "publicationsSection" ||
    type === "venturesSection" ||
    type === "projectsSection" ||
    type === "teamSection" ||
    type === "contactSection"
  ) {
    maybeSet("heading", doc.heading);
    maybeSetText("body", doc.body);
    maybeSet("addressLabel", doc.addressLabel);
    maybeSetText("address", doc.address);
    maybeSet("emailLabel", doc.emailLabel);
    maybeSetText("emailBody", doc.emailBody);
  }

  if (type === "whatWeDo") {
    maybeSetText("textbox", doc.textbox);
    for (const key of ["datapoint1", "datapoint2", "datapoint3"]) {
      if (doc[key] && typeof doc[key] === "object") {
        const point = migrateDatapoint(doc[key] as Record<string, unknown>);
        if (JSON.stringify(point) !== JSON.stringify(doc[key])) set[key] = point;
      }
    }
    if (doc.interstitial && typeof doc.interstitial === "object") {
      const interstitial = migrateInterstitial(doc.interstitial as Record<string, unknown>);
      if (JSON.stringify(interstitial) !== JSON.stringify(doc.interstitial)) {
        set.interstitial = interstitial;
      }
    }
  }

  if (type === "mottoSection") {
    maybeSet("motto", doc.motto);
  }

  if (type === "aboutIntro" || type === "aboutOffice") {
    maybeSet("heading", doc.heading);
    maybeSetText("body", doc.body);
    maybeSetText("text", doc.text);
    if (doc.image && typeof doc.image === "object") {
      const image = migrateImageField(doc.image as Record<string, unknown>);
      if (JSON.stringify(image) !== JSON.stringify(doc.image)) set.image = image;
    }
    if (Array.isArray(doc.items)) {
      const items = doc.items.map((item) => {
        if (!item || typeof item !== "object") return item;
        const row = { ...(item as Record<string, unknown>) };
        if ("title" in row) row.title = toLocaleString(row.title) ?? row.title;
        if ("body" in row) row.body = toLocaleText(row.body) ?? row.body;
        return row;
      });
      if (JSON.stringify(items) !== JSON.stringify(doc.items)) set.items = items;
    }
  }

  if (type === "siteSettings") {
    maybeSet("siteName", doc.siteName);
    maybeSetText("siteDescription", doc.siteDescription);
    maybeSet("location", doc.location);
    maybeSet("copyright", doc.copyright);
  }

  if (type === "publication") {
    maybeSet("title", doc.title);
    maybeSetText("summary", doc.summary);
    if (doc.image && typeof doc.image === "object") {
      const image = migrateImageField(doc.image as Record<string, unknown>);
      if (JSON.stringify(image) !== JSON.stringify(doc.image)) set.image = image;
    }
  }

  return Object.keys(set).length > 0 ? set : null;
}
