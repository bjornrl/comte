import { defineType, defineField } from "sanity";

export const aboutIntro = defineType({
  name: "aboutIntro",
  title: "Intro",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Section Heading",
      type: "localeString",
      description: "Title above the intro content (same style as the Projects section heading).",
    }),
    defineField({
      name: "video",
      title: "Video (left column)",
      type: "file",
      options: { accept: "video/*" },
      description:
        "Optional. Fills the left media column. When empty, the image below is used instead.",
    }),
    defineField({
      name: "image",
      title: "Image (left column fallback)",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "localeString" })],
      description: "Shown when no video is set. Also used as accessible label for the video.",
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
