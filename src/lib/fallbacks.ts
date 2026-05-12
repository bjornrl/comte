/**
 * Fallback data used when Sanity is unreachable.
 * Keeps the site functional even without CMS connectivity.
 */

import type { Project } from "@/app/components/projectNetworkData";

export const FALLBACK_SITE_SETTINGS = {
  siteName: "Comte Bureau",
  siteDescription: "Design, research, and strategy for societal change",
  email: "hello@comtebureau.com",
  location: "Oslo, Norway",
  copyright: "Comte Bureau. All rights reserved.",
};

export const FALLBACK_PROJECTS: Project[] = [
  { id: "h1", name: "Redesigning Elderly Care Pathways", client: "Trondheim Kommune", domain: "health", summary: "Rethinking how elderly care is coordinated across home services, GPs, and hospitals.", featured: true, year: 2023, scale: "municipal", methods: ["codesign", "research", "strategy"], innovationLevel: "transformative" },
  { id: "e1", name: "Student Housing Against Loneliness", client: "SiT Trondheim", domain: "education", summary: "Designing common areas in student housing to reduce loneliness and build community.", featured: true, year: 2023, scale: "municipal", methods: ["codesign", "research"], innovationLevel: "transformative" },
  { id: "i1", name: "Humanizing the Asylum Process for Children", client: "UDI / UNE / PU", domain: "integration", summary: "Creating child-friendly services across Norway's immigration authorities.", featured: true, year: 2022, scale: "national", methods: ["codesign", "research", "strategy"], innovationLevel: "transformative" },
];
