import { defineType, defineField } from "sanity";

export const SUPPORTED_LOCALES = [
  { id: "en", title: "English" },
  { id: "no", title: "Norwegian" },
] as const;

export type LocaleId = (typeof SUPPORTED_LOCALES)[number]["id"];
export const DEFAULT_LOCALE: LocaleId = "en";

const groupFields = (innerType: "string" | "text") =>
  SUPPORTED_LOCALES.map((locale) =>
    defineField({
      name: locale.id,
      title: locale.title,
      type: innerType,
    }),
  );

export const localeString = defineType({
  name: "localeString",
  title: "Translated string",
  type: "object",
  fields: groupFields("string"),
  options: { columns: 2 },
});

export const localeText = defineType({
  name: "localeText",
  title: "Translated text",
  type: "object",
  fields: groupFields("text"),
});

export const localeBlockContent = defineType({
  name: "localeBlockContent",
  title: "Translated rich text",
  type: "object",
  fields: SUPPORTED_LOCALES.map((locale) =>
    defineField({
      name: locale.id,
      title: locale.title,
      type: "array",
      of: [{ type: "block" }],
    }),
  ),
});
