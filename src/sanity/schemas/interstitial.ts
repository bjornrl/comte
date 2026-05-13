import { defineType, defineField } from "sanity";

/**
 * Inline object type used by every section singleton. When populated, a
 * narrow parallax panel is rendered to the LEFT of the section in the
 * horizontal scroll. Leave the fields empty for no interstitial.
 *
 * One of text / image / video is rendered (in that fallback order if
 * multiple are set).
 */
export const interstitial = defineType({
  name: "interstitial",
  title: "Interstitial",
  type: "object",
  description: "Optional narrow parallax panel to the left of this section.",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "text",
      title: "Text",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt Text", type: "string" })],
    }),
    defineField({
      name: "video",
      title: "Video",
      type: "file",
      options: { accept: "video/*" },
    }),
    defineField({
      name: "backgroundColor",
      title: "Background Color",
      type: "string",
      description: "Hex code; leave blank for transparent.",
    }),
  ],
});
