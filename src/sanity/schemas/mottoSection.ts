import { defineType, defineField } from "sanity";

export const mottoSection = defineType({
  name: "mottoSection",
  title: "Motto",
  type: "document",
  fields: [
    defineField({
      name: "backgroundColor",
      title: "Background Color",
      type: "string",
      description: "Hex code. Leave empty for default.",
    }),
    defineField({
      name: "heroText",
      title: "Hero Text",
      type: "string",
    }),
  ],
  preview: { prepare: () => ({ title: "Motto" }) },
});
