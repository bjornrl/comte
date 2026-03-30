import { defineType, defineField } from "sanity";

export const howWeWorkPage = defineType({
  name: "howWeWorkPage",
  title: "How We Work Page",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Page Heading",
      type: "string",
      initialValue: "How we work",
    }),
    defineField({
      name: "intro",
      title: "Intro Text",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "capabilities",
      title: "Capabilities",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "title", title: "Capability Title", type: "string" }),
          defineField({ name: "description", title: "Description", type: "array", of: [{ type: "block" }] }),
        ],
        preview: { select: { title: "title" } },
      }],
    }),
    defineField({
      name: "processSteps",
      title: "Process Steps",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "title", title: "Step Title", type: "string" }),
          defineField({ name: "description", title: "Description", type: "text" }),
        ],
        preview: { select: { title: "title" } },
      }],
    }),
  ],
});
