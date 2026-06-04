import { defineType, defineField } from "sanity";

export const venturesSection = defineType({
  name: "venturesSection",
  title: "Ventures – Section Settings",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Section Heading",
      type: "localeString",
    }),
    defineField({
      name: "body",
      title: "Body Text",
      type: "localeText",
      description: "Intro paragraph rendered beside the featured media frame.",
    }),
    defineField({
      name: "featuredVideo",
      title: "Featured Video",
      type: "file",
      options: { accept: "video/*" },
      description:
        "Optional. Fills the left media frame. When empty, the featured image is used instead.",
    }),
    defineField({
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "localeString" })],
      description: "Shown in the left media frame when no featured video is set.",
    }),
    defineField({
      name: "interstitial",
      title: "Interstitial (narrow panel to the left)",
      type: "interstitial",
    }),
  ],
  preview: { prepare: () => ({ title: "Ventures – Section Settings" }) },
});
