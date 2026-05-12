import { defineType, defineField } from "sanity";

export const venturesSection = defineType({
  name: "venturesSection",
  title: "Ventures – Section Settings",
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
  ],
  preview: { prepare: () => ({ title: "Ventures – Section Settings" }) },
});
