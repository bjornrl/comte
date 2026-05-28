import { client } from "@/sanity/lib/client";
import {
  HOME_SECTION_QUERY,
  MOTTO_SECTION_QUERY,
  ABOUT_INTRO_QUERY,
  WHAT_WE_DO_QUERY,
  PROJECTS_SECTION_QUERY,
  TEAM_SECTION_QUERY,
  PUBLICATIONS_SECTION_QUERY,
  VENTURES_SECTION_QUERY,
  CONTACT_SECTION_QUERY,
  PROJECTS_QUERY,
  TEAM_QUERY,
  PUBLICATIONS_QUERY,
  VENTURES_QUERY,
} from "@/sanity/lib/queries";
import {
  firstTagAsDomain,
  generateConnections,
  DOMAIN_LABELS,
  DOMAIN_COLORS,
  type Domain,
} from "@/app/components/projectNetworkData";
import type { Project } from "@/app/components/projectNetworkData";
import HomePageClient, { type HomeData } from "@/app/components/HomePageClient";
import { urlFor } from "@/sanity/lib/image";
import {
  resolveDatapoint,
  resolveLocaleString,
  resolveLocaleText,
} from "@/sanity/lib/locale";
import { FALLBACK_PROJECTS } from "@/lib/fallbacks";
import type { CardItem } from "@/app/components/sections/SectionCardGrid";

export const revalidate = 60;

function sanityImageUrl(imageField: any, width = 1600): string | undefined {
  if (!imageField?.asset) return undefined;
  return urlFor(imageField).width(width).auto("format").quality(80).url();
}

function mapInterstitial(raw: any) {
  if (!raw) return undefined;
  const text = resolveLocaleText(raw.text);
  const hasContent = !!(text || raw.image || raw.videoUrl);
  if (!hasContent) return undefined;
  return {
    text,
    image: raw.image ?? undefined,
    videoUrl: raw.videoUrl ?? undefined,
    backgroundColor: raw.backgroundColor ?? undefined,
  };
}

function mapCardItem(doc: any): CardItem {
  return {
    _id: doc._id,
    title: resolveLocaleString(doc.title),
    description: resolveLocaleText(doc.description),
    image: doc.image,
  };
}

function mapSanityProject(doc: any): Project {
  // Prefer the new `mainCategory` field; fall back to the first legacy tag.
  const mainCategoryRaw: string | undefined = doc.mainCategory;
  const domain: Domain =
    mainCategoryRaw && mainCategoryRaw in DOMAIN_LABELS
      ? (mainCategoryRaw as Domain)
      : firstTagAsDomain(doc.tags);

  // Sub-categories: prefer `allCategories`, fall back to legacy `tags`. In
  // either case strip the main category so it isn't doubled up on the card.
  const sourceCategories: string[] =
    (doc.allCategories?.length ? doc.allCategories : doc.tags) ?? [];
  const subCategories = sourceCategories
    .filter((t: string): t is Domain => t in DOMAIN_LABELS)
    .filter((t: Domain) => t !== domain)
    .map((t: Domain) => ({ id: t, label: DOMAIN_LABELS[t], color: DOMAIN_COLORS[t] }));

  // Customers: prefer the multi-value field; fall back to the legacy single
  // `client` string wrapped in an array.
  const customers: string[] = Array.isArray(doc.customers) && doc.customers.length
    ? (doc.customers as string[]).filter(Boolean)
    : doc.client
      ? [doc.client as string]
      : [];

  const galleryUrls = (doc.galleryUrls ?? []).filter(Boolean) as string[];
  const cardLinks = (doc.links ?? []).map((l: any) => ({
    label: l?.label ?? "",
    url: l?.url ?? "",
  }));

  const responsibleDoc = doc.responsible;
  const responsible = responsibleDoc
    ? {
        id: responsibleDoc._id,
        name: responsibleDoc.name ?? "",
        role: responsibleDoc.role ?? undefined,
        email: responsibleDoc.email ?? undefined,
        phone: responsibleDoc.phone ?? undefined,
        photoUrl: responsibleDoc.photoUrl ?? undefined,
      }
    : undefined;

  return {
    id: doc._id,
    slug: doc.slug,
    name: resolveLocaleString(doc.title) ?? "",
    client: customers[0] ?? "",
    customers,
    domain,
    summary: resolveLocaleText(doc.summary) ?? "",
    featured: false,
    year: doc.year ?? new Date().getFullYear(),
    scale: (doc.scale as Project["scale"]) ?? "municipal",
    methods: (Array.isArray(doc.methods) ? doc.methods : []) as Project["methods"],
    innovationLevel: "incremental",
    heroImageUrl: doc.heroImageUrl ?? undefined,
    galleryUrls,
    cardLinks,
    subCategories,
    displayTags: subCategories,
    responsible,
  };
}

