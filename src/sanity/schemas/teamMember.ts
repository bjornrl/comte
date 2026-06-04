import { defineType, defineField } from "sanity";

export const teamMember = defineType({
  name: "teamMember",
  title: "Team Member",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "localeString",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "localeBlockContent",
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Telephone",
      type: "string",
      description: "Phone number shown alongside email on the responsible block of project cards.",
    }),
    defineField({
      name: "linkedin",
      title: "LinkedIn URL",
      type: "url",
      description: "Link to this person's LinkedIn profile. Shows a LinkedIn icon on their team card.",
    }),
    defineField({
      name: "order",
      title: "Sort Order",
      type: "number",
    }),
  ],
  orderings: [
    { title: "Manual Order", name: "order", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", roleEn: "role.en", roleNo: "role.no", media: "photo" },
    prepare: ({ title, roleEn, roleNo, media }) => ({
      title: title || "Untitled",
      subtitle: roleEn || roleNo || "",
      media,
    }),
  },
});
