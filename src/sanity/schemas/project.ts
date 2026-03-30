import { defineType, defineField } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Project Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "client",
      title: "Client",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "domain",
      title: "Domain",
      type: "string",
      options: {
        list: [
          { title: "Health & Care", value: "health" },
          { title: "Education", value: "education" },
          { title: "Integration & Migration", value: "integration" },
          { title: "Urban Development", value: "urban" },
          { title: "Climate & Sustainability", value: "climate" },
          { title: "Digital Transformation", value: "digital" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      description: "Short summary (1-2 sentences). Used in cards, tooltips, and network map.",
      rows: 3,
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      validation: (Rule) => Rule.required().min(2010).max(2030),
    }),
    defineField({
      name: "featured",
      title: "Featured Project",
      type: "boolean",
      description: "Featured projects appear larger on the network map and can be expanded.",
      initialValue: false,
    }),
    defineField({
      name: "scale",
      title: "Scale",
      type: "string",
      options: {
        list: [
          { title: "Municipal", value: "municipal" },
          { title: "Regional", value: "regional" },
          { title: "National", value: "national" },
          { title: "International", value: "international" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "methods",
      title: "Methods",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Research", value: "research" },
          { title: "Co-design", value: "codesign" },
          { title: "Implementation", value: "implementation" },
          { title: "Strategy", value: "strategy" },
          { title: "Foresight", value: "foresight" },
        ],
      },
    }),
    defineField({
      name: "innovationLevel",
      title: "Innovation Level",
      type: "string",
      options: {
        list: [
          { title: "Incremental", value: "incremental" },
          { title: "Transformative", value: "transformative" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "gallery",
      title: "Image Gallery",
      type: "array",
      of: [{
        type: "image",
        options: { hotspot: true },
        fields: [
          defineField({
            name: "alt",
            title: "Alt Text",
            type: "string",
          }),
          defineField({
            name: "caption",
            title: "Caption",
            type: "string",
          }),
        ],
      }],
    }),
    defineField({
      name: "challenge",
      title: "The Challenge",
      type: "array",
      of: [{ type: "block" }],
      description: "What problem was the project trying to solve?",
    }),
    defineField({
      name: "approach",
      title: "The Approach",
      type: "array",
      of: [{ type: "block" }],
      description: "How did Comte work on this?",
    }),
    defineField({
      name: "outcome",
      title: "What Changed",
      type: "array",
      of: [{ type: "block" }],
      description: "What was the result? Be honest \u2014 qualitative outcomes are fine.",
    }),
    defineField({
      name: "clientQuote",
      title: "Client Quote",
      type: "object",
      fields: [
        defineField({ name: "text", title: "Quote", type: "text", rows: 3 }),
        defineField({ name: "author", title: "Author", type: "string" }),
        defineField({ name: "role", title: "Role / Title", type: "string" }),
      ],
    }),
    defineField({
      name: "relatedProjects",
      title: "Related Projects",
      type: "array",
      of: [{ type: "reference", to: [{ type: "project" }] }],
      description: "Manually linked related projects. The network map also auto-connects projects that share domains, methods, or scale.",
    }),
    defineField({
      name: "order",
      title: "Sort Order",
      type: "number",
      description: "Lower numbers appear first. Leave empty for default (alphabetical) ordering.",
    }),
  ],
  orderings: [
    { title: "Year (newest)", name: "yearDesc", by: [{ field: "year", direction: "desc" }] },
    { title: "Manual Order", name: "order", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "client",
      media: "heroImage",
    },
  },
});
