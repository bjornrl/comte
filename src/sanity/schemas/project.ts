import { defineType, defineField } from "sanity";

export const PROJECT_TAGS = [
  { title: "Education", value: "education" },
  { title: "Health & Care", value: "health" },
  { title: "Climate & Sustainability", value: "climate" },
  { title: "Digital Transformation", value: "digital" },
  { title: "Urban Development", value: "urban" },
  { title: "Integration & Migration", value: "integration" },
  { title: "Culture", value: "culture" },
] as const;

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  groups: [
    { name: "main", title: "Project", default: true },
    { name: "internal", title: "Internal (presentation)" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Project Title",
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
      name: "client",
      title: "Customer",
      type: "string",
      group: "main",
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
      description: "Shown stacked in the bottom-left of the project card.",
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
      name: "tags",
      title: "Tags",
      type: "array",
      group: "main",
      of: [{ type: "string" }],
      options: {
        list: [...PROJECT_TAGS],
      },
      description: "Used to colour the dot on the map and group related projects.",
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
  ],
  orderings: [
    { title: "Year (newest)", name: "yearDesc", by: [{ field: "year", direction: "desc" }] },
    { title: "Manual Order", name: "order", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "client",
      media: "gallery.0",
    },
  },
});
