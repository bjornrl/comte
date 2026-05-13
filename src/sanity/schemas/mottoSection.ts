import { defineType, defineField } from "sanity";

export const mottoSection = defineType({
  name: "mottoSection",
  title: "Motto",
  type: "document",
  fields: [
    defineField({
      name: "heroText",
      title: "Hero Text",
      type: "string",
    }),
    defineField({
      name: "interstitial",
      title: "Interstitial (narrow panel to the left)",
      type: "interstitial",
    }),
  ],
  preview: { prepare: () => ({ title: "Motto" }) },
});
