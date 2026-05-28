import { defineType, defineField } from "sanity";

export const aboutIntro = defineType({
  name: "aboutIntro",
  title: "Intro",
  type: "document",
  fields: [
    defineField({
      name: "image",
      title: "Image (left ~60%)",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "localeString" })],
    }),
    defineField({
      name: "whoIsComteTitle",
      title: "Who is Comte – Title",
      type: "localeString",
    }),
    defineField({
      name: "whoIsComte",
      title: "Who is Comte – Body",
      type: "localeText",
    }),
    defineField({
      name: "whoAreWeTitle",
      title: "Who are we – Title",
      type: "localeString",
    }),
    defineField({
      name: "whoAreWe",
      title: "Who are we – Body",
      type: "localeText",
    }),
    defineField({
      name: "interstitial",
      title: "Interstitial (narrow panel to the left)",
      type: "interstitial",
    }),
  ],
  preview: { prepare: () => ({ title: "Intro" }) },
});
