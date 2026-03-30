import { defineType, defineField } from "sanity";

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string", initialValue: "Contact" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "address", title: "Address", type: "text" }),
    defineField({ name: "content", title: "Additional Content", type: "array", of: [{ type: "block" }] }),
  ],
});
