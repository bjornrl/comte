import { defineType, defineField } from "sanity";

export const teamSection = defineType({
  name: "teamSection",
  title: "Team – Section Settings",
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
  preview: { prepare: () => ({ title: "Team – Section Settings" }) },
});
