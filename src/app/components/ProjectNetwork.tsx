"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import type p5Type from "p5";

/* ───────────── Types ───────────── */

type Domain = "health" | "education" | "integration" | "urban" | "climate" | "digital";
type Scale = "municipal" | "regional" | "national" | "international";
type Method = "research" | "codesign" | "implementation" | "strategy" | "foresight";
type InnovationLevel = "incremental" | "transformative";

type Project = {
  id: string;
  name: string;
  client: string;
  domain: Domain;
  summary: string;
  featured: boolean;
  year: number;
  scale: Scale;
  methods: Method[];
  innovationLevel: InnovationLevel;
};

type ConnectionType = "domain" | "method" | "scale" | "theme";

type Connection = {
  from: string;
  to: string;
  type: ConnectionType;
};

type FilterState = {
  domain: Domain | null;
  scale: Scale | null;
  method: Method | null;
  innovationLevel: InnovationLevel | null;
};

/* ───────────── Constants ───────────── */

const DOMAIN_COLORS: Record<Domain, string> = {
  health: "#1F3A32",
  education: "#F27887",
  integration: "#D6B84C",
  urban: "#5F7C8A",
  climate: "#4F7C6C",
  digital: "#FF5252",
};

const THEME_LINE_COLOR = { r: 242, g: 120, b: 135 }; // #F27887 coral

const DOMAIN_LABELS: Record<Domain, string> = {
  health: "Health & Care",
  education: "Education",
  integration: "Integration & Migration",
  urban: "Urban Development",
  climate: "Climate & Sustainability",
  digital: "Digital Transformation",
};

const PROJECTS: Project[] = [
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

const CONNECTIONS: Connection[] = [
  // Domain: Health internal
  { from: "h1", to: "h2", type: "domain" },
  { from: "h1", to: "h4", type: "domain" },
  { from: "h2", to: "h3", type: "domain" },
  { from: "h3", to: "h4", type: "domain" },
  { from: "h4", to: "h5", type: "domain" },
  { from: "h1", to: "h5", type: "domain" },
  { from: "h2", to: "h5", type: "domain" },

  // Domain: Education internal
  { from: "e1", to: "e2", type: "domain" },
  { from: "e1", to: "e5", type: "domain" },
  { from: "e2", to: "e3", type: "domain" },
  { from: "e3", to: "e4", type: "domain" },
  { from: "e4", to: "e5", type: "domain" },
  { from: "e2", to: "e4", type: "domain" },

  // Domain: Integration internal
  { from: "i1", to: "i2", type: "domain" },
  { from: "i1", to: "i3", type: "domain" },
  { from: "i2", to: "i4", type: "domain" },
  { from: "i3", to: "i5", type: "domain" },
  { from: "i4", to: "i5", type: "domain" },
  { from: "i2", to: "i3", type: "domain" },

  // Domain: Urban internal
  { from: "u1", to: "u2", type: "domain" },
  { from: "u1", to: "u3", type: "domain" },
  { from: "u2", to: "u4", type: "domain" },
  { from: "u3", to: "u5", type: "domain" },
  { from: "u4", to: "u5", type: "domain" },
  { from: "u1", to: "u4", type: "domain" },

  // Domain: Climate internal
  { from: "c1", to: "c2", type: "domain" },
  { from: "c1", to: "c3", type: "domain" },
  { from: "c2", to: "c3", type: "domain" },
  { from: "c3", to: "c4", type: "domain" },
  { from: "c4", to: "c5", type: "domain" },
  { from: "c1", to: "c5", type: "domain" },

  // Domain: Digital internal
  { from: "d1", to: "d2", type: "domain" },
  { from: "d1", to: "d3", type: "domain" },
  { from: "d2", to: "d4", type: "domain" },
  { from: "d3", to: "d5", type: "domain" },
  { from: "d4", to: "d5", type: "domain" },
  { from: "d1", to: "d5", type: "domain" },

  // Cross-domain: Method
  { from: "h1", to: "i1", type: "method" },
  { from: "h3", to: "u1", type: "method" },
  { from: "e1", to: "u3", type: "method" },
  { from: "e3", to: "d3", type: "method" },
  { from: "c1", to: "d4", type: "method" },

  // Cross-domain: Scale
  { from: "h2", to: "d2", type: "scale" },
  { from: "i5", to: "d1", type: "scale" },
  { from: "u2", to: "c2", type: "scale" },
  { from: "e4", to: "i4", type: "scale" },
  { from: "c3", to: "d3", type: "scale" },

  // Cross-domain: Theme
  { from: "h4", to: "e1", type: "theme" },
  { from: "i1", to: "e5", type: "theme" },
  { from: "u5", to: "e2", type: "theme" },
  { from: "c4", to: "u4", type: "theme" },
  { from: "d1", to: "i2", type: "theme" },
  { from: "h5", to: "u1", type: "theme" },
  { from: "c5", to: "u3", type: "theme" },
];

const SCALE_LABELS: Record<Scale, string> = {
  municipal: "Municipal",
  regional: "Regional",
  national: "National",
  international: "International",
};

const METHOD_LABELS: Record<Method, string> = {
  research: "Research",
  codesign: "Co-design",
  implementation: "Implementation",
  strategy: "Strategy",
  foresight: "Foresight",
};

const INNOVATION_LABELS: Record<InnovationLevel, string> = {
  incremental: "Incremental",
  transformative: "Transformative",
};

function projectMatchesFilters(project: Project, filters: FilterState): boolean {
  if (filters.domain && project.domain !== filters.domain) return false;
  if (filters.scale && project.scale !== filters.scale) return false;
  if (filters.method && !project.methods.includes(filters.method)) return false;
  if (filters.innovationLevel && project.innovationLevel !== filters.innovationLevel) return false;
  return true;
}

const NO_FILTERS: FilterState = { domain: null, scale: null, method: null, innovationLevel: null };

function hasActiveFilters(f: FilterState): boolean {
  return f.domain !== null || f.scale !== null || f.method !== null || f.innovationLevel !== null;
}

/* ───────────── Helpers ───────────── */

function seededRandom(seed: string, index: number): number {
  let h = 0;
  const str = seed + ":" + index.toString(36);
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h = (h ^ (h >>> 16)) >>> 0;
  return (h % 10000) / 10000;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 128, g: 128, b: 128 };
}

type NodePosition = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
};

