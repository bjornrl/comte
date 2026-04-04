import { defineType, defineField } from "sanity";

export const resource = defineType({
  name: "resource",
  title: "Resource",
  type: "document",
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
      name: "subtitle",
      title: "Subtitle",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
      description: "Full description shown on the resource detail page.",
    }),
    defineField({
      name: "meta",
      title: "Meta Label",
      type: "string",
      description: "E.g. 'Template', 'Toolkit', 'Guide', 'Checklist'",
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
      name: "actionType",
      title: "Action Type",
      type: "string",
      options: {
        list: [
          { title: "Download (file)", value: "download" },
          { title: "Inquiry (send email)", value: "inquiry" },
        ],
        layout: "radio",
      },
      initialValue: "download",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "file",
      title: "Downloadable File",
      type: "file",
      description: "Upload a PDF, document, or other file. Only used when Action Type is 'Download'.",
      hidden: ({ parent }) => parent?.actionType !== "download",
    }),
    defineField({
      name: "inquiryEmail",
      title: "Inquiry Email Address",
      type: "string",
      description: "Email to send inquiries to. Only used when Action Type is 'Inquiry'. Defaults to contact@comte.no.",
      hidden: ({ parent }) => parent?.actionType !== "inquiry",
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
    select: { title: "title", subtitle: "meta", media: "image" },
  },
});
