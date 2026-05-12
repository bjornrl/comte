import { defineType, defineField } from "sanity";

export const aboutIntro = defineType({
  name: "aboutIntro",
  title: "Intro",
  type: "document",
  fields: [
    defineField({
      name: "backgroundColor",
      title: "Background Color",
      type: "string",
      description: "Hex code, e.g. #1F3A32. Leave empty for default.",
    }),
    defineField({
      name: "image",
      title: "Image (left ~60%)",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
    }),
    defineField({
      name: "whoIsComteTitle",
      title: "Who is Comte – Title",
      type: "string",
      initialValue: "Who is Comte",
    }),
    defineField({
      name: "whoIsComte",
      title: "Who is Comte – Body",
      type: "text",
      rows: 6,
    }),
    defineField({
      name: "whoAreWeTitle",
      title: "Who are we – Title",
      type: "string",
      initialValue: "Who are we",
    }),
    defineField({
      name: "whoAreWe",
      title: "Who are we – Body",
      type: "text",
      rows: 6,
    }),
  ],
  preview: { prepare: () => ({ title: "Intro" }) },
});
