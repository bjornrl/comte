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
import { FALLBACK_PROJECTS } from "@/lib/fallbacks";

export const revalidate = 60;

function sanityImageUrl(imageField: any, width = 1600): string | undefined {
  if (!imageField?.asset) return undefined;
  return urlFor(imageField).width(width).auto("format").quality(80).url();
}

/**
 * Resolve an address string to { lng, lat } via OpenStreetMap's free
 * Nominatim service. Server-side only; cached for one day by Next.js so
 * we don't hit Nominatim more than once per address per day.
 */
async function geocodeAddress(address: string): Promise<{ lng: number; lat: number } | null> {
  const q = address.trim();
  if (!q) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: {
        // Nominatim's usage policy asks for an identifying User-Agent.
        "User-Agent": "Comte Bureau (https://comtebureau.com)",
        Accept: "application/json",
      },
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat?: string; lon?: string }>;
    const hit = data?.[0];
    if (!hit?.lat || !hit?.lon) return null;
    const lat = parseFloat(hit.lat);
    const lng = parseFloat(hit.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lng, lat };
  } catch {
    return null;
  }
}

// Last-resort default centre used when an office address can't be resolved.
const FALLBACK_OFFICE_COORDS = { lng: 10.736, lat: 59.9202 };

async function resolveOfficeLocations(rawLocations: any[]): Promise<
  Array<{
    title?: string;
    description?: string;
    longitude: number;
    latitude: number;
    zoom?: number;
  }>
> {
  const items = Array.isArray(rawLocations) ? rawLocations : [];
  // Sequential geocoding keeps us under Nominatim's 1 req/sec policy.
  const out: Array<{
    title?: string;
    description?: string;
    longitude: number;
    latitude: number;
    zoom?: number;
  }> = [];
  for (const loc of items) {
    const geo = (loc?.address && (await geocodeAddress(loc.address))) || FALLBACK_OFFICE_COORDS;
    out.push({
      title: loc?.title,
      description: loc?.description,
      longitude: geo.lng,
      latitude: geo.lat,
      zoom: loc?.zoom,
    });
  }
  return out;
}

function mapInterstitial(raw: any) {
  if (!raw) return undefined;
  const hasContent = !!(raw.text || raw.image || raw.videoUrl);
  if (!hasContent) return undefined;
  return {
    text: raw.text ?? undefined,
    image: raw.image ?? undefined,
    videoUrl: raw.videoUrl ?? undefined,
    backgroundColor: raw.backgroundColor ?? undefined,
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
    name: doc.title,
    client: customers[0] ?? "",
    customers,
    domain,
    summary: doc.summary ?? "",
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
  let aboutOffice: any = null;
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
      aboutOffice,
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
      client.fetch(ABOUT_OFFICE_QUERY),
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
  } catch {}

  const projects: Project[] = sanityProjects?.length
    ? sanityProjects.map(mapSanityProject)
    : FALLBACK_PROJECTS;
  const connections = generateConnections(projects);

  // Resolve each office's address → { longitude, latitude } before render.
  const aboutOfficeLocations = await resolveOfficeLocations(aboutOffice?.locations ?? []);

  const data: HomeData = {
    home: {
      showInteractiveNetwork: home?.showInteractiveNetwork !== false,
      interstitial: mapInterstitial(home?.interstitial),
    },
    motto: {
      heroText: motto?.heroText,
      backgroundColor: motto?.backgroundColor,
      backgroundVideoUrl: motto?.backgroundVideoUrl,
      interstitial: mapInterstitial(motto?.interstitial),
    },
    aboutIntro: {
      imageUrl: sanityImageUrl(aboutIntro?.image),
      imageAlt: aboutIntro?.image?.alt,
      whoIsComteTitle: aboutIntro?.whoIsComteTitle,
      whoIsComte: aboutIntro?.whoIsComte,
      whoAreWeTitle: aboutIntro?.whoAreWeTitle,
      whoAreWe: aboutIntro?.whoAreWe,
      interstitial: mapInterstitial(aboutIntro?.interstitial),
    },
    aboutOffice: {
      locations: aboutOfficeLocations,
      mediaImageUrl: sanityImageUrl(aboutOffice?.mediaImage),
      mediaImageAlt: aboutOffice?.mediaImage?.alt,
      mediaVideoUrl: aboutOffice?.mediaVideoUrl,
      interstitial: mapInterstitial(aboutOffice?.interstitial),
    },
    whatWeDo: {
      textbox: whatWeDo?.textbox,
      datapoint1: whatWeDo?.datapoint1,
      datapoint2: whatWeDo?.datapoint2,
      datapoint3: whatWeDo?.datapoint3,
      interstitial: mapInterstitial(whatWeDo?.interstitial),
    },
    projects: {
      backgroundColor: projectsSection?.backgroundColor,
      heading: projectsSection?.heading,
      interstitial: mapInterstitial(projectsSection?.interstitial),
    },
    team: {
      heading: teamSection?.heading,
      members: team ?? [],
      interstitial: mapInterstitial(teamSection?.interstitial),
    },
    publications: {
      heading: publicationsSection?.heading,
      items: publications ?? [],
      interstitial: mapInterstitial(publicationsSection?.interstitial),
    },
    ventures: {
      heading: venturesSection?.heading,
      items: ventures ?? [],
      interstitial: mapInterstitial(venturesSection?.interstitial),
    },
    contact: {
      block1Title: contactSection?.block1Title,
      block1Body: contactSection?.block1Body,
      block2Title: contactSection?.block2Title,
      block2Body: contactSection?.block2Body,
      interstitial: mapInterstitial(contactSection?.interstitial),
    },
  };

  return <HomePageClient data={data} projects={projects} connections={connections} />;
}
