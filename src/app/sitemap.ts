import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://comte.no";

const SLUGS_QUERY = `{
  "projects": *[_type == "project" && defined(slug.current)].slug.current,
  "publications": *[_type == "publication" && defined(slug.current)].slug.current
}`;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let projects: string[] = [];
  let publications: string[] = [];
  try {
    const data = await client.fetch<{
      projects: string[];
      publications: string[];
    }>(SLUGS_QUERY);
    projects = data?.projects ?? [];
    publications = data?.publications ?? [];
  } catch {
    // Fall back to just the static routes if Sanity is unreachable at build.
  }

  const now = new Date();

  // Emit both the English (bare) and Norwegian (/no) variants of every route.
  const entry = (path: string): MetadataRoute.Sitemap => [
    { url: `${SITE_URL}${path}`, lastModified: now },
    { url: `${SITE_URL}/no${path === "/" ? "" : path}`, lastModified: now },
  ];

  return [
    ...entry("/"),
    ...projects.flatMap((slug) => entry(`/projects/${slug}`)),
    ...publications.flatMap((slug) => entry(`/publications/${slug}`)),
  ];
}
