import { client } from "@/sanity/lib/client";
import { HOME_QUERY, PROJECTS_QUERY } from "@/sanity/lib/queries";
import { generateConnections } from "@/app/components/projectNetworkData";
import type { Project, Domain, Scale, Method, InnovationLevel } from "@/app/components/projectNetworkData";
import HomePageClient from "@/app/components/HomePageClient";
import { FALLBACK_HERO_TEXT, FALLBACK_PROJECTS } from "@/lib/fallbacks";

export const revalidate = 60;

function mapSanityProject(doc: any): Project {
  return {
    id: doc._id,
    slug: doc.slug,
    name: doc.title,
    client: doc.client,
    domain: (doc.domain ?? "digital") as Domain,
    summary: doc.summary ?? "",
    featured: doc.featured ?? false,
    year: doc.year ?? 2023,
    scale: (doc.scale ?? "municipal") as Scale,
    methods: (doc.methods ?? []) as Method[],
    innovationLevel: (doc.innovationLevel ?? "incremental") as InnovationLevel,
    heroImageUrl: doc.heroImageUrl ?? undefined,
  };
}

export default async function Home() {
  let homeData = null;
  let sanityProjects = null;

  try {
    [homeData, sanityProjects] = await Promise.all([
      client.fetch(HOME_QUERY),
      client.fetch(PROJECTS_QUERY),
    ]);
  } catch {}

  const heroText = homeData?.heroText ?? FALLBACK_HERO_TEXT;
  const projects: Project[] = sanityProjects?.length
    ? sanityProjects.map(mapSanityProject)
    : FALLBACK_PROJECTS;
  const connections = generateConnections(projects);

  return (
    <HomePageClient
      heroText={heroText}
      projects={projects}
      connections={connections}
    />
  );
}