export default async function Home() {
  let home: any = null;
  let motto: any = null;
  let aboutIntro: any = null;
  let whatWeDo: any = null;
  let projectsSection: any = null;
  let teamSection: any = null;
  let publicationsSection: any = null;
  let venturesSection: any = null;
  let contactSection: any = null;
  let sanityProjects: any[] | null = null;
  let team: any[] | null = null;
  let publications: any[] | null = null;
  let ventures: any[] | null = null;

  try {
    [
      home,
      motto,
      aboutIntro,
      whatWeDo,
      projectsSection,
      teamSection,
      publicationsSection,
      venturesSection,
      contactSection,
      sanityProjects,
      team,
      publications,
      ventures,
    ] = await Promise.all([
      client.fetch(HOME_SECTION_QUERY),
      client.fetch(MOTTO_SECTION_QUERY),
      client.fetch(ABOUT_INTRO_QUERY),
      client.fetch(WHAT_WE_DO_QUERY),
      client.fetch(PROJECTS_SECTION_QUERY),
      client.fetch(TEAM_SECTION_QUERY),
      client.fetch(PUBLICATIONS_SECTION_QUERY),
      client.fetch(VENTURES_SECTION_QUERY),
      client.fetch(CONTACT_SECTION_QUERY),
      client.fetch(PROJECTS_QUERY),
      client.fetch(TEAM_QUERY),
      client.fetch(PUBLICATIONS_QUERY),
      client.fetch(VENTURES_QUERY),
    ]);
  } catch (error) {
    console.error("[Home] Sanity fetch failed:", error);
  }

  const projects: Project[] = sanityProjects?.length
    ? sanityProjects.map(mapSanityProject)
    : FALLBACK_PROJECTS;
  const connections = generateConnections(projects);

  const data: HomeData = {
    home: {
      showInteractiveNetwork: home?.showInteractiveNetwork !== false,
      interstitial: mapInterstitial(home?.interstitial),
    },
    motto: {
      heroText: resolveLocaleString(motto?.heroText),
      backgroundColor: motto?.backgroundColor,
      backgroundVideoUrl: motto?.backgroundVideoUrl,
      interstitial: mapInterstitial(motto?.interstitial),
    },
    aboutIntro: {
      imageUrl: sanityImageUrl(aboutIntro?.image),
      imageAlt: aboutIntro?.image?.alt,
      whoIsComteTitle: resolveLocaleString(aboutIntro?.whoIsComteTitle),
      whoIsComte: resolveLocaleText(aboutIntro?.whoIsComte),
      whoAreWeTitle: resolveLocaleString(aboutIntro?.whoAreWeTitle),
      whoAreWe: resolveLocaleText(aboutIntro?.whoAreWe),
      interstitial: mapInterstitial(aboutIntro?.interstitial),
    },
    whatWeDo: {
      textbox: resolveLocaleText(whatWeDo?.textbox),
      datapoint1: resolveDatapoint(whatWeDo?.datapoint1),
      datapoint2: resolveDatapoint(whatWeDo?.datapoint2),
      datapoint3: resolveDatapoint(whatWeDo?.datapoint3),
      interstitial: mapInterstitial(whatWeDo?.interstitial),
    },
    projects: {
      backgroundColor: projectsSection?.backgroundColor,
      heading: resolveLocaleString(projectsSection?.heading),
      interstitial: mapInterstitial(projectsSection?.interstitial),
    },
    team: {
      heading: resolveLocaleString(teamSection?.heading),
      members: team ?? [],
      carouselVideos: (teamSection?.carouselVideos ?? [])
        .map(
          (
            video: {
              _key?: string;
              url?: string | null;
              mimeType?: string;
              label?: string;
            },
            index: number,
          ) => ({
            _key: video._key,
            url: video.url,
            mimeType: video.mimeType,
            label: video.label,
            cmsOrder: index,
          }),
        )
        .filter((video: { url?: string | null }) => Boolean(video.url)),
      interstitial: mapInterstitial(teamSection?.interstitial),
    },
    publications: {
      heading: resolveLocaleString(publicationsSection?.heading),
      body: resolveLocaleText(publicationsSection?.body),
      items: (publications ?? []).map(mapCardItem),
      interstitial: mapInterstitial(publicationsSection?.interstitial),
    },
    ventures: {
      heading: resolveLocaleString(venturesSection?.heading),
      body: resolveLocaleText(venturesSection?.body),
      featuredVideoUrl: venturesSection?.featuredVideoUrl,
      featuredImage: venturesSection?.featuredImage,
      items: (ventures ?? []).map(mapCardItem),
      interstitial: mapInterstitial(venturesSection?.interstitial),
    },
    contact: {
      block1Title: resolveLocaleString(contactSection?.block1Title),
      block1Body: resolveLocaleText(contactSection?.block1Body),
      block2Title: resolveLocaleString(contactSection?.block2Title),
      block2Body: resolveLocaleText(contactSection?.block2Body),
      interstitial: mapInterstitial(contactSection?.interstitial),
    },
  };

  return <HomePageClient data={data} projects={projects} connections={connections} />;
}
