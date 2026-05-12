import { client } from "@/sanity/lib/client";
import {
  HOME_SECTION_QUERY,
  MOTTO_SECTION_QUERY,
  ABOUT_INTRO_QUERY,
  ABOUT_OFFICE_QUERY,
  WHAT_WE_DO_QUERY,
  PROJECTS_SECTION_QUERY,
  TEAM_SECTION_QUERY,
  PUBLICATIONS_SECTION_QUERY,
  VENTURES_SECTION_QUERY,
  PROJECTS_QUERY,
  TEAM_QUERY,
  PUBLICATIONS_QUERY,
  VENTURES_QUERY,
} from "@/sanity/lib/queries";
import { firstTagAsDomain, generateConnections } from "@/app/components/projectNetworkData";
import type { Project } from "@/app/components/projectNetworkData";
import HomePageClient, { type HomeData } from "@/app/components/HomePageClient";
import { urlFor } from "@/sanity/lib/image";
import { FALLBACK_PROJECTS } from "@/lib/fallbacks";

export const revalidate = 60;

function sanityImageUrl(imageField: any, width = 1600): string | undefined {
  if (!imageField?.asset) return undefined;
  return urlFor(imageField).width(width).auto("format").quality(80).url();
}

function mapSanityProject(doc: any): Project {
  return {
    id: doc._id,
    slug: doc.slug,
    name: doc.title,
    client: doc.client,
    domain: firstTagAsDomain(doc.tags),
    summary: doc.summary ?? "",
    featured: false,
    year: doc.year ?? new Date().getFullYear(),
    scale: "municipal",
    methods: [],
    innovationLevel: "incremental",
    heroImageUrl: doc.heroImageUrl ?? undefined,
  };
}

export default async function Home() {
  let home: any = null;
  let motto: any = null;
  let aboutIntro: any = null;
  let aboutOffice: any = null;
  let whatWeDo: any = null;
  let projectsSection: any = null;
  let teamSection: any = null;
  let publicationsSection: any = null;
  let venturesSection: any = null;
  let sanityProjects: any[] | null = null;
  let team: any[] | null = null;
  let publications: any[] | null = null;
  let ventures: any[] | null = null;

  try {
    [
      home,
      motto,
      aboutIntro,
      aboutOffice,
      whatWeDo,
      projectsSection,
      teamSection,
      publicationsSection,
      venturesSection,
      sanityProjects,
      team,
      publications,
      ventures,
    ] = await Promise.all([
      client.fetch(HOME_SECTION_QUERY),
      client.fetch(MOTTO_SECTION_QUERY),
      client.fetch(ABOUT_INTRO_QUERY),
      client.fetch(ABOUT_OFFICE_QUERY),
      client.fetch(WHAT_WE_DO_QUERY),
      client.fetch(PROJECTS_SECTION_QUERY),
      client.fetch(TEAM_SECTION_QUERY),
      client.fetch(PUBLICATIONS_SECTION_QUERY),
      client.fetch(VENTURES_SECTION_QUERY),
      client.fetch(PROJECTS_QUERY),
      client.fetch(TEAM_QUERY),
      client.fetch(PUBLICATIONS_QUERY),
      client.fetch(VENTURES_QUERY),
    ]);
  } catch {}

  const projects: Project[] = sanityProjects?.length
    ? sanityProjects.map(mapSanityProject)
    : FALLBACK_PROJECTS;
  const connections = generateConnections(projects);

  const data: HomeData = {
    home: {
      heroText: home?.heroText,
      backgroundColor: home?.backgroundColor,
      backgroundVideoUrl: home?.backgroundVideoUrl,
    },
    motto: {
      heroText: motto?.heroText,
      backgroundColor: motto?.backgroundColor,
    },
    aboutIntro: {
      backgroundColor: aboutIntro?.backgroundColor,
      imageUrl: sanityImageUrl(aboutIntro?.image),
      imageAlt: aboutIntro?.image?.alt,
      whoIsComteTitle: aboutIntro?.whoIsComteTitle,
      whoIsComte: aboutIntro?.whoIsComte,
      whoAreWeTitle: aboutIntro?.whoAreWeTitle,
      whoAreWe: aboutIntro?.whoAreWe,
    },
    aboutOffice: {
      backgroundColor: aboutOffice?.backgroundColor,
      locations: aboutOffice?.locations ?? [],
    },
    whatWeDo: {
      backgroundColor: whatWeDo?.backgroundColor,
      textbox: whatWeDo?.textbox,
      datapoint1: whatWeDo?.datapoint1,
      datapoint2: whatWeDo?.datapoint2,
      datapoint3: whatWeDo?.datapoint3,
    },
    projects: {
      backgroundColor: projectsSection?.backgroundColor,
      heading: projectsSection?.heading,
    },
    team: {
      backgroundColor: teamSection?.backgroundColor,
      heading: teamSection?.heading,
      members: team ?? [],
    },
    publications: {
      backgroundColor: publicationsSection?.backgroundColor,
      heading: publicationsSection?.heading,
      items: publications ?? [],
    },
    ventures: {
      backgroundColor: venturesSection?.backgroundColor,
      heading: venturesSection?.heading,
      items: ventures ?? [],
    },
  };

  return <HomePageClient data={data} projects={projects} connections={connections} />;
}
