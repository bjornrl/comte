import { defineType, defineField } from "sanity";

export const aboutOffice = defineType({
  name: "aboutOffice",
  title: "Office",
  type: "document",
  fields: [
    defineField({
      name: "locations",
      title: "Office Locations",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 4,
            }),
            defineField({
              name: "longitude",
              title: "Longitude",
              type: "number",
              description: "Map centre longitude, e.g. 10.7361 for Oslo",
            }),
            defineField({
              name: "latitude",
              title: "Latitude",
              type: "number",
              description: "Map centre latitude, e.g. 59.9202 for Oslo",
            }),
            defineField({
              name: "zoom",
              title: "Map Zoom",
              type: "number",
              initialValue: 12,
            }),
          ],
          preview: { select: { title: "title" } },
        },
      ],
    }),
    defineField({
      name: "interstitial",
      title: "Interstitial (narrow panel to the left)",
      type: "interstitial",
    }),
  ],
  preview: { prepare: () => ({ title: "Office" }) },
});
