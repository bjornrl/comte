import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "siteName", title: "Site Name", type: "localeString" }),
    defineField({ name: "siteDescription", title: "Site Description", type: "localeText" }),
    defineField({ name: "email", title: "Contact Email", type: "string" }),
    defineField({ name: "location", title: "Location", type: "localeString" }),
    defineField({ name: "copyright", title: "Copyright Text", type: "localeString" }),
  ],
});
