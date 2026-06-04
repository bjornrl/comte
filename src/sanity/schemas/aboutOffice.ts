import { defineType, defineField } from "sanity";

/**
 * Singleton holding the office-location blocks rendered on the mobile
 * contact section. Two slots, "Norway" + "Portugal" by convention. Titles
 * and descriptions are localized so the headings translate between
 * English / Norwegian; addresses themselves stay un-translated since
 * proper street/place names don't change between languages.
 */
export const aboutOffice = defineType({
  name: "aboutOffice",
  title: "Offices",
  type: "document",
  fields: [
    defineField({
      name: "locations",
      title: "Locations",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "localeString",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "address",
              title: "Address (one line)",
              type: "string",
            }),
            defineField({
              name: "description",
              title: "Description (multi-line)",
              type: "localeText",
            }),
            defineField({
              name: "zoom",
              title: "Map zoom",
              type: "number",
            }),
          ],
          preview: {
            select: { en: "title.en", no: "title.no" },
            prepare: ({ en, no }) => ({ title: en || no || "Office" }),
          },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Offices" }) },
});
