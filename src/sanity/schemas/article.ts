import { defineType, defineField } from "sanity";

export const article = defineType({
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "year",
      title: "Year Published",
      type: "number",
      validation: (Rule) => Rule.required().min(2000).max(2030),
    }),
    defineField({
      name: "forum",
      title: "Forum / Publication",
      type: "string",
      description: "Where was this published? E.g. 'Design Week Norway', 'TechCrunch'",
    }),
    defineField({
      name: "image",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt Text", type: "string" }),
      ],
    }),
    defineField({
      name: "linkType",
      title: "Link Type",
      type: "string",
      options: {
        list: [
          { title: "Internal (blog post on this site)", value: "internal" },
          { title: "External (link to another site)", value: "external" },
        ],
        layout: "radio",
      },
      initialValue: "internal",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "externalUrl",
      title: "External URL",
      type: "url",
      description: "Full URL to the article on an external site.",
      hidden: ({ parent }) => parent?.linkType !== "external",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as any;
          if (parent?.linkType === "external" && !value) return "External URL is required";
          return true;
        }),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      description: "URL slug for the internal blog post. Only used for internal articles.",
      hidden: ({ parent }) => parent?.linkType !== "internal",
    }),
    defineField({
      name: "body",
      title: "Article Body",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Alt Text", type: "string" }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
          ],
        },
      ],
      description: "Full article content. Only used for internal articles.",
      hidden: ({ parent }) => parent?.linkType !== "internal",
    }),
    defineField({
      name: "order",
      title: "Sort Order",
      type: "number",
    }),
  ],
  orderings: [
    { title: "Year (newest)", name: "yearDesc", by: [{ field: "year", direction: "desc" }] },
    { title: "Manual Order", name: "order", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "forum", media: "image" },
  },
});
