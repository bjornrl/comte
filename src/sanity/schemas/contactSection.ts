import { defineType, defineField } from "sanity";

export const contactSection = defineType({
  name: "contactSection",
  title: "Contact – Section Settings",
  type: "document",
  fields: [
    defineField({
      name: "block1Title",
      title: "First block – Title",
      type: "localeString",
    }),
    defineField({
      name: "block1Body",
      title: "First block – Body",
      type: "localeText",
    }),
    defineField({
      name: "block2Title",
      title: "Second block – Title",
      type: "localeString",
    }),
    defineField({
      name: "block2Body",
      title: "Second block – Body",
      type: "localeText",
    }),
    defineField({
      name: "interstitial",
      title: "Interstitial (narrow panel to the left)",
      type: "interstitial",
    }),
  ],
  preview: { prepare: () => ({ title: "Contact – Section Settings" }) },
});
