import { defineType, defineField } from "sanity";

export const contactSection = defineType({
  name: "contactSection",
  title: "Contact – Section Settings",
  type: "document",
  fields: [
    defineField({
      name: "block1Title",
      title: "First block – Title",
      type: "string",
      initialValue: "Get in touch",
    }),
    defineField({
      name: "block1Body",
      title: "First block – Body",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "block2Title",
      title: "Second block – Title",
      type: "string",
      initialValue: "Where to find us",
    }),
    defineField({
      name: "block2Body",
      title: "Second block – Body",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "interstitial",
      title: "Interstitial (narrow panel to the left)",
      type: "interstitial",
    }),
  ],
  preview: { prepare: () => ({ title: "Contact – Section Settings" }) },
});
