/* ───────────── Shared types & data for the Project Network ───────────── */

export type Domain = "health" | "education" | "integration" | "urban" | "climate" | "digital";
export type Scale = "municipal" | "regional" | "national" | "international";
export type Method = "research" | "codesign" | "implementation" | "strategy" | "foresight";
export type InnovationLevel = "incremental" | "transformative";

export type Project = {
  id: string;
  slug?: string;
  name: string;
  client: string;
  domain: Domain;
  summary: string;
  featured: boolean;
  year: number;
  scale: Scale;
  methods: Method[];
  innovationLevel: InnovationLevel;
  heroImageUrl?: string;
};

export type ConnectionType = "domain" | "method" | "scale" | "theme";

export type Connection = {
  from: string;
  to: string;
  type: ConnectionType;
};

export type FilterState = {
  domain: Domain | null;
  scale: Scale | null;
  method: Method | null;
  innovationLevel: InnovationLevel | null;
};

export const NO_FILTERS: FilterState = { domain: null, scale: null, method: null, innovationLevel: null };

export const DOMAIN_COLORS: Record<Domain, string> = {
  health: "#1F3A32",
  education: "#F27887",
  integration: "#D6B84C",
  urban: "#5F7C8A",
  climate: "#4F7C6C",
  digital: "#FF5252",
};

export const DOMAIN_LABELS: Record<Domain, string> = {
  health: "Health & Care",
  education: "Education",
  integration: "Integration & Migration",
  urban: "Urban Development",
  climate: "Climate & Sustainability",
  digital: "Digital Transformation",
};

export const SCALE_LABELS: Record<Scale, string> = {
  municipal: "Municipal",
  regional: "Regional",
  national: "National",
  international: "International",
};

export const METHOD_LABELS: Record<Method, string> = {
  research: "Research",
  codesign: "Co-design",
  implementation: "Implementation",
  strategy: "Strategy",
  foresight: "Foresight",
};

export const INNOVATION_LABELS: Record<InnovationLevel, string> = {
  incremental: "Incremental",
  transformative: "Transformative",
};

