/**
 * One-time migration: convert legacy plain-string CMS values to locale objects.
 *
 * Usage:
 *   SANITY_API_WRITE_TOKEN=... node scripts/migrate-locale-fields.mjs
 *   SANITY_API_WRITE_TOKEN=... node scripts/migrate-locale-fields.mjs --dry-run
 *
 * Requires NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET
 * (loads from .env.local when present).
 */

import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@sanity/client";

const DRY_RUN = process.argv.includes("--dry-run");

function loadEnvLocal() {
  const path = new URL("../.env.local", import.meta.url);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN (or SANITY_TOKEN).",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

const DEFAULT_LOCALE = "en";

function isLocaleObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return typeof value.en === "string" || typeof value.no === "string";
}

function toLocaleString(value) {
  if (value == null) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return { [DEFAULT_LOCALE]: trimmed };
  }
  if (isLocaleObject(value)) {
    const next = {};
    if (typeof value.en === "string") next.en = value.en;
    if (typeof value.no === "string") next.no = value.no;
    return next;
  }
  return undefined;
}

function toLocaleText(value) {
  return toLocaleString(value);
}

function migrateGalleryItem(item) {
  const next = { ...item };
  if ("alt" in next) next.alt = toLocaleString(next.alt) ?? next.alt;
  if ("caption" in next) next.caption = toLocaleString(next.caption) ?? next.caption;
  return next;
}

function migrateLinkItem(item) {
  const next = { ...item };
  if ("label" in next) next.label = toLocaleString(next.label) ?? next.label;
  return next;
}

function migrateDatapoint(item) {
  const next = { ...item };
  if ("value" in next) next.value = toLocaleString(next.value) ?? next.value;
  if ("label" in next) next.label = toLocaleString(next.label) ?? next.label;
  return next;
}

function migrateInterstitial(item) {
  const next = { ...item };
  if ("text" in next) next.text = toLocaleText(next.text) ?? next.text;
  if ("alt" in next) next.alt = toLocaleString(next.alt) ?? next.alt;
  return next;
}

function migrateImageField(item) {
  const next = { ...item };
  if ("alt" in next) next.alt = toLocaleString(next.alt) ?? next.alt;
  return next;
}

function buildLocaleMigrationPatch(doc) {
  const set = {};
  const type = doc._type;

  const maybeSet = (key, value) => {
    const converted = toLocaleString(value);
    if (converted !== undefined && converted !== value) set[key] = converted;
  };

  const maybeSetText = (key, value) => {
    const converted = toLocaleText(value);
    if (converted !== undefined && converted !== value) set[key] = converted;
  };

  if (type === "project") {
    maybeSet("title", doc.title);
    maybeSetText("summary", doc.summary);
    if (Array.isArray(doc.gallery)) {
      const gallery = doc.gallery.map((item) =>
        item && typeof item === "object" ? migrateGalleryItem(item) : item,
      );
      if (JSON.stringify(gallery) !== JSON.stringify(doc.gallery)) set.gallery = gallery;
    }
    if (Array.isArray(doc.links)) {
      const links = doc.links.map((item) =>
        item && typeof item === "object" ? migrateLinkItem(item) : item,
      );
      if (JSON.stringify(links) !== JSON.stringify(doc.links)) set.links = links;
    }
  }

  if (type === "teamMember") maybeSet("role", doc.role);

  if (type === "venture") {
    maybeSet("title", doc.title);
    maybeSetText("description", doc.description);
    if (doc.image && typeof doc.image === "object") {
      const image = migrateImageField(doc.image);
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
        const point = migrateDatapoint(doc[key]);
        if (JSON.stringify(point) !== JSON.stringify(doc[key])) set[key] = point;
      }
    }
    if (doc.interstitial && typeof doc.interstitial === "object") {
      const interstitial = migrateInterstitial(doc.interstitial);
      if (JSON.stringify(interstitial) !== JSON.stringify(doc.interstitial)) {
        set.interstitial = interstitial;
      }
    }
  }

  if (type === "mottoSection") maybeSet("motto", doc.motto);

  if (type === "aboutIntro" || type === "aboutOffice") {
    maybeSet("heading", doc.heading);
    maybeSetText("body", doc.body);
    maybeSetText("text", doc.text);
    if (doc.image && typeof doc.image === "object") {
      const image = migrateImageField(doc.image);
      if (JSON.stringify(image) !== JSON.stringify(doc.image)) set.image = image;
    }
    if (Array.isArray(doc.items)) {
      const items = doc.items.map((item) => {
        if (!item || typeof item !== "object") return item;
        const row = { ...item };
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
      const image = migrateImageField(doc.image);
      if (JSON.stringify(image) !== JSON.stringify(doc.image)) set.image = image;
    }
  }

  return Object.keys(set).length > 0 ? set : null;
}

const QUERY = `*[
  _type in [
    "project", "teamMember", "venture", "publication",
    "publicationsSection", "venturesSection", "projectsSection", "teamSection",
    "whatWeDo", "mottoSection", "aboutIntro", "aboutOffice", "contactSection", "siteSettings"
  ]
]`;

const docs = await client.fetch(QUERY);
let patched = 0;
let skipped = 0;

for (const doc of docs) {
  const patch = buildLocaleMigrationPatch(doc);
  if (!patch) {
    skipped++;
    continue;
  }

  const targetId = String(doc._id);

  if (DRY_RUN) {
    console.log(`[dry-run] ${targetId}`, Object.keys(patch));
    patched++;
    continue;
  }

  await client.patch(targetId).set(patch).commit({ autoGenerateArrayKeys: true });
  console.log(`patched ${targetId}`, Object.keys(patch));
  patched++;
}

console.log(
  `${DRY_RUN ? "Would patch" : "Patched"} ${patched} document(s); skipped ${skipped}.`,
);
