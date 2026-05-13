import { defineType, defineField } from "sanity";

export const venturesSection = defineType({
  name: "venturesSection",
  title: "Ventures – Section Settings",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Section Heading",
      type: "string",
    }),
    defineField({
      name: "interstitial",
      title: "Interstitial (narrow panel to the left)",
      type: "interstitial",
    }),
  ],
  preview: { prepare: () => ({ title: "Ventures – Section Settings" }) },
});
