import { defineType, defineField } from "sanity";

export const publication = defineType({
  name: "publication",
  title: "Publication",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localeString",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title.en", maxLength: 96 },
      description:
        "URL of the publication detail page. Shared across languages — generated from the English title.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "localeString" })],
    }),
    defineField({
      name: "description",
      title: "Short description",
      type: "localeText",
      description: "Shown on the publications grid and detail page intro.",
    }),
    defineField({
      name: "body",
      title: "Long-form content",
      type: "localeBlockContent",
      description: "Optional long-form text shown on the detail page.",
    }),
    defineField({
      name: "pricing",
      title: "Pricing",
      type: "string",
      options: {
        list: [
          { title: "Free", value: "free" },
          { title: "Paid", value: "paid" },
        ],
        layout: "radio",
      },
      description:
        "Free publications offer a direct download. Paid ones route through Stripe checkout. Leave empty for an automatic 50/50 fallback during setup.",
    }),
    defineField({
      name: "price",
      title: "Price (NOK)",
      type: "number",
      description:
        "Whole-krone price shown to buyers. Ignored when pricing is Free.",
      hidden: ({ parent }) => parent?.pricing !== "paid",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "pdfFile",
      title: "PDF file",
      type: "file",
      options: { accept: "application/pdf" },
      description:
        "Direct download for free publications, or unlock for paid buyers after checkout.",
    }),
    defineField({
      name: "order",
      title: "Sort Order",
      type: "number",
    }),
  ],
  orderings: [
    { title: "Manual Order", name: "order", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { en: "title.en", no: "title.no", subtitle: "pricing", media: "image" },
    prepare: ({ en, no, subtitle, media }) => ({
      title: en || no || "Untitled",
      subtitle: subtitle ? subtitle.toUpperCase() : "—",
      media,
    }),
  },
});
