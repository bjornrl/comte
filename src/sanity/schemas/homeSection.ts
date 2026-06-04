import { defineType, defineField } from "sanity";

export const homeSection = defineType({
  name: "homeSection",
  title: "Home",
  type: "document",
  fields: [
    defineField({
      name: "showInteractiveNetwork",
      title: "Interactive dot network",
      type: "boolean",
      description:
        "When on, the animated dot network appears on the home panel. The landing section has no background video or fill.",
      initialValue: true,
    }),
    defineField({
      name: "interstitial",
      title: "Interstitial (narrow panel to the left)",
      type: "interstitial",
    }),
  ],
  preview: { prepare: () => ({ title: "Home" }) },
});