export let PROJECTS: Project[] = [
  // Health
  { id: "h1", name: "Redesigning Elderly Care Pathways", client: "Trondheim Kommune", domain: "health", summary: "Rethinking how elderly care is coordinated across home services, GPs, and hospitals.", featured: true, year: 2023, scale: "municipal", methods: ["codesign", "research", "strategy"], innovationLevel: "transformative" },
  { id: "h2", name: "Digital Health Literacy", client: "Helsedirektoratet", domain: "health", summary: "Improving how patients understand and navigate digital health services.", featured: false, year: 2022, scale: "national", methods: ["research", "implementation"], innovationLevel: "incremental" },
  { id: "h3", name: "Mental Health Service Mapping", client: "Bergen Kommune", domain: "health", summary: "Mapping the patient journey through municipal mental health services.", featured: false, year: 2021, scale: "municipal", methods: ["research", "codesign"], innovationLevel: "incremental" },
  { id: "h4", name: "Home Care Coordination", client: "Stavanger Kommune", domain: "health", summary: "Streamlining communication between home care workers and families.", featured: false, year: 2023, scale: "municipal", methods: ["codesign", "implementation"], innovationLevel: "incremental" },
  { id: "h5", name: "Hospital Wayfinding", client: "St. Olavs Hospital", domain: "health", summary: "Redesigning physical and digital wayfinding for a major university hospital.", featured: false, year: 2022, scale: "regional", methods: ["research", "implementation"], innovationLevel: "incremental" },
  // Education
  { id: "e1", name: "Student Housing Against Loneliness", client: "SiT Trondheim", domain: "education", summary: "Designing common areas in student housing to reduce loneliness and build community.", featured: true, year: 2023, scale: "municipal", methods: ["codesign", "research"], innovationLevel: "transformative" },
  { id: "e2", name: "Learning Space Innovation", client: "NTNU", domain: "education", summary: "Rethinking university learning spaces for hybrid teaching models.", featured: false, year: 2024, scale: "regional", methods: ["research", "foresight"], innovationLevel: "transformative" },
  { id: "e3", name: "Teacher Collaboration Platform", client: "Utdanningsdirektoratet", domain: "education", summary: "Designing tools for cross-school teacher knowledge sharing.", featured: false, year: 2022, scale: "national", methods: ["codesign", "implementation"], innovationLevel: "incremental" },
  { id: "e4", name: "Vocational Training Pathways", client: "Trøndelag Fylkeskommune", domain: "education", summary: "Reimagining the journey from vocational school to employment.", featured: false, year: 2023, scale: "regional", methods: ["research", "strategy"], innovationLevel: "incremental" },
  { id: "e5", name: "Library as Third Place", client: "Deichman Bibliotek", domain: "education", summary: "Transforming public libraries into vibrant community learning hubs.", featured: false, year: 2021, scale: "municipal", methods: ["codesign", "strategy"], innovationLevel: "incremental" },
  // Integration
  { id: "i1", name: "Humanizing the Asylum Process for Children", client: "UDI / UNE / PU", domain: "integration", summary: "Creating child-friendly services across Norway's immigration authorities.", featured: true, year: 2022, scale: "national", methods: ["codesign", "research", "strategy"], innovationLevel: "transformative" },
  { id: "i2", name: "Language Learning Ecosystems", client: "IMDi", domain: "integration", summary: "Mapping how refugees access and navigate language learning opportunities.", featured: false, year: 2023, scale: "national", methods: ["research", "codesign"], innovationLevel: "incremental" },
  { id: "i3", name: "Cultural Navigator Service", client: "Drammen Kommune", domain: "integration", summary: "Designing peer-to-peer cultural navigation for newly arrived families.", featured: false, year: 2022, scale: "municipal", methods: ["codesign", "implementation"], innovationLevel: "transformative" },
  { id: "i4", name: "Employment Bridge Program", client: "NAV Intro", domain: "integration", summary: "Connecting skilled immigrants with employers through structured mentorship.", featured: false, year: 2024, scale: "regional", methods: ["implementation", "strategy"], innovationLevel: "incremental" },
  { id: "i5", name: "Digital Inclusion for Seniors", client: "Røde Kors", domain: "integration", summary: "Helping elderly immigrants access essential digital services.", featured: false, year: 2021, scale: "international", methods: ["research", "codesign"], innovationLevel: "incremental" },
  // Urban
  { id: "u1", name: "Neighbourhood Identity Mapping", client: "Oslo Kommune", domain: "urban", summary: "Co-creating neighbourhood identities with residents to guide urban planning.", featured: true, year: 2024, scale: "municipal", methods: ["codesign", "research"], innovationLevel: "transformative" },
  { id: "u2", name: "Car-Free City Centre", client: "Tromsø Kommune", domain: "urban", summary: "Designing the transition experience for a pedestrianized city centre.", featured: false, year: 2023, scale: "municipal", methods: ["codesign", "foresight"], innovationLevel: "transformative" },
  { id: "u3", name: "Waterfront Public Space", client: "Bodø Kommune", domain: "urban", summary: "Envisioning inclusive public spaces along the harbour redevelopment.", featured: false, year: 2022, scale: "municipal", methods: ["codesign", "strategy"], innovationLevel: "incremental" },
  { id: "u4", name: "School Route Safety", client: "Bærum Kommune", domain: "urban", summary: "Mapping and improving safe walking routes to schools with children.", featured: false, year: 2023, scale: "municipal", methods: ["research", "codesign"], innovationLevel: "incremental" },
  { id: "u5", name: "Rural Co-Working Spaces", client: "Distriktssenteret", domain: "urban", summary: "Designing shared workspaces that strengthen rural communities.", featured: false, year: 2024, scale: "national", methods: ["research", "foresight", "strategy"], innovationLevel: "transformative" },
  // Climate
  { id: "c1", name: "Circular Economy Mapping", client: "Miljødirektoratet", domain: "climate", summary: "Visualizing material flows to identify circular economy opportunities.", featured: true, year: 2023, scale: "national", methods: ["research", "strategy"], innovationLevel: "transformative" },
  { id: "c2", name: "Green Mobility Nudging", client: "Ruter", domain: "climate", summary: "Designing behavioural nudges for sustainable transport choices.", featured: false, year: 2022, scale: "regional", methods: ["research", "implementation"], innovationLevel: "incremental" },
  { id: "c3", name: "Climate Budget Communication", client: "Kristiansand Kommune", domain: "climate", summary: "Making municipal climate budgets understandable for citizens.", featured: false, year: 2024, scale: "municipal", methods: ["codesign", "implementation"], innovationLevel: "incremental" },
  { id: "c4", name: "Food Waste Reduction", client: "Matvett", domain: "climate", summary: "Service design for reducing food waste in grocery supply chains.", featured: false, year: 2021, scale: "national", methods: ["research", "implementation", "strategy"], innovationLevel: "incremental" },
  { id: "c5", name: "Nature-Based Solutions Toolkit", client: "NINA", domain: "climate", summary: "A toolkit helping municipalities plan with nature, not against it.", featured: false, year: 2023, scale: "international", methods: ["research", "foresight"], innovationLevel: "transformative" },
  // Digital
  { id: "d1", name: "Supporting Vulnerable Young Men", client: "NAV / Trondheim Kommune", domain: "digital", summary: "A new cross-institutional service helping young men in the transition to adulthood.", featured: true, year: 2023, scale: "municipal", methods: ["codesign", "research", "implementation"], innovationLevel: "transformative" },
  { id: "d2", name: "Digital Samtykke Platform", client: "Digitaliseringsdirektoratet", domain: "digital", summary: "Designing a consent management platform for public data sharing.", featured: false, year: 2024, scale: "national", methods: ["strategy", "implementation"], innovationLevel: "incremental" },
  { id: "d3", name: "Citizen Dashboard", client: "KS", domain: "digital", summary: "A unified view of all municipal services for citizens.", featured: false, year: 2022, scale: "municipal", methods: ["codesign", "implementation"], innovationLevel: "incremental" },
  { id: "d4", name: "AI Ethics Framework", client: "Datatilsynet", domain: "digital", summary: "Practical guidelines for ethical AI use in public services.", featured: false, year: 2023, scale: "international", methods: ["research", "strategy"], innovationLevel: "incremental" },
  { id: "d5", name: "Cross-Agency Case Management", client: "DFØ", domain: "digital", summary: "Redesigning how cases flow across government agencies.", featured: false, year: 2021, scale: "international", methods: ["research", "strategy", "implementation"], innovationLevel: "incremental" },
];

