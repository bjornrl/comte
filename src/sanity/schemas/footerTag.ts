import { defineType, defineField } from "sanity";

export const footerTag = defineType({
  name: "footerTag",
  title: "Footer Tag",
  type: "document",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Capability", value: "capability" },
          { title: "Domain", value: "domain" },
          { title: "Value", value: "value" },
        ],
      },
    }),
    defineField({ name: "color", title: "Color (hex)", type: "string", description: "e.g., #1F3A32" }),
    defineField({ name: "order", title: "Sort Order", type: "number" }),
  ],
  orderings: [
    { title: "Manual Order", name: "order", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "label", subtitle: "category" },
  },
});
