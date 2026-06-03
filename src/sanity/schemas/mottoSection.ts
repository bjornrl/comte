import { defineType, defineField } from "sanity";

export const mottoSection = defineType({
  name: "mottoSection",
  title: "Motto",
  type: "document",
  fields: [
    defineField({
      name: "backgroundVideo",
      title: "Background Video",
      type: "file",
      options: { accept: "video/*" },
      description:
        "Optional. When set, replaces the default drifting-lights background. When empty, /lights.html is used.",
    }),
    defineField({
      name: "backgroundColor",
      title: "Background Color (fallback)",
      type: "string",
      description:
        "Hex behind the lights or video. Defaults to #5A7482. Only visible at edges if the background does not fully cover.",
      initialValue: "#5A7482",
    }),
    defineField({
      name: "heroText",
      title: "Hero Text",
      description:
        "The motto shown over the lights. Put each display line on its own line (e.g. \"Design to\" then \"evolve\").",
      type: "localeText",
    }),
    defineField({
      name: "interstitial",
      title: "Interstitial (narrow panel to the left)",
      type: "interstitial",
    }),
  ],
  preview: { prepare: () => ({ title: "Motto" }) },
});
