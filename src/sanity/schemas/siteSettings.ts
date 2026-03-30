import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "siteName", title: "Site Name", type: "string", initialValue: "Comte Bureau" }),
    defineField({ name: "siteDescription", title: "Site Description", type: "text" }),
    defineField({ name: "email", title: "Contact Email", type: "string" }),
    defineField({ name: "location", title: "Location", type: "string", initialValue: "Oslo, Norway" }),
    defineField({ name: "copyright", title: "Copyright Text", type: "string" }),
  ],
});
