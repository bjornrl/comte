import { defineType, defineField } from "sanity";

export const teamSection = defineType({
  name: "teamSection",
  title: "Team – Section Settings",
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
  preview: { prepare: () => ({ title: "Team – Section Settings" }) },
});
