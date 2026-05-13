import { defineType, defineField } from "sanity";

export const publicationsSection = defineType({
  name: "publicationsSection",
  title: "Publications – Section Settings",
  type: "document",
  fields: [
    defineField({
      name: "backgroundColor",
      title: "Background Color",
      type: "string",
      description: "Hex code. Leave empty for default.",
    }),
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
  preview: { prepare: () => ({ title: "Publications – Section Settings" }) },
});
