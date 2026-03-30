import { defineType, defineField } from "sanity";

export const serviceCategory = defineType({
  name: "serviceCategory",
  title: "Service Category",
  type: "document",
  description:
    "Service categories used in the presentation generator (e.g. Strategi, Innsikt, Tjenestedesign)",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "blurb",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Short description shown on the category slide",
    }),
    defineField({
      name: "expertise",
      title: "Expertise Areas",
      type: "array",
      of: [{ type: "string" }],
      description: "List of expertise items shown on the expertise slide (max 8)",
      validation: (Rule) => Rule.max(8),
    }),
    defineField({
      name: "stats",
      title: "Statistics",
      type: "array",
      of: [{ type: "string" }],
      description:
        'Stats like "50+ prosjekter", "20 års erfaring". Format: "NUMBER TEXT"',
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: "statsTitle",
      title: "Stats Title",
      type: "string",
      description:
        'Headline for the stats slide, e.g. "Over 20 years of experience"',
    }),
    defineField({
      name: "statsDescription",
      title: "Stats Description",
      type: "text",
      rows: 2,
      description: "Optional subtext below the stats title",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
      description: "Image shown on the category slide",
    }),
    defineField({
      name: "order",
      title: "Sort Order",
      type: "number",
    }),
  ],
  orderings: [
    {
      title: "Sort Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
