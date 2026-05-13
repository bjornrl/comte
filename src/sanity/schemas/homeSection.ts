import { defineType, defineField } from "sanity";

export const homeSection = defineType({
  name: "homeSection",
  title: "Home",
  type: "document",
  fields: [
    defineField({
      name: "backgroundVideo",
      title: "Background Video",
      type: "file",
      options: { accept: "video/*" },
    }),
    defineField({
      name: "backgroundColor",
      title: "Background Color (used if no video)",
      type: "string",
      description: "Hex code. Defaults to #1F3A32.",
      initialValue: "#1F3A32",
    }),
    defineField({
      name: "interstitial",
      title: "Interstitial (narrow panel to the left)",
      type: "interstitial",
    }),
  ],
  preview: { prepare: () => ({ title: "Home" }) },
});
