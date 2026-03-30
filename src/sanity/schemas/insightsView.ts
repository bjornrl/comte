import { defineType, defineField } from "sanity";

export const insightsView = defineType({
  name: "insightsView",
  title: "Insights View",
  type: "document",
  fields: [
    defineField({ name: "title", title: "View Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "key", title: "View Key", type: "string", description: "Machine-readable key (e.g., 'byAge', 'bySector'). Must match the code.", validation: (Rule) => Rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", description: "Shown below the dots when this view is active.", rows: 3 }),
    defineField({ name: "order", title: "Sort Order", type: "number" }),
  ],
  orderings: [
    { title: "Manual Order", name: "order", by: [{ field: "order", direction: "asc" }] },
  ],
});
