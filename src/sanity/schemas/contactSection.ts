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
      name: "block3Title",
      title: "Third block – Title",
      type: "localeString",
      description: 'e.g. "Contact"',
    }),
    defineField({
      name: "block3Body",
      title: "Third block – Body",
      type: "localeText",
      description: "Email address or short contact line",
    }),
    defineField({
      name: "interstitial",
      title: "Interstitial (narrow panel to the left)",
      type: "interstitial",
    }),
  ],
  preview: { prepare: () => ({ title: "Contact – Section Settings" }) },
});