export let CONNECTIONS: Connection[] = [
  { from: "h1", to: "h2", type: "domain" }, { from: "h1", to: "h4", type: "domain" },
  { from: "h2", to: "h3", type: "domain" }, { from: "h3", to: "h4", type: "domain" },
  { from: "h4", to: "h5", type: "domain" }, { from: "h1", to: "h5", type: "domain" },
  { from: "h2", to: "h5", type: "domain" },
  { from: "e1", to: "e2", type: "domain" }, { from: "e1", to: "e5", type: "domain" },
  { from: "e2", to: "e3", type: "domain" }, { from: "e3", to: "e4", type: "domain" },
  { from: "e4", to: "e5", type: "domain" }, { from: "e2", to: "e4", type: "domain" },
  { from: "i1", to: "i2", type: "domain" }, { from: "i1", to: "i3", type: "domain" },
  { from: "i2", to: "i4", type: "domain" }, { from: "i3", to: "i5", type: "domain" },
  { from: "i4", to: "i5", type: "domain" }, { from: "i2", to: "i3", type: "domain" },
  { from: "u1", to: "u2", type: "domain" }, { from: "u1", to: "u3", type: "domain" },
  { from: "u2", to: "u4", type: "domain" }, { from: "u3", to: "u5", type: "domain" },
  { from: "u4", to: "u5", type: "domain" }, { from: "u1", to: "u4", type: "domain" },
  { from: "c1", to: "c2", type: "domain" }, { from: "c1", to: "c3", type: "domain" },
  { from: "c2", to: "c3", type: "domain" }, { from: "c3", to: "c4", type: "domain" },
  { from: "c4", to: "c5", type: "domain" }, { from: "c1", to: "c5", type: "domain" },
  { from: "d1", to: "d2", type: "domain" }, { from: "d1", to: "d3", type: "domain" },
  { from: "d2", to: "d4", type: "domain" }, { from: "d3", to: "d5", type: "domain" },
  { from: "d4", to: "d5", type: "domain" }, { from: "d1", to: "d5", type: "domain" },
  { from: "h1", to: "i1", type: "method" }, { from: "h3", to: "u1", type: "method" },
  { from: "e1", to: "u3", type: "method" }, { from: "e3", to: "d3", type: "method" },
  { from: "c1", to: "d4", type: "method" },
  { from: "h2", to: "d2", type: "scale" }, { from: "i5", to: "d1", type: "scale" },
  { from: "u2", to: "c2", type: "scale" }, { from: "e4", to: "i4", type: "scale" },
  { from: "c3", to: "d3", type: "scale" },
  { from: "h4", to: "e1", type: "theme" }, { from: "i1", to: "e5", type: "theme" },
  { from: "u5", to: "e2", type: "theme" }, { from: "c4", to: "u4", type: "theme" },
  { from: "d1", to: "i2", type: "theme" }, { from: "h5", to: "u1", type: "theme" },
  { from: "c5", to: "u3", type: "theme" },
];

export function projectMatchesFilters(project: Project, filters: FilterState): boolean {
  if (filters.domain && project.domain !== filters.domain) return false;
  if (filters.scale && project.scale !== filters.scale) return false;
  if (filters.method && !project.methods.includes(filters.method)) return false;
  if (filters.innovationLevel && project.innovationLevel !== filters.innovationLevel) return false;
  return true;
}

export function hasActiveFilters(f: FilterState): boolean {
  return f.domain !== null || f.scale !== null || f.method !== null || f.innovationLevel !== null;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 128, g: 128, b: 128 };
}

/** Generate connections automatically from shared properties between projects */
export function generateConnections(projects: Project[]): Connection[] {
  const connections: Connection[] = [];
  const seen = new Set<string>();
  const add = (from: string, to: string, type: ConnectionType) => {
    const key = [from, to].sort().join(":") + ":" + type;
    if (!seen.has(key)) {
      seen.add(key);
      connections.push({ from, to, type });
    }
  };

  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const a = projects[i];
      const b = projects[j];
      // Domain connections
      if (a.domain === b.domain) {
        add(a.id, b.id, "domain");
      }
      // Method connections (share at least one method, different domains)
      if (a.domain !== b.domain && a.methods.some((m) => b.methods.includes(m))) {
        add(a.id, b.id, "method");
      }
      // Scale connections (same scale, different domains)
      if (a.domain !== b.domain && a.scale === b.scale) {
        add(a.id, b.id, "scale");
      }
    }
  }

  return connections;
}

/** Replace the module-level PROJECTS and CONNECTIONS with Sanity data */
export function setProjectData(projects: Project[], connections?: Connection[]) {
  PROJECTS = projects;
  CONNECTIONS = connections ?? generateConnections(projects);
}