function computeNodePositions(
  width: number,
  height: number,
  isMobile = false
): Record<string, NodePosition> {
  const positions: Record<string, NodePosition> = {};
  const margin = { x: width * 0.08, y: height * 0.12 };
  const MIN_DISTANCE = isMobile ? 35 : width < 1024 ? 45 : 60;

  // Initial placement using improved hash
  for (const project of PROJECTS) {
    const x = margin.x + seededRandom(project.id, 0) * (width - margin.x * 2);
    const y = margin.y + seededRandom(project.id, 7919) * (height - margin.y * 2);
    positions[project.id] = { baseX: x, baseY: y, x, y };
  }

  // Collision separation passes
  const ids = Object.keys(positions);
  for (let pass = 0; pass < 5; pass++) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = positions[ids[i]];
        const b = positions[ids[j]];
        const dx = b.baseX - a.baseX;
        const dy = b.baseY - a.baseY;
        const dist = Math.hypot(dx, dy);
        if (dist < MIN_DISTANCE && dist > 0) {
          const overlap = (MIN_DISTANCE - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          a.baseX -= nx * overlap;
          a.baseY -= ny * overlap;
          b.baseX += nx * overlap;
          b.baseY += ny * overlap;
        }
      }
    }
  }

  // Clamp back into bounds
  for (const id of ids) {
    const p = positions[id];
    p.baseX = Math.max(margin.x, Math.min(width - margin.x, p.baseX));
    p.baseY = Math.max(margin.y, Math.min(height - margin.y, p.baseY));
    p.x = p.baseX;
    p.y = p.baseY;
  }

  return positions;
}

/* ───────────── Particle type ───────────── */

type Particle = {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  progress: number;
  speed: number;
  offsetX: number;
  offsetY: number;
};

/* ───────────── Component ───────────── */

