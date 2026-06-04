import { defineType, defineField } from "sanity";
import { PROJECT_METHODS, PROJECT_TAGS } from "./project";

const taxonomyCategoryDefaults = () =>
  PROJECT_TAGS.map((tag) => ({
    _key: tag.value,
    value: tag.value,
    label: { en: tag.title },
  }));

const taxonomyMethodDefaults = () =>
  PROJECT_METHODS.map((method) => ({
    _key: method.value,
    value: method.value,
    label: { en: method.title },
  }));

/**
 * Singleton: English + Norwegian display labels for project categories and
 * methods. Values (`health`, `urban`, …) match project.mainCategory / methods[].
 * Updated from Sanity Studio or via Sheets → "Push all Norwegian rows".
 */
export const projectTaxonomy = defineType({
  name: "projectTaxonomy",
  title: "Project category & method labels",
  type: "document",
  fields: [
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "value",
              title: "Value (do not change)",
              type: "string",
              options: { list: [...PROJECT_TAGS] },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "localeString",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { en: "label.en", no: "label.no", value: "value" },
            prepare: ({ en, no, value }) => ({
              title: en || no || value,
              subtitle: value,
            }),
          },
        },
      ],
      initialValue: taxonomyCategoryDefaults,
    }),
    defineField({
      name: "methods",
      title: "Methods",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "value",
              title: "Value (do not change)",
              type: "string",
              options: { list: [...PROJECT_METHODS] },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "localeString",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { en: "label.en", no: "label.no", value: "value" },
            prepare: ({ en, no, value }) => ({
              title: en || no || value,
              subtitle: value,
            }),
          },
        },
      ],
      initialValue: taxonomyMethodDefaults,
    }),
  ],
  preview: {
    prepare: () => ({ title: "Project category & method labels" }),
  },
});
