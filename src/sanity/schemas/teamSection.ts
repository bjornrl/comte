import { defineType, defineField } from "sanity";

export const teamSection = defineType({
  name: "teamSection",
  title: "Team – Section Settings",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Section Heading",
      type: "localeString",
    }),
    defineField({
      name: "interstitial",
      title: "Interstitial (narrow panel to the left)",
      type: "interstitial",
    }),
    defineField({
      name: "carouselVideos",
      title: "Video Carousel",
      type: "array",
      description:
        "Clips shown in the rolling column on the right of the team grid. Each frame matches the ventures image carousel size (18vw × 40vh) and loops.",
      of: [
        {
          type: "object",
          name: "carouselVideoItem",
          fields: [
            defineField({
              name: "video",
              title: "Video",
              type: "file",
              options: { accept: "video/*" },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "label",
              title: "Label (optional)",
              type: "string",
              description: "For reference in Sanity only — not shown on the site.",
            }),
          ],
          preview: {
            select: { title: "label", media: "video" },
            prepare({ title, media }) {
              return { title: title || "Carousel video", media };
            },
          },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Team – Section Settings" }) },
});
