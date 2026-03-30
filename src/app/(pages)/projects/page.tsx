import { client } from "@/sanity/lib/client";
import { PROJECTS_QUERY } from "@/sanity/lib/queries";
import { generateConnections } from "@/app/components/projectNetworkData";
import type { Project, Domain, Scale, Method, InnovationLevel } from "@/app/components/projectNetworkData";
import ProjectsPageClient from "@/app/components/ProjectsPageClient";
import { FALLBACK_PROJECTS } from "@/lib/fallbacks";

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
  };
}

export default async function ProjectsPage() {
  let sanityProjects = null;
  try {
    sanityProjects = await client.fetch(PROJECTS_QUERY);
  } catch {}

  const projects: Project[] = sanityProjects?.length
    ? sanityProjects.map(mapSanityProject)
    : FALLBACK_PROJECTS;
  const connections = generateConnections(projects);

  return <ProjectsPageClient projects={projects} connections={connections} />;
}
