import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemas";
import { structure } from "./src/sanity/lib/structure";

const SINGLETON_TYPES = new Set([
  "homeSection",
  "mottoSection",
  "aboutIntro",
  "whatWeDo",
  "projectsSection",
  "teamSection",
  "publicationsSection",
  "venturesSection",
  "siteSettings",
]);

export default defineConfig({
  name: "comte-studio",
  title: "Comte Bureau",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  basePath: "/studio",
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: "2024-01-01" }),
  ],
  schema: {
    types: schemaTypes,
    templates: (prev) => prev.filter((t) => !SINGLETON_TYPES.has(t.schemaType)),
  },
  document: {
    actions: (prev, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType)
        ? prev.filter(({ action }) => !["duplicate", "delete", "unpublish"].includes(action ?? ""))
        : prev,
  },
});
