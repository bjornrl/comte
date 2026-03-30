import { defineType, defineField } from "sanity";

export const insightsPage = defineType({
  name: "insightsPage",
  title: "Insights Page",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Page Heading",
      type: "string",
      initialValue: "Insights, statistics and resources",
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "text",
      rows: 2,
      initialValue: "The societal challenges we work within. Same people, different lenses.",
    }),
    defineField({
      name: "articlesHeading",
      title: "Articles Section Heading",
      type: "string",
      initialValue: "Vi både skriver ting og blir noen ganger skrevet om. Vi prøver å samle det meste her.",
    }),
  ],
});
