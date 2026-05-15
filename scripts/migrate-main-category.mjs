#!/usr/bin/env node
/**
 * One-shot migration: copy each project's `mainCategory` into `allCategories[0]`
 * (idempotent — only patches docs whose allCategories is missing the main one).
 *
 *   SANITY_TOKEN=<editor-or-write-token> node scripts/migrate-main-category.mjs [--dry-run]
 *
 * The token is the same one used by the Apps Script sync (Script Properties →
 * SANITY_TOKEN). Project + dataset are read from .env.local automatically.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
try {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const TOKEN = process.env.SANITY_TOKEN;
const DRY = process.argv.includes("--dry-run");

if (!PROJECT_ID) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID (set in .env.local).");
  process.exit(1);
}
if (!TOKEN) {
  console.error("Missing SANITY_TOKEN env var. Run as: SANITY_TOKEN=... node scripts/migrate-main-category.mjs");
  process.exit(1);
}

const API = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01`;

async function groq(query) {
  const url = `${API}/data/query/${DATASET}?query=${encodeURIComponent(query)}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!r.ok) throw new Error(`Query failed (${r.status}): ${await r.text()}`);
  return (await r.json()).result;
}

async function mutate(mutations) {
  const r = await fetch(`${API}/data/mutate/${DATASET}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
  if (!r.ok) throw new Error(`Mutate failed (${r.status}): ${await r.text()}`);
  return r.json();
}

const docs = await groq(
  `*[_type == "project" && defined(mainCategory) && (!defined(allCategories) || !(mainCategory in allCategories))]{
    _id, title, mainCategory, allCategories
  }`,
);

if (docs.length === 0) {
  console.log("Nothing to migrate — every project's allCategories already includes its mainCategory.");
  process.exit(0);
}

console.log(`Found ${docs.length} project(s) to patch:\n`);
for (const d of docs) {
  const next = [d.mainCategory, ...(d.allCategories ?? []).filter((c) => c !== d.mainCategory)];
  console.log(`  ${d._id}  ${JSON.stringify(d.allCategories ?? null)} → ${JSON.stringify(next)}   (${d.title})`);
}

if (DRY) {
  console.log("\n--dry-run set; no changes applied.");
  process.exit(0);
}

const mutations = docs.map((d) => ({
  patch: {
    id: d._id,
    set: { allCategories: [d.mainCategory, ...(d.allCategories ?? []).filter((c) => c !== d.mainCategory)] },
  },
}));

const result = await mutate(mutations);
console.log(`\nPatched ${result.results?.length ?? mutations.length} document(s).`);
