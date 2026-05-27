import { defineType, defineField } from "sanity";

export const publicationsSection = defineType({
  name: "publicationsSection",
  title: "Publications – Section Settings",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Section Heading",
      type: "string",
    }),
    defineField({
      name: "body",
      title: "Body Text",
      type: "text",
      rows: 6,
      description: "Intro paragraph rendered to the left of the publications grid.",
    }),
    defineField({
      name: "interstitial",
      title: "Interstitial (narrow panel to the left)",
      type: "interstitial",
    }),
  ],
  preview: { prepare: () => ({ title: "Publications – Section Settings" }) },
});