export default function ProjectNetwork({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const nodeRefsMap = useRef<Record<string, HTMLDivElement | null>>({});
  const labelRefsMap = useRef<Record<string, HTMLDivElement | null>>({});
  const p5Ref = useRef<p5Type | null>(null);
  const positionsRef = useRef<Record<string, NodePosition>>({});
  const highlightedRef = useRef<string | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const particlesRef = useRef<Particle[][]>([]);
  const frameRef = useRef(0);

  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const connOpacitiesRef = useRef<Float32Array>(new Float32Array(CONNECTIONS.length));

  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [expandedContentVisible, setExpandedContentVisible] = useState(false);

  // Entrance animation
  const mountTimeRef = useRef(0);
  const entranceMultiplierRef = useRef(0);
  const [entranceReady, setEntranceReady] = useState(false);

  // Mouse position for proximity glow
  const mousePosRef = useRef({ x: -1000, y: -1000 });

  // Responsive & a11y
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const prefersReducedMotionRef = useRef(false);
  const [mobileSheetProject, setMobileSheetProject] = useState<Project | null>(null);

  const [filters, setFilters] = useState<FilterState>(NO_FILTERS);
  const filtersRef = useRef<FilterState>(NO_FILTERS);
  const matchingIdsRef = useRef<Set<string>>(new Set());

  /* ── Responsive & a11y detection ── */
  useEffect(() => {
    prefersReducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    checkSize();
    window.addEventListener("resize", checkSize);

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Entrance timing
    mountTimeRef.current = Date.now();
    const entranceTimer = setTimeout(() => setEntranceReady(true), 100);

    return () => {
      window.removeEventListener("resize", checkSize);
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(entranceTimer);
    };
  }, []);

  // Entrance stagger order (deterministic shuffle)
  const entranceOrder = useRef(
    [...Array(PROJECTS.length).keys()].sort(
      (a, b) => seededRandom("entrance", a) - seededRandom("entrance", b)
    )
  );

  /* ── Sync filter refs and close selection on filter change ── */
  useEffect(() => {
    filtersRef.current = filters;
    const matching = new Set<string>();
    for (const project of PROJECTS) {
      if (projectMatchesFilters(project, filters)) {
        matching.add(project.id);
      }
    }
    matchingIdsRef.current = matching;

    // Close selection and expanded cards when filters change
    if (hasActiveFilters(filters)) {
      setSelectedProjectId(null);
      selectedIdRef.current = null;
      setExpandedProjectId(null);
      setExpandedContentVisible(false);
    }
  }, [filters]);

  /* ── Apply filter styling to HTML nodes ── */
  useEffect(() => {
    const active = hasActiveFilters(filters);
    const _cw = sizeRef.current.width;
    const fc = _cw < 768 ? 1 : (_cw < 1024 ? 16 : 20) / (_cw < 1024 ? 240 : 280);
    for (const p of PROJECTS) {
      const el = nodeRefsMap.current[p.id];
      if (!el) continue;
      const baseScale = p.featured ? fc : 1;
      if (!active) {
        el.style.opacity = "0.8";
        el.style.transform = `scale(${baseScale})`;
      } else if (matchingIdsRef.current.has(p.id)) {
        el.style.opacity = "1";
        el.style.transform = `scale(${baseScale * 1.1})`;
      } else {
        el.style.opacity = "0.08";
        el.style.transform = `scale(${baseScale})`;
      }
      const label = labelRefsMap.current[p.id];
      if (label) {
        if (!active) {
          label.style.opacity = "0.8";
        } else if (matchingIdsRef.current.has(p.id)) {
          label.style.opacity = "1";
        } else {
          label.style.opacity = "0.08";
        }
      }
    }
  }, [filters]);

  /* ── Init particles for a connection ── */
  const initParticles = useCallback((connIndex: number, fromPos: NodePosition, toPos: NodePosition): Particle[] => {
    const count = 12;
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const seed = connIndex * 100 + i;
      const ox = (seededRandom(String(seed), 0) - 0.5) * 8;
      const oy = (seededRandom(String(seed), 1) - 0.5) * 8;
      particles.push({
        x: fromPos.x + ox,
        y: fromPos.y + oy,
        prevX: fromPos.x + ox,
        prevY: fromPos.y + oy,
        progress: seededRandom(String(seed), 2) * 0.1,
        speed: 0.003 + seededRandom(String(seed), 3) * 0.004,
        offsetX: (seededRandom(String(seed), 4) - 0.5) * 40,
        offsetY: (seededRandom(String(seed), 5) - 0.5) * 40,
      });
    }
    return particles;
  }, []);

  /* ── Helper: get connected project ids ── */
  const getConnectedIds = useCallback((projectId: string): Set<string> => {
    const ids = new Set<string>();
    for (const conn of CONNECTIONS) {
      if (conn.from === projectId) ids.add(conn.to);
      if (conn.to === projectId) ids.add(conn.from);
    }
    return ids;
  }, []);

  /* ── Helper: get connections for a project ── */
  const getConnectionsFor = useCallback((projectId: string) => {
    return CONNECTIONS
      .filter((c) => c.from === projectId || c.to === projectId)
      .map((c) => {
        const otherId = c.from === projectId ? c.to : c.from;
        const otherProject = PROJECTS.find((p) => p.id === otherId);
        return { ...c, otherId, otherProject };
      })
      .filter((c) => c.otherProject);
  }, []);

  /* ── Escape key to deselect ── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProjectId(null);
        selectedIdRef.current = null;
        setExpandedProjectId(null);
        setExpandedContentVisible(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* ── Apply selection styling to HTML nodes ── */
  const applySelectionStyling = useCallback((selId: string | null) => {
    const cw = sizeRef.current.width;
    const mob = cw < 768;
    const tab = cw >= 768 && cw < 1024;
    const dotSz = mob ? 12 : tab ? 16 : 20;
    const cardSz = mob ? dotSz : tab ? 240 : 280; // On mobile, no card — use dot
    const featuredCollapsed = mob ? 1 : dotSz / cardSz;
    if (!selId) {
      // Reset all nodes to default
      for (const p of PROJECTS) {
        const el = nodeRefsMap.current[p.id];
        if (el) {
          // Featured nodes reset to their collapsed scale
          el.style.transform = p.featured ? `scale(${featuredCollapsed})` : "scale(1)";
          el.style.opacity = "0.8";
          el.style.boxShadow = "";
          el.style.border = "";
        }
        const label = labelRefsMap.current[p.id];
        if (label) label.style.opacity = "0.8";
      }
      return;
    }

    const connectedIds = getConnectedIds(selId);
    const selProject = PROJECTS.find((pr) => pr.id === selId);
    for (const p of PROJECTS) {
      const el = nodeRefsMap.current[p.id];
      if (!el) continue;
      const rgb = hexToRgb(DOMAIN_COLORS[p.domain]);

      if (p.id === selId) {
        if (p.featured) {
          // Featured selected node: expansion is handled by React state, not here
          // Just set opacity
          el.style.opacity = "1";
        } else {
          el.style.transform = "scale(2)";
          el.style.opacity = "1";
          el.style.boxShadow = `0 0 20px rgba(${rgb.r},${rgb.g},${rgb.b},0.6)`;
          el.style.border = "2px solid rgba(255,255,255,0.5)";
        }
      } else if (connectedIds.has(p.id)) {
        const connScale = p.featured ? featuredCollapsed * 1.3 : 1.2;
        el.style.transform = `scale(${connScale})`;
        el.style.opacity = "1";
        el.style.boxShadow = `0 0 8px rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`;
        el.style.border = "";
      } else {
        el.style.transform = p.featured ? `scale(${featuredCollapsed})` : "scale(1)";
        el.style.opacity = "0.12";
        el.style.boxShadow = "";
        el.style.border = "";
      }

      const label = labelRefsMap.current[p.id];
      if (label) {
        if (p.id === selId || connectedIds.has(p.id)) {
          label.style.opacity = "1";
        } else {
          label.style.opacity = "0.12";
        }
      }
    }
  }, [getConnectedIds]);

  /* ── Setup p5 + animation loop ── */
  useEffect(() => {
    const container = containerRef.current;
    const canvasContainer = canvasContainerRef.current;
    if (!container || !canvasContainer) return;

    const rect = container.getBoundingClientRect();
    sizeRef.current = { width: rect.width, height: rect.height };
    positionsRef.current = computeNodePositions(rect.width, rect.height, rect.width < 768);

    // Init particles for each connection
    particlesRef.current = CONNECTIONS.map((conn, i) => {
      const from = positionsRef.current[conn.from];
      const to = positionsRef.current[conn.to];
      if (!from || !to) return [];
      return initParticles(i, from, to);
    });

    // Position node divs initially
    const mob = rect.width < 768;
    const tab = rect.width >= 768 && rect.width < 1024;
    for (const project of PROJECTS) {
      const pos = positionsRef.current[project.id];
      const el = nodeRefsMap.current[project.id];
      if (pos && el) {
        if (project.featured && !mob) {
          const w = tab ? 240 : 280;
          const h = tab ? 220 : 260;
          el.style.left = `${pos.x - w / 2}px`;
          el.style.top = `${pos.y - h / 2}px`;
        } else {
          const s = project.featured
            ? (mob ? 12 : tab ? 16 : 20)
            : (mob ? 6 : tab ? 8 : 10);
          el.style.left = `${pos.x - s / 2}px`;
          el.style.top = `${pos.y - s / 2}px`;
        }
      }
      const label = labelRefsMap.current[project.id];
      if (pos && label) {
        label.style.left = `${pos.x + 16}px`;
        label.style.top = `${pos.y - 8}px`;
      }
    }

    let cancelled = false;

    import("p5").then((p5Module) => {
      if (cancelled || !canvasContainer) return;
      const p5Constructor = p5Module.default;

      const sketch = (p: p5Type) => {
        p.setup = () => {
          p.createCanvas(sizeRef.current.width, sizeRef.current.height);
          p.noFill();
          p.frameRate(60);
        };

        p.draw = () => {
          p.clear();
          frameRef.current++;
          const now = Date.now();
          const reducedMotion = prefersReducedMotionRef.current;
          const time = reducedMotion ? 0 : frameRef.current * 0.01;
          const positions = positionsRef.current;
          const highlighted = highlightedRef.current;
          const selected = selectedIdRef.current;

          // Entrance: lines fade in after 600ms
          const entranceElapsed = now - mountTimeRef.current - 600;
          const entranceTarget = Math.max(0, Math.min(1, reducedMotion ? 1 : entranceElapsed / 1500));
          entranceMultiplierRef.current += (entranceTarget - entranceMultiplierRef.current) * 0.05;
          const entranceMul = entranceMultiplierRef.current;

          // Idle breathing pulse
          const isIdle = !highlighted && !selected && !hasActiveFilters(filtersRef.current);
          const breathe = isIdle && !reducedMotion
            ? Math.sin(now * 0.001) * 0.3 + 0.7
            : 1;

          // Drift nodes
          for (const project of PROJECTS) {
            const pos = positions[project.id];
            if (!pos) continue;
            if (!reducedMotion) {
              const driftX = Math.sin(time + seededRandom(project.id, 10) * 6.28) * 8;
              const driftY = Math.cos(time * 0.7 + seededRandom(project.id, 11) * 6.28) * 8;
              pos.x = pos.baseX + driftX;
              pos.y = pos.baseY + driftY;
            }

            // Update HTML node positions via ref
            const el = nodeRefsMap.current[project.id];
            if (el) {
              const cw = sizeRef.current.width;
              const mob = cw < 768;
              if (project.featured && !mob) {
                const w = cw < 1024 ? 240 : 280;
                const h = cw < 1024 ? 220 : 260;
                el.style.left = `${pos.x - w / 2}px`;
                el.style.top = `${pos.y - h / 2}px`;
              } else {
                const s = project.featured
                  ? (mob ? 12 : cw < 1024 ? 16 : 20)
                  : (mob ? 6 : cw < 1024 ? 8 : 10);
                el.style.left = `${pos.x - s / 2}px`;
                el.style.top = `${pos.y - s / 2}px`;
              }
            }
            // Mouse proximity glow (idle state only)
            if (isIdle && el && !reducedMotion) {
              const containerRect = containerRef.current?.getBoundingClientRect();
              if (containerRect) {
                const mx = mousePosRef.current.x - containerRect.left;
                const my = mousePosRef.current.y - containerRect.top;
                const dist = Math.hypot(pos.x - mx, pos.y - my);
                if (dist < 200) {
                  const glow = 1 - dist / 200;
                  el.style.opacity = String(Math.min(1, 0.8 + glow * 0.2));
                }
              }
            }

            const label = labelRefsMap.current[project.id];
            if (label) {
              label.style.left = `${pos.x + 16}px`;
              label.style.top = `${pos.y - 8}px`;
            }
          }

          // Draw particle connections
          const opacities = connOpacitiesRef.current;

          for (let ci = 0; ci < CONNECTIONS.length; ci++) {
            const conn = CONNECTIONS[ci];
            const fromPos = positions[conn.from];
            const toPos = positions[conn.to];
            if (!fromPos || !toPos) continue;

            const particles = particlesRef.current[ci];
            if (!particles) continue;

            const isConnectedToHover = highlighted
              ? conn.from === highlighted || conn.to === highlighted
              : false;
            const isConnectedToSelected = selected
              ? conn.from === selected || conn.to === selected
              : false;
            const fromProject = PROJECTS.find((pr) => pr.id === conn.from);
            const domainColor = fromProject
              ? hexToRgb(DOMAIN_COLORS[fromProject.domain])
              : { r: 128, g: 128, b: 128 };

            // Use theme color for "theme" connections, domain color for others
            const color = conn.type === "theme" ? THEME_LINE_COLOR : domainColor;

            // Base alpha varies by type
            let baseAlpha: number;
            switch (conn.type) {
              case "domain":  baseAlpha = 10; break;
              case "method":  baseAlpha = 12; break;
              case "scale":   baseAlpha = 8;  break;
              case "theme":   baseAlpha = 8;  break;
            }

            // Determine target alpha: selection > filter > hover > default
            const matchIds = matchingIdsRef.current;
            const filtersActive = matchIds.size < PROJECTS.length;
            const bothMatch = matchIds.has(conn.from) && matchIds.has(conn.to);
            const oneMatch = matchIds.has(conn.from) || matchIds.has(conn.to);

            let targetAlpha: number;
            if (selected) {
              if (isConnectedToSelected) {
                switch (conn.type) {
                  case "domain":  targetAlpha = 45; break;
                  case "method":  targetAlpha = 50; break;
                  case "scale":   targetAlpha = 40; break;
                  case "theme":   targetAlpha = 45; break;
                }
              } else {
                targetAlpha = 1.5;
              }
            } else if (filtersActive) {
              if (bothMatch) {
                targetAlpha = baseAlpha * 3;
              } else if (oneMatch) {
                targetAlpha = baseAlpha * 0.6;
              } else {
                targetAlpha = 1.5;
              }
              // Layer hover on top of filter
              if (highlighted && isConnectedToHover && bothMatch) {
                targetAlpha = baseAlpha * 4;
              }
            } else if (highlighted) {
              targetAlpha = isConnectedToHover ? baseAlpha * 3.5 : baseAlpha * 0.3;
            } else {
              targetAlpha = baseAlpha;
            }

            // Lerp toward target for smooth transitions
            opacities[ci] = opacities[ci] + (targetAlpha - opacities[ci]) * 0.08;
            const alpha = opacities[ci] * entranceMul * breathe;

            // Advance all particles for this connection
            for (const particle of particles) {
              particle.prevX = particle.x;
              particle.prevY = particle.y;
              particle.progress += particle.speed;

              if (particle.progress >= 1) {
                particle.progress = 0;
                particle.x = fromPos.x + (seededRandom(String(ci), 0) - 0.5) * 6;
                particle.y = fromPos.y + (seededRandom(String(ci), 1) - 0.5) * 6;
                particle.prevX = particle.x;
                particle.prevY = particle.y;
              }

              const t = particle.progress;
              const midX = (fromPos.x + toPos.x) / 2 + particle.offsetX;
              const midY = (fromPos.y + toPos.y) / 2 + particle.offsetY;
              const t1 = 1 - t;
              particle.x = t1 * t1 * fromPos.x + 2 * t1 * t * midX + t * t * toPos.x;
              particle.y = t1 * t1 * fromPos.y + 2 * t1 * t * midY + t * t * toPos.y;
            }

            // Render based on connection type
            switch (conn.type) {
              case "domain": {
                // Solid continuous lines
                p.stroke(color.r, color.g, color.b, alpha);
                p.strokeWeight(1);
                for (const particle of particles) {
                  p.line(particle.prevX, particle.prevY, particle.x, particle.y);
                }
                break;
              }
              case "method": {
                // Dotted / stippled paths
                p.stroke(color.r, color.g, color.b, alpha);
                p.strokeWeight(2);
                p.strokeCap(p.ROUND);
                for (const particle of particles) {
                  const segLen = p.dist(particle.prevX, particle.prevY, particle.x, particle.y);
                  const dotSpacing = 6;
                  const steps = Math.max(1, Math.floor(segLen / dotSpacing));
                  for (let s = 0; s < steps; s += 2) {
                    const st = s / steps;
                    const dx = p.lerp(particle.prevX, particle.x, st);
                    const dy = p.lerp(particle.prevY, particle.y, st);
                    p.point(dx, dy);
                  }
                }
                break;
              }
              case "scale": {
                // Thin dashed paths — draw every other particle's line
                p.stroke(color.r, color.g, color.b, alpha);
                p.strokeWeight(0.5);
                for (let pi = 0; pi < particles.length; pi++) {
                  if (pi % 2 === 0) {
                    const particle = particles[pi];
                    p.line(particle.prevX, particle.prevY, particle.x, particle.y);
                  }
                }
                break;
              }
              case "theme": {
                // Warm-tinted continuous lines
                p.stroke(color.r, color.g, color.b, alpha);
                p.strokeWeight(1);
                for (const particle of particles) {
                  p.line(particle.prevX, particle.prevY, particle.x, particle.y);
                }
                break;
              }
            }
          }
        };
      };

      const p5Instance = new p5Constructor(sketch, canvasContainer);
      p5Ref.current = p5Instance;
    });

    // ResizeObserver
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) continue;
        sizeRef.current = { width, height };
        positionsRef.current = computeNodePositions(width, height, width < 768);

        // Reinit particles
        particlesRef.current = CONNECTIONS.map((conn, i) => {
          const from = positionsRef.current[conn.from];
          const to = positionsRef.current[conn.to];
          if (!from || !to) return [];
          return initParticles(i, from, to);
        });

        if (p5Ref.current) {
          p5Ref.current.resizeCanvas(width, height);
        }
      }
    });
    observer.observe(container);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (p5Ref.current) {
        p5Ref.current.remove();
        p5Ref.current = null;
      }
    };
  }, [initParticles]);

  /* ── Hover handlers ── */
  const handleNodeEnter = useCallback(
    (project: Project, e: React.MouseEvent) => {
      highlightedRef.current = project.id;
      setHoveredProject(project);
      setTooltipPos({ x: e.clientX, y: e.clientY });

      // If something is selected, only show tooltip — don't change node styling
      if (selectedIdRef.current) {
        // Give connected hovered nodes a slight extra bump
        const connectedIds = getConnectedIds(selectedIdRef.current);
        if (connectedIds.has(project.id)) {
          const el = nodeRefsMap.current[project.id];
          if (el) {
            const _w = sizeRef.current.width;
            const _fc = _w < 768 ? 1 : (_w < 1024 ? 16 : 20) / (_w < 1024 ? 240 : 280);
            const s = project.featured ? _fc * 1.3 : 1.3;
            el.style.transform = `scale(${s})`;
          }
        }
        return;
      }

      // Default hover dimming (no selection active)
      const filActive = hasActiveFilters(filtersRef.current);
      const matchIds = matchingIdsRef.current;
      const _cw = sizeRef.current.width;
    const fc = _cw < 768 ? 1 : (_cw < 1024 ? 16 : 20) / (_cw < 1024 ? 240 : 280);
      for (const p of PROJECTS) {
        const el = nodeRefsMap.current[p.id];
        if (!el) continue;
        const base = p.featured ? fc : 1;
        // If filters active and this node doesn't match, keep it dim
        if (filActive && !matchIds.has(p.id)) {
          el.style.opacity = "0.08";
          el.style.transform = `scale(${base})`;
          continue;
        }
        if (p.id === project.id) {
          el.style.transform = `scale(${base * 1.4})`;
          el.style.opacity = "1";
        } else if (p.domain === project.domain) {
          el.style.transform = `scale(${base})`;
          el.style.opacity = "1";
        } else {
          el.style.transform = `scale(${base})`;
          el.style.opacity = filActive ? "0.08" : "0.3";
        }
      }
      for (const p of PROJECTS) {
        const label = labelRefsMap.current[p.id];
        if (!label) continue;
        if (filActive && !matchIds.has(p.id)) {
          label.style.opacity = "0.08";
          continue;
        }
        if (p.domain === project.domain) {
          label.style.opacity = "1";
        } else {
          label.style.opacity = filActive ? "0.08" : "0.3";
        }
      }
    },
    [getConnectedIds]
  );

  const handleNodeLeave = useCallback(() => {
    highlightedRef.current = null;
    setHoveredProject(null);

    // If something is selected, restore selection styling
    if (selectedIdRef.current) {
      applySelectionStyling(selectedIdRef.current);
      return;
    }

    const filActive = hasActiveFilters(filtersRef.current);
    const matchIds = matchingIdsRef.current;
    const _cw = sizeRef.current.width;
    const fc = _cw < 768 ? 1 : (_cw < 1024 ? 16 : 20) / (_cw < 1024 ? 240 : 280);
    for (const p of PROJECTS) {
      const el = nodeRefsMap.current[p.id];
      if (el) {
        const base = p.featured ? fc : 1;
        if (filActive && !matchIds.has(p.id)) {
          el.style.opacity = "0.08";
          el.style.transform = `scale(${base})`;
        } else {
          el.style.transform = `scale(${filActive ? base * 1.1 : base})`;
          el.style.opacity = filActive ? "1" : "0.8";
        }
      }
      const label = labelRefsMap.current[p.id];
      if (label) {
        if (filActive && !matchIds.has(p.id)) {
          label.style.opacity = "0.08";
        } else {
          label.style.opacity = filActive ? "1" : "0.8";
        }
      }
    }
  }, [applySelectionStyling]);

  const handleNodeMove = useCallback(
    (e: React.MouseEvent) => {
      if (hoveredProject) {
        setTooltipPos({ x: e.clientX, y: e.clientY });
      }
    },
    [hoveredProject]
  );

  /* ── Click handlers ── */
  const collapseExpanded = useCallback(() => {
    setExpandedContentVisible(false);
    setExpandedProjectId(null);
  }, []);

  const handleNodeClick = useCallback((projectId: string) => {
    const project = PROJECTS.find((p) => p.id === projectId);

    // If dimmed by filter, ignore click
    if (hasActiveFilters(filtersRef.current) && !matchingIdsRef.current.has(projectId)) return;

    // If clicking the already selected/expanded node, deselect
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
      selectedIdRef.current = null;
      applySelectionStyling(null);
      collapseExpanded();
      return;
    }

    // Collapse any existing expanded card
    if (expandedProjectId) {
      setExpandedContentVisible(false);
      setExpandedProjectId(null);
    }

    // Set selection (illumination)
    setSelectedProjectId(projectId);
    selectedIdRef.current = projectId;
    applySelectionStyling(projectId);

    // Featured nodes expand in-place; non-featured use the detail panel
    if (project?.featured) {
      setExpandedProjectId(projectId);
      // Delay content fade-in until card has expanded ~60%
      setTimeout(() => setExpandedContentVisible(true), 250);
    }
  }, [selectedProjectId, expandedProjectId, applySelectionStyling, collapseExpanded]);

  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setSelectedProjectId(null);
      selectedIdRef.current = null;
      applySelectionStyling(null);
      collapseExpanded();
    }
  }, [applySelectionStyling, collapseExpanded]);

  const handleDeselectAll = useCallback(() => {
    setSelectedProjectId(null);
    selectedIdRef.current = null;
    applySelectionStyling(null);
    collapseExpanded();
  }, [applySelectionStyling, collapseExpanded]);

  return (
    <div
      ref={containerRef}
      className={className}
      onClick={handleBackgroundClick}
      aria-label="Project network visualization showing 30 projects and their connections"
      style={{
        position: "relative",
        width: "100%",
        height: isMobile ? "50vh" : "100%",
        background: "#212121",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* p5 canvas layer */}
      <div
        ref={canvasContainerRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      />

      {/* HTML overlay: section heading */}
      <div
        style={{
          position: "absolute",
          top: isMobile ? 16 : 32,
          left: isMobile ? 16 : 32,
          zIndex: 10,
          opacity: 0,
          animation: entranceReady ? "headingIn 0.6s ease forwards" : undefined,
        }}
      >
        <style>{`@keyframes headingIn { to { opacity: 1; } }`}</style>
        <div
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          Our work
        </div>
        <div
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: "1rem",
            color: "rgba(255,255,255,0.5)",
            marginTop: 4,
          }}
        >
          30 projects across six domains
        </div>
      </div>

      {/* HTML overlay: project nodes */}
      {PROJECTS.map((project, projectIndex) => {
        const color = DOMAIN_COLORS[project.domain];
        const rgb = hexToRgb(color);
        const isExpanded = expandedProjectId === project.id;
        const reducedMotion = prefersReducedMotionRef.current;
        const staggerIdx = entranceOrder.current.indexOf(projectIndex);
        const entranceDelay = reducedMotion ? 0 : staggerIdx * (isMobile ? 20 : 40);

        const nodeA11y = {
          tabIndex: 0,
          role: "button" as const,
          "aria-label": project.name,
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (isMobile) {
                setMobileSheetProject(project);
              } else {
                handleNodeClick(project.id);
              }
            }
          },
          onFocus: (e: React.FocusEvent) => {
            handleNodeEnter(project, e as unknown as React.MouseEvent);
          },
          onBlur: () => { handleNodeLeave(); },
        };

        // Responsive sizes
        const featuredDotSize = isMobile ? 12 : isTablet ? 16 : 20;
        const regularDotSize = isMobile ? 6 : isTablet ? 8 : 10;
        const cardW = isMobile ? 280 : isTablet ? 240 : 280;
        const cardH = isMobile ? 260 : isTablet ? 220 : 260;

        // On mobile, featured nodes don't expand — use bottom sheet instead
        const handleClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (isMobile) {
            setMobileSheetProject(project);
            setSelectedProjectId(project.id);
            selectedIdRef.current = project.id;
          } else {
            handleNodeClick(project.id);
          }
        };

        if (project.featured && !isMobile) {
          // Featured nodes: expandable card container
          const collapsedScale = featuredDotSize / cardW;

          return (
            <React.Fragment key={project.id}>
              {/* Expandable card wrapper */}
              <div
                ref={(el) => { nodeRefsMap.current[project.id] = el; }}
                onMouseEnter={!isMobile ? (e) => handleNodeEnter(project, e) : undefined}
                onMouseLeave={!isMobile ? handleNodeLeave : undefined}
                onMouseMove={!isMobile ? handleNodeMove : undefined}
                onClick={handleClick}
                {...nodeA11y}
                style={{
                  position: "absolute",
                  width: cardW,
                  height: isExpanded ? "auto" : cardH,
                  minHeight: cardH,
                  borderRadius: isExpanded ? 12 : cardW / 2,
                  backgroundColor: isExpanded ? "rgba(33, 33, 33, 0.95)" : color,
                  border: isExpanded ? "1px solid rgba(255,255,255,0.1)" : "none",
                  backdropFilter: isExpanded ? "blur(12px)" : "none",
                  WebkitBackdropFilter: isExpanded ? "blur(12px)" : "none",
                  boxShadow: isExpanded
                    ? "0 8px 32px rgba(0,0,0,0.4)"
                    : `0 0 8px rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`,
                  cursor: isExpanded ? "default" : "pointer",
                  opacity: entranceReady ? 0.8 : 0,
                  transform: isExpanded ? "scale(1)" : `scale(${entranceReady ? collapsedScale : 0})`,
                  transformOrigin: "center center",
                  transition: reducedMotion
                    ? "none"
                    : `transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${entranceDelay}ms, opacity 0.5s ease ${entranceDelay}ms, border-radius 0.4s ease, background-color 0.3s ease, box-shadow 0.4s ease, border 0.3s ease`,
                  willChange: "transform",
                  zIndex: isExpanded ? 20 : 10,
                  overflow: "hidden",
                  boxSizing: "border-box",
                  padding: isExpanded ? 16 : 0,
                  outline: "none",
                }}
              >
                {/* Card content — only visible when expanded */}
                <div
                  style={{
                    opacity: isExpanded && expandedContentVisible ? 1 : 0,
                    transition: "opacity 0.3s ease",
                    pointerEvents: isExpanded ? "auto" : "none",
                  }}
                >
                  {/* Close button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeselectAll(); }}
                    aria-label="Close card"
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "1rem",
                      cursor: "pointer",
                      padding: 8,
                      lineHeight: 1,
                      minWidth: 44,
                      minHeight: 44,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; }}
                  >
                    ✕
                  </button>

                  {/* Domain pill */}
                  <div
                    style={{
                      display: "inline-block",
                      background: `rgba(${rgb.r},${rgb.g},${rgb.b},0.2)`,
                      color: color,
                      fontFamily: "var(--font-geist-mono)",
                      fontSize: "0.65rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      padding: "3px 10px",
                      borderRadius: 10,
                    }}
                  >
                    {DOMAIN_LABELS[project.domain]}
                  </div>

                  {/* Image placeholder */}
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "16 / 10",
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 8,
                      marginTop: 10,
                    }}
                  />

                  {/* Project name */}
                  <div
                    style={{
                      fontFamily: "var(--font-geist-sans)",
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "#fff",
                      marginTop: 12,
                      lineHeight: 1.3,
                    }}
                  >
                    {project.name}
                  </div>

                  {/* Client + year */}
                  <div
                    style={{
                      fontFamily: "var(--font-geist-sans)",
                      fontSize: "0.8rem",
                      color: "rgba(255,255,255,0.5)",
                      marginTop: 2,
                    }}
                  >
                    {project.client} · {project.year}
                  </div>

                  {/* Summary */}
                  <div
                    style={{
                      fontFamily: "var(--font-geist-sans)",
                      fontSize: "0.8rem",
                      lineHeight: 1.45,
                      color: "rgba(255,255,255,0.6)",
                      marginTop: 8,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {project.summary}
                  </div>

                  {/* View project link */}
                  <a
                    href={`/projects/${project.id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: "inline-block",
                      marginTop: 10,
                      fontFamily: "var(--font-geist-sans)",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      color: color,
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}
                  >
                    View project →
                  </a>
                </div>
              </div>

              {/* Featured label (hidden when expanded) */}
              {!isExpanded && (
                <div
                  ref={(el) => { labelRefsMap.current[project.id] = el; }}
                  style={{
                    position: "absolute",
                    fontFamily: "var(--font-geist-sans)",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.8)",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    opacity: 0.8,
                    transition: "opacity 0.3s ease",
                    zIndex: 10,
                  }}
                >
                  {project.name}
                </div>
              )}
            </React.Fragment>
          );
        }

        // Non-featured (or featured on mobile): simple dot
        const size = project.featured ? featuredDotSize : regularDotSize;
        return (
          <React.Fragment key={project.id}>
            <div
              ref={(el) => { nodeRefsMap.current[project.id] = el; }}
              onMouseEnter={!isMobile ? (e) => handleNodeEnter(project, e) : undefined}
              onMouseLeave={!isMobile ? handleNodeLeave : undefined}
              onMouseMove={!isMobile ? handleNodeMove : undefined}
              onClick={handleClick}
              {...nodeA11y}
              style={{
                position: "absolute",
                width: size,
                height: size,
                borderRadius: "50%",
                backgroundColor: color,
                boxShadow: `0 0 8px rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`,
                cursor: "pointer",
                opacity: entranceReady ? 0.8 : 0,
                transform: entranceReady ? "scale(1)" : "scale(0)",
                transition: reducedMotion
                  ? "none"
                  : `transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${entranceDelay}ms, opacity 0.5s ease ${entranceDelay}ms, box-shadow 0.4s ease, border 0.3s ease`,
                willChange: "transform",
                zIndex: 10,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            {project.featured && (
              <div
                ref={(el) => { labelRefsMap.current[project.id] = el; }}
                style={{
                  position: "absolute",
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.8)",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  opacity: entranceReady ? 0.8 : 0,
                  transition: reducedMotion ? "none" : `opacity 0.5s ease ${entranceDelay}ms`,
                  zIndex: 10,
                }}
              >
                {project.name}
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Filter bar */}
      <div
        style={{
          position: "absolute",
          bottom: isMobile ? "1rem" : "5rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: isMobile ? 4 : 6,
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "90vw",
          zIndex: 10,
          opacity: 0,
          animation: prefersReducedMotionRef.current ? "filterBarIn 0.01s forwards" : "filterBarIn 0.5s ease-out 1.8s forwards",
          overflowX: isMobile ? "auto" : undefined,
        }}
      >
        <style>{`@keyframes filterBarIn { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>

        {/* Domain group */}
        <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginRight: 6, whiteSpace: "nowrap" }}>Domain</span>
        {(Object.keys(DOMAIN_COLORS) as Domain[]).map((d) => {
          const active = filters.domain === d;
          return (
            <button
              key={d}
              onClick={(e) => { e.stopPropagation(); setFilters((f) => ({ ...f, domain: f.domain === d ? null : d })); }}
              style={{
                background: active ? DOMAIN_COLORS[d] : "rgba(255,255,255,0.06)",
                border: `1px solid ${active ? DOMAIN_COLORS[d] : "rgba(255,255,255,0.12)"}`,
                borderRadius: 16,
                padding: "5px 14px",
                fontFamily: "var(--font-geist-sans)",
                fontSize: "0.7rem",
                fontWeight: active ? 500 : 450,
                color: active ? "#212121" : "rgba(255,255,255,0.45)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { if (!active) { const t = e.currentTarget; t.style.background = "rgba(255,255,255,0.1)"; t.style.color = "rgba(255,255,255,0.65)"; t.style.borderColor = "rgba(255,255,255,0.2)"; } }}
              onMouseLeave={(e) => { if (!active) { const t = e.currentTarget; t.style.background = "rgba(255,255,255,0.06)"; t.style.color = "rgba(255,255,255,0.45)"; t.style.borderColor = "rgba(255,255,255,0.12)"; } }}
            >
              {DOMAIN_LABELS[d]}
            </button>
          );
        })}

        {/* Non-domain groups hidden on mobile */}
        {!isMobile && <>
        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)", margin: "0 8px" }} />

        {/* Scale group */}
        <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginRight: 6, whiteSpace: "nowrap" }}>Scale</span>
        {(Object.keys(SCALE_LABELS) as Scale[]).map((s) => {
          const active = filters.scale === s;
          return (
            <button
              key={s}
              onClick={(e) => { e.stopPropagation(); setFilters((f) => ({ ...f, scale: f.scale === s ? null : s })); }}
              style={{
                background: active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.12)"}`,
                borderRadius: 16,
                padding: "5px 14px",
                fontFamily: "var(--font-geist-sans)",
                fontSize: "0.7rem",
                fontWeight: active ? 500 : 450,
                color: active ? "#212121" : "rgba(255,255,255,0.45)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { if (!active) { const t = e.currentTarget; t.style.background = "rgba(255,255,255,0.1)"; t.style.color = "rgba(255,255,255,0.65)"; t.style.borderColor = "rgba(255,255,255,0.2)"; } }}
              onMouseLeave={(e) => { if (!active) { const t = e.currentTarget; t.style.background = "rgba(255,255,255,0.06)"; t.style.color = "rgba(255,255,255,0.45)"; t.style.borderColor = "rgba(255,255,255,0.12)"; } }}
            >
              {SCALE_LABELS[s]}
            </button>
          );
        })}

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)", margin: "0 8px" }} />

        {/* Method group */}
        <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginRight: 6, whiteSpace: "nowrap" }}>Method</span>
        {(Object.keys(METHOD_LABELS) as Method[]).map((m) => {
          const active = filters.method === m;
          return (
            <button
              key={m}
              onClick={(e) => { e.stopPropagation(); setFilters((f) => ({ ...f, method: f.method === m ? null : m })); }}
              style={{
                background: active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.12)"}`,
                borderRadius: 16,
                padding: "5px 14px",
                fontFamily: "var(--font-geist-sans)",
                fontSize: "0.7rem",
                fontWeight: active ? 500 : 450,
                color: active ? "#212121" : "rgba(255,255,255,0.45)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { if (!active) { const t = e.currentTarget; t.style.background = "rgba(255,255,255,0.1)"; t.style.color = "rgba(255,255,255,0.65)"; t.style.borderColor = "rgba(255,255,255,0.2)"; } }}
              onMouseLeave={(e) => { if (!active) { const t = e.currentTarget; t.style.background = "rgba(255,255,255,0.06)"; t.style.color = "rgba(255,255,255,0.45)"; t.style.borderColor = "rgba(255,255,255,0.12)"; } }}
            >
              {METHOD_LABELS[m]}
            </button>
          );
        })}

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)", margin: "0 8px" }} />

        {/* Innovation group */}
        <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginRight: 6, whiteSpace: "nowrap" }}>Innovation</span>
        {(Object.keys(INNOVATION_LABELS) as InnovationLevel[]).map((il) => {
          const active = filters.innovationLevel === il;
          return (
            <button
              key={il}
              onClick={(e) => { e.stopPropagation(); setFilters((f) => ({ ...f, innovationLevel: f.innovationLevel === il ? null : il })); }}
              style={{
                background: active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.12)"}`,
                borderRadius: 16,
                padding: "5px 14px",
                fontFamily: "var(--font-geist-sans)",
                fontSize: "0.7rem",
                fontWeight: active ? 500 : 450,
                color: active ? "#212121" : "rgba(255,255,255,0.45)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { if (!active) { const t = e.currentTarget; t.style.background = "rgba(255,255,255,0.1)"; t.style.color = "rgba(255,255,255,0.65)"; t.style.borderColor = "rgba(255,255,255,0.2)"; } }}
              onMouseLeave={(e) => { if (!active) { const t = e.currentTarget; t.style.background = "rgba(255,255,255,0.06)"; t.style.color = "rgba(255,255,255,0.45)"; t.style.borderColor = "rgba(255,255,255,0.12)"; } }}
            >
              {INNOVATION_LABELS[il]}
            </button>
          );
        })}
        </>}

        {/* Clear button */}
        <button
          onClick={(e) => { e.stopPropagation(); setFilters(NO_FILTERS); }}
          style={{
            background: "none",
            border: "none",
            fontFamily: "var(--font-geist-sans)",
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            marginLeft: 12,
            padding: "5px 8px",
            opacity: hasActiveFilters(filters) ? 1 : 0,
            pointerEvents: hasActiveFilters(filters) ? "auto" : "none",
            transition: "opacity 0.2s ease, color 0.2s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; }}
        >
          Clear{hasActiveFilters(filters) && ` (${matchingIdsRef.current.size})`}
        </button>
      </div>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          right: 32,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          fontFamily: "var(--font-geist-mono)",
          fontSize: "0.6rem",
          color: "rgba(255,255,255,0.3)",
          pointerEvents: "none",
          zIndex: 10,
          opacity: 0,
          animation: "legendFadeIn 0.6s ease 2s forwards",
        }}
      >
        <style>{`@keyframes legendFadeIn { to { opacity: 1; } }`}</style>
        {[
          { label: "Same domain", type: "solid" as const },
          { label: "Same method", type: "dotted" as const },
          { label: "Same scale", type: "dashed" as const },
          { label: "Shared theme", type: "theme" as const },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="30" height="4" viewBox="0 0 30 4" style={{ flexShrink: 0 }}>
              {item.type === "solid" && (
                <line x1="0" y1="2" x2="30" y2="2" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              )}
              {item.type === "dotted" && (
                <>
                  {[0, 6, 12, 18, 24].map((cx) => (
                    <circle key={cx} cx={cx + 1} cy="2" r="1" fill="rgba(255,255,255,0.4)" />
                  ))}
                </>
              )}
              {item.type === "dashed" && (
                <>
                  <line x1="0" y1="2" x2="8" y2="2" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                  <line x1="14" y1="2" x2="22" y2="2" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                </>
              )}
              {item.type === "theme" && (
                <line x1="0" y1="2" x2="30" y2="2" stroke="rgba(242,120,135,0.6)" strokeWidth="1" />
              )}
            </svg>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Detail panel (non-featured nodes only — featured use in-place expansion) */}
      {selectedProjectId && !expandedProjectId && (() => {
        const project = PROJECTS.find((p) => p.id === selectedProjectId);
        if (!project || project.featured) return null;
        const pos = positionsRef.current[selectedProjectId];
        if (!pos) return null;
        const { width: cw, height: ch } = sizeRef.current;
        const panelWidth = isTablet ? 300 : 340;
        const panelOnRight = pos.x + panelWidth + 60 < cw;
        const panelLeft = panelOnRight ? pos.x + 32 : pos.x - panelWidth - 32;
        const panelTop = Math.max(24, Math.min(pos.y - 60, ch - 480));
        const domainColor = DOMAIN_COLORS[project.domain];
        const domainRgb = hexToRgb(domainColor);
        const connections = getConnectionsFor(project.id);
        const CONNECTION_TYPE_LABELS: Record<ConnectionType, string> = {
          domain: "same domain",
          method: "shared method",
          scale: "same scale",
          theme: "shared theme",
        };

        return (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              left: panelLeft,
              top: panelTop,
              width: panelWidth,
              background: "rgba(33, 33, 33, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: 24,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              zIndex: 50,
              animation: `panelIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both`,
            }}
          >
            <style>{`
              @keyframes panelIn {
                from { opacity: 0; transform: translateX(${panelOnRight ? "-12px" : "12px"}); }
                to { opacity: 1; transform: translateX(0); }
              }
            `}</style>

            {/* Close button */}
            <button
              onClick={handleDeselectAll}
              aria-label="Close panel"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                fontSize: "1rem",
                cursor: "pointer",
                padding: 8,
                lineHeight: 1,
                minWidth: 44,
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; }}
            >
              ✕
            </button>

            {/* Domain tag */}
            <div
              style={{
                display: "inline-block",
                background: `rgba(${domainRgb.r},${domainRgb.g},${domainRgb.b},0.2)`,
                color: domainColor,
                fontFamily: "var(--font-geist-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "3px 10px",
                borderRadius: 10,
              }}
            >
              {DOMAIN_LABELS[project.domain]}
            </div>

            {/* Project name */}
            <h2
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#ffffff",
                marginTop: 12,
                marginBottom: 0,
                lineHeight: 1.3,
              }}
            >
              {project.name}
            </h2>

            {/* Client + year */}
            <div
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "0.85rem",
                fontWeight: 400,
                color: "rgba(255,255,255,0.5)",
                marginTop: 4,
              }}
            >
              {project.client} · {project.year}
            </div>

            {/* Summary */}
            <p
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "0.9rem",
                lineHeight: 1.5,
                color: "rgba(255,255,255,0.7)",
                marginTop: 16,
                marginBottom: 0,
              }}
            >
              {project.summary}
            </p>

            {/* Connected projects */}
            {connections.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: "0.6rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "rgba(255,255,255,0.3)",
                    marginBottom: 8,
                  }}
                >
                  Connected to
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {connections.map((conn) => {
                    const other = conn.otherProject!;
                    const otherColor = DOMAIN_COLORS[other.domain];
                    return (
                      <button
                        key={conn.otherId}
                        onClick={() => {
                          setSelectedProjectId(conn.otherId);
                          selectedIdRef.current = conn.otherId;
                          applySelectionStyling(conn.otherId);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          padding: "2px 0",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontFamily: "var(--font-geist-sans)",
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.5)",
                          textAlign: "left",
                          lineHeight: 1.3,
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: otherColor,
                            flexShrink: 0,
                          }}
                        />
                        <span>
                          {other.name}{" "}
                          <span style={{ color: "rgba(255,255,255,0.3)" }}>
                            ({CONNECTION_TYPE_LABELS[conn.type]})
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View full project link */}
            <a
              href={`/projects/${project.id}`}
              style={{
                display: "inline-block",
                marginTop: 20,
                fontFamily: "var(--font-geist-sans)",
                fontSize: "0.85rem",
                fontWeight: 500,
                color: domainColor,
                textDecoration: "none",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}
            >
              View full project →
            </a>
          </div>
        );
      })()}

      {/* Tooltip (desktop only) */}
      {!isMobile && hoveredProject && (
        <div
          style={{
            position: "fixed",
            left: tooltipPos.x + 16,
            top: tooltipPos.y - 8,
            background: "rgba(0,0,0,0.85)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            padding: "8px 12px",
            pointerEvents: "none",
            zIndex: 100,
            transition: "opacity 0.15s ease",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#fff",
            }}
          >
            {hoveredProject.name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.6)",
              marginTop: 2,
            }}
          >
            {hoveredProject.client}
          </div>
        </div>
      )}

      {/* Mobile bottom sheet */}
      {isMobile && mobileSheetProject && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMobileSheetProject(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 90,
            }}
          />
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: "60vh",
              overflowY: "auto",
              borderRadius: "16px 16px 0 0",
              background: "rgba(33, 33, 33, 0.97)",
              padding: 24,
              zIndex: 100,
              animation: "sheetUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            <style>{`@keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

            {/* Close button */}
            <button
              onClick={() => setMobileSheetProject(null)}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                fontSize: "1.2rem",
                cursor: "pointer",
                padding: 8,
                minWidth: 44,
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>

            {/* Domain pill */}
            <div
              style={{
                display: "inline-block",
                background: `rgba(${hexToRgb(DOMAIN_COLORS[mobileSheetProject.domain]).r},${hexToRgb(DOMAIN_COLORS[mobileSheetProject.domain]).g},${hexToRgb(DOMAIN_COLORS[mobileSheetProject.domain]).b},0.2)`,
                color: DOMAIN_COLORS[mobileSheetProject.domain],
                fontFamily: "var(--font-geist-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "3px 10px",
                borderRadius: 10,
              }}
            >
              {DOMAIN_LABELS[mobileSheetProject.domain]}
            </div>

            <h2 style={{ fontFamily: "var(--font-geist-sans)", fontSize: "1.25rem", fontWeight: 600, color: "#fff", marginTop: 12, marginBottom: 0, lineHeight: 1.3 }}>
              {mobileSheetProject.name}
            </h2>
            <div style={{ fontFamily: "var(--font-geist-sans)", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
              {mobileSheetProject.client} · {mobileSheetProject.year}
            </div>
            <p style={{ fontFamily: "var(--font-geist-sans)", fontSize: "0.9rem", lineHeight: 1.5, color: "rgba(255,255,255,0.7)", marginTop: 16, marginBottom: 0 }}>
              {mobileSheetProject.summary}
            </p>
            <a
              href={`/projects/${mobileSheetProject.id}`}
              style={{
                display: "inline-block",
                marginTop: 20,
                fontFamily: "var(--font-geist-sans)",
                fontSize: "0.85rem",
                fontWeight: 500,
                color: DOMAIN_COLORS[mobileSheetProject.domain],
                textDecoration: "none",
              }}
            >
              View full project →
            </a>
          </div>
        </>
      )}

      {/* Focus indicator styles */}
      <style>{`
        [role="button"]:focus-visible {
          outline: 2px solid rgba(255,255,255,0.6) !important;
          outline-offset: 4px;
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
