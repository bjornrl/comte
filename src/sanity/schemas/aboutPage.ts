import { defineType, defineField } from "sanity";

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Page Heading",
      type: "string",
      initialValue: "About Comte",
    }),
    defineField({
      name: "intro",
      title: "Intro Text",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alt Text", type: "string" }),
      ],
    }),
    defineField({
      name: "sections",
      title: "Content Sections",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "heading", title: "Section Heading", type: "string" }),
          defineField({ name: "body", title: "Section Body", type: "array", of: [{ type: "block" }] }),
          defineField({
            name: "image",
            title: "Section Image",
            type: "image",
            options: { hotspot: true },
            fields: [
              defineField({ name: "alt", title: "Alt Text", type: "string" }),
            ],
          }),
        ],
        preview: {
          select: { title: "heading" },
        },
      }],
    }),
    defineField({
      name: "teamHeading",
      title: "Team Section Heading",
      type: "string",
      initialValue: "Our team consists of designers, architects, doctors, psychologists, developers, thinkers and innovators.",
    }),
  ],
});
