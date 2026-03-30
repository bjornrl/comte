/**
 * Fallback data used when Sanity is unreachable.
 * Keeps the site functional even without CMS connectivity.
 */

import type { Project } from "@/app/components/projectNetworkData";

export const FALLBACK_HERO_TEXT = "Innovation for societal impact";

export const FALLBACK_SITE_SETTINGS = {
  siteName: "Comte Bureau",
  siteDescription: "Design, research, and strategy for societal change",
  email: "hello@comtebureau.com",
  location: "Oslo, Norway",
  copyright: "Comte Bureau. All rights reserved.",
};

export const FALLBACK_CONTACT = {
  heading: "Contact",
  email: "hello@comtebureau.com",
  phone: "+47 123 45 678",
  address: "Pilestredet Park 31\nOslo, Norway",
};

export const FALLBACK_FOOTER_TAGS = [
  { _id: "ft1", label: "Service Design", category: "method", color: "#1F3A32" },
  { _id: "ft2", label: "Research", category: "method", color: "#4F7C6C" },
  { _id: "ft3", label: "Strategy", category: "method", color: "#5F7C8A" },
  { _id: "ft4", label: "Co-design", category: "method", color: "#D6B84C" },
  { _id: "ft5", label: "Health", category: "domain", color: "#1F3A32" },
  { _id: "ft6", label: "Education", category: "domain", color: "#F27887" },
  { _id: "ft7", label: "Integration", category: "domain", color: "#D6B84C" },
  { _id: "ft8", label: "Urban Development", category: "domain", color: "#5F7C8A" },
  { _id: "ft9", label: "Climate", category: "domain", color: "#4F7C6C" },
  { _id: "ft10", label: "Digital", category: "domain", color: "#FF5252" },
];

export const FALLBACK_PROJECTS: Project[] = [
  { id: "h1", name: "Redesigning Elderly Care Pathways", client: "Trondheim Kommune", domain: "health", summary: "Rethinking how elderly care is coordinated across home services, GPs, and hospitals.", featured: true, year: 2023, scale: "municipal", methods: ["codesign", "research", "strategy"], innovationLevel: "transformative" },
  { id: "e1", name: "Student Housing Against Loneliness", client: "SiT Trondheim", domain: "education", summary: "Designing common areas in student housing to reduce loneliness and build community.", featured: true, year: 2023, scale: "municipal", methods: ["codesign", "research"], innovationLevel: "transformative" },
  { id: "i1", name: "Humanizing the Asylum Process for Children", client: "UDI / UNE / PU", domain: "integration", summary: "Creating child-friendly services across Norway's immigration authorities.", featured: true, year: 2022, scale: "national", methods: ["codesign", "research", "strategy"], innovationLevel: "transformative" },
];

export const FALLBACK_INSIGHT_VIEWS = [
  { _id: "v1", title: "Everyone", key: "everyone", description: "200 people. Each dot represents someone facing a societal challenge in Norway." },
  { _id: "v2", title: "By age", key: "age", description: "Age shapes which challenges people face \u2014 and which services they need." },
  { _id: "v3", title: "By challenge", key: "challenge", description: "Loneliness and exclusion are the most common challenges. These are the problems Comte works on." },
  { _id: "v4", title: "By sector", key: "sector", description: "Public services touch every one of these people. But the services weren\u2019t designed with them in mind." },
  { _id: "v5", title: "Urban / Rural", key: "urban", description: "Most challenges concentrate in cities. But rural areas face different, often invisible problems." },
  { _id: "v6", title: "Severity", key: "severity", description: "For many, these challenges compound. The further right, the harder it gets." },
];
