import { defineType, defineField } from "sanity";

export const projectsSection = defineType({
  name: "projectsSection",
  title: "Projects – Section Settings",
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
  preview: { prepare: () => ({ title: "Projects – Section Settings" }) },
});
