import { defineType, defineField } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({
      name: "heroText",
      title: "Hero Text",
      type: "string",
      initialValue: "Innovation for societal impact",
    }),
    defineField({
      name: "featuredProjects",
      title: "Featured Projects (homepage)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "project" }] }],
      description: "Projects highlighted on the homepage. Order matters.",
      validation: (Rule) => Rule.max(6),
    }),
  ],
});
