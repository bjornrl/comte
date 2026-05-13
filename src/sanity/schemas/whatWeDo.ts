import { defineType, defineField } from "sanity";

const datapoint = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      defineField({ name: "value", title: "Value", type: "string", description: 'e.g. "250+"' }),
      defineField({
        name: "label",
        title: "Label",
        type: "string",
        description: 'e.g. "Projects completed"',
      }),
    ],
  });

export const whatWeDo = defineType({
  name: "whatWeDo",
  title: "What do we do?",
  type: "document",
  fields: [
    defineField({
      name: "backgroundColor",
      title: "Background Color",
      type: "string",
      description: "Hex code. Leave empty for default.",
    }),
    defineField({
      name: "textbox",
      title: "Textbox",
      type: "text",
      rows: 6,
    }),
    datapoint("datapoint1", "Datapoint 1"),
    datapoint("datapoint2", "Datapoint 2"),
    datapoint("datapoint3", "Datapoint 3"),
    defineField({
      name: "interstitial",
      title: "Interstitial (narrow panel to the left)",
      type: "interstitial",
    }),
  ],
  preview: { prepare: () => ({ title: "What do we do?" }) },
});
