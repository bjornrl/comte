import { client } from "@/sanity/lib/client";
import {
  PRESENTATION_PROJECTS_QUERY,
  SERVICE_CATEGORIES_QUERY,
} from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import PresentationBuilder from "@/components/presentation/PresentationBuilder";

export const revalidate = 60;

export default async function PresentationPage() {
  let projects: any[] = [];
  let categories: any[] = [];

  try {
    [projects, categories] = await Promise.all([
      client.fetch(PRESENTATION_PROJECTS_QUERY),
      client.fetch(SERVICE_CATEGORIES_QUERY),
    ]);
  } catch (error) {
    console.error("Failed to fetch presentation data:", error);
  }

  const mappedProjects = (projects ?? []).map((p: any) => ({
    id: p._id,
    slug: p.slug,
    title: p.title,
    excerpt: p.summary || "",
    solution: "",
    bulletPoints: p.presentationData?.bulletPoints || [],
    categories: [p.domain].filter(Boolean),
    images: [
      p.heroImage ? urlFor(p.heroImage).width(1200).height(800).url() : null,
      ...(p.gallery || []).map((img: any) =>
        img ? urlFor(img).width(1200).height(800).url() : null
      ),
    ].filter(Boolean),
    client: p.client || "",
    year: p.year?.toString() || "",
    location: p.presentationData?.location || "",
    industry: p.presentationData?.industry || "",
    stat1: p.presentationData?.stat1 || "",
    stat2: p.presentationData?.stat2 || "",
    services: p.methods || [],
  }));

  let mappedCategories;
  if (categories && categories.length > 0) {
    mappedCategories = categories.map((c: any) => ({
      id: c.slug || c._id,
      title: c.title,
      blurb: c.blurb || "",
      expertise: c.expertise || [],
      stats: c.stats || [],
      statsTitle: c.statsTitle || "",
      statsDescription: c.statsDescription || "",
      heroImage: c.heroImage?.asset ? urlFor(c.heroImage).width(1200).height(800).url() : null,
    }));
  } else {
    const domainLabels: Record<string, string> = {
      health: "Helse & omsorg",
      education: "Utdanning",
      integration: "Integrering & migrasjon",
      urban: "Byutvikling",
      climate: "Klima & b\u00e6rekraft",
      digital: "Digital transformasjon",
    };
    const uniqueDomains = [
      ...new Set((projects ?? []).map((p: any) => p.domain).filter(Boolean)),
    ];
    mappedCategories = uniqueDomains.map((domain: string) => ({
      id: domain,
      title: domainLabels[domain] || domain,
      blurb: "",
      expertise: [],
      stats: [],
      statsTitle: "",
      statsDescription: "",
    }));
  }

  return (
    <PresentationBuilder
      initialProjects={mappedProjects}
      initialCategories={mappedCategories}
    />
  );
}
