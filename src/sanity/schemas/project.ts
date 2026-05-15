import { defineType, defineField } from "sanity";

export const PROJECT_TAGS = [
  { title: "Health & Care", value: "health" },
  { title: "Inclusion & Participation", value: "integration" },
  { title: "Urban Development", value: "urban" },
  { title: "Climate & Sustainability", value: "climate" },
  { title: "Digital Transformation", value: "digital" },
  { title: "Childhood & Education", value: "education" },
  { title: "Culture", value: "culture" },
  { title: "Policy", value: "policy" },
] as const;

export const PROJECT_SCALES = [
  { title: "Municipal", value: "municipal" },
  { title: "Regional", value: "regional" },
  { title: "National", value: "national" },
  { title: "International", value: "international" },
] as const;

export const PROJECT_METHODS = [
  { title: "Research", value: "research" },
  { title: "Co-design", value: "codesign" },
  { title: "Implementation", value: "implementation" },
  { title: "Strategy", value: "strategy" },
  { title: "Foresight", value: "foresight" },
] as const;

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  groups: [
    { name: "main", title: "Project", default: true },
    { name: "internal", title: "Internal (presentation)" },
    { name: "legacy", title: "Legacy" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "main",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "main",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      group: "main",
      validation: (Rule) => Rule.required().min(2000).max(2100),
    }),
    defineField({
      name: "summary",
      title: "Description",
      type: "text",
      group: "main",
      rows: 4,
      description: "Short description shown on the project card.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customers",
      title: "Customer(s)",
      type: "array",
      group: "main",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description:
        'One entry per customer. Multiple customers render with a dot separator on the card (e.g. "NAV · Trondheim Kommune").',
    }),
    defineField({
      name: "responsible",
      title: "Responsible (from Comte)",
      type: "reference",
      group: "main",
      to: [{ type: "teamMember" }],
      description:
        "The team member who leads this project. Their photo, email, and phone are surfaced on the card.",
    }),
    defineField({
      name: "allCategories",
      title: "Categories",
      type: "array",
      group: "main",
      of: [{ type: "string", options: { list: [...PROJECT_TAGS] } }],
      options: { layout: "tags" },
      description:
        "Ordered list of categories. The FIRST entry is the project's primary category — it drives the dot colour and the cluster the project sits in on the network map. Additional entries render as outlined chips on the card and create cross-cluster connector lines to projects that share them.",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "scale",
      title: "Scale",
      type: "string",
      group: "main",
      options: { list: [...PROJECT_SCALES] },
      description: "Geographic scale of the project.",
    }),
    defineField({
      name: "methods",
      title: "Method",
      type: "array",
      group: "main",
      of: [{ type: "string", options: { list: [...PROJECT_METHODS] } }],
      options: { layout: "tags" },
      description: "One or more methods used on this project.",
    }),
    defineField({
      name: "gallery",
      title: "Photos",
      type: "array",
      group: "main",
      description: "Ordered photos. The first is shown first; chevrons flip through within the card.",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Alt Text", type: "string" }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
          ],
        },
      ],
    }),
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      group: "main",
      description: "Auxiliary links rendered below the responsible block.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: { select: { title: "label", subtitle: "url" } },
        },
      ],
    }),
    defineField({
      name: "order",
      title: "Sort Order",
      type: "number",
      group: "main",
      description: "Lower numbers appear first. Leave empty for default ordering by year.",
    }),
    defineField({
      name: "presentationData",
      title: "Presentation Data",
      type: "object",
      group: "internal",
      description: "Extra fields used by the internal presentation generator.",
      fields: [
        defineField({
          name: "stat1",
          title: "Stat 1",
          type: "string",
          description: 'Key statistic, e.g. "40+ unge menn som fikk hjelp"',
        }),
        defineField({ name: "stat2", title: "Stat 2", type: "string" }),
        defineField({
          name: "bulletPoints",
          title: "Bullet Points",
          type: "array",
          of: [{ type: "string" }],
          validation: (Rule) => Rule.max(3),
        }),
        defineField({ name: "location", title: "Location", type: "string" }),
        defineField({ name: "industry", title: "Industry", type: "string" }),
      ],
    }),
    // ---------- Legacy fields (pre-sheet sync) ----------
    // Kept for backward compatibility so existing documents don't lose data
    // while the sheet ↔ Sanity sync is being wired up. The page mapper falls
    // back to these when the new fields are empty.
    defineField({
      name: "client",
      title: "Customer (legacy single field)",
      type: "string",
      group: "legacy",
      description: "Replaced by the multi-value `customers` field. Kept so existing docs still render.",
    }),
    defineField({
      name: "tags",
      title: "Tags (legacy)",
      type: "array",
      group: "legacy",
      of: [{ type: "string" }],
      options: { list: [...PROJECT_TAGS] },
      description: "Replaced by `allCategories`. Kept so older docs still resolve a colour.",
    }),
  ],
  orderings: [
    { title: "Year (newest)", name: "yearDesc", by: [{ field: "year", direction: "desc" }] },
    { title: "Manual Order", name: "order", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "customers.0",
      media: "gallery.0",
    },
  },
});
