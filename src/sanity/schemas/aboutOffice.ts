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
              name: "address",
              title: "Address",
              type: "string",
              description:
                'Street address used to centre the map, e.g. "Pilestredet 31, Oslo, Norway". Looked up server-side via OpenStreetMap.',
            }),
            defineField({
              name: "zoom",
              title: "Map Zoom",
              type: "number",
              initialValue: 14,
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
