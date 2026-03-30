"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

type Domain =
  | "health"
  | "education"
  | "integration"
  | "urban"
  | "climate"
  | "digital";

type Project = {
  id: string;
  name: string;
  client: string;
  domain: Domain;
  summary: string;
  featured: boolean;
  year: number;
};

// ── Constants ──────────────────────────────────────────────────────────────────

const DOMAIN_COLORS: Record<Domain, string> = {
  health: "#1F3A32",
  education: "#F27887",
  integration: "#D6B84C",
  urban: "#5F7C8A",
  climate: "#4F7C6C",
  digital: "#FF5252",
};

const DOMAIN_LABELS: Record<Domain, string> = {
  health: "Health & Care",
  education: "Education",
  integration: "Integration & Migration",
  urban: "Urban Development",
  climate: "Climate & Sustainability",
  digital: "Digital Transformation",
};

const DOMAINS: Domain[] = [
  "education",
  "health",
  "climate",
  "digital",
  "urban",
  "integration",
];

const PROJECTS: Project[] = [
  // Health & Care
  { id: "h1", name: "Redesigning Elderly Care Pathways", client: "Trondheim Municipality", domain: "health", summary: "Rethinking how elderly care is coordinated across home services, GPs, and hospitals.", featured: true, year: 2023 },
  { id: "h2", name: "Digital Health Literacy", client: "Helsedirektoratet", domain: "health", summary: "Improving how patients understand and navigate digital health services.", featured: false, year: 2022 },
  { id: "h3", name: "Mental Health in Schools", client: "Bergen Kommune", domain: "health", summary: "Co-designing early intervention tools for student mental health support.", featured: false, year: 2024 },
  { id: "h4", name: "Patient Journey Mapping", client: "St. Olavs Hospital", domain: "health", summary: "Mapping and improving the experience of cancer patients from diagnosis to recovery.", featured: false, year: 2023 },
  { id: "h5", name: "Home Care Service Redesign", client: "Stavanger Kommune", domain: "health", summary: "Transforming home care delivery for elderly residents living independently.", featured: false, year: 2022 },

  // Education
  { id: "e1", name: "Student Housing Against Loneliness", client: "Studentsamskipnaden i Trondheim", domain: "education", summary: "Designing common areas in student housing to reduce loneliness and build community.", featured: true, year: 2023 },
  { id: "e2", name: "Vocational Training Futures", client: "Utdanningsdirektoratet", domain: "education", summary: "Reimagining vocational training pathways for a changing job market.", featured: false, year: 2024 },
  { id: "e3", name: "Library as Learning Hub", client: "Deichman Bibliotek", domain: "education", summary: "Transforming public libraries into active learning and maker spaces.", featured: false, year: 2022 },
  { id: "e4", name: "Digital Classroom Equity", client: "NTNU", domain: "education", summary: "Ensuring equitable digital learning access for students from diverse backgrounds.", featured: false, year: 2023 },
  { id: "e5", name: "Teacher Wellbeing Framework", client: "Utdanningsforbundet", domain: "education", summary: "Designing systemic approaches to support teacher mental health and retention.", featured: false, year: 2024 },

  // Integration & Migration
  { id: "i1", name: "Humanizing the Asylum Process for Children", client: "UDI / UNE / PU", domain: "integration", summary: "Creating child-friendly services across Norway's immigration authorities.", featured: true, year: 2022 },
  { id: "i2", name: "Language Learning Pathways", client: "IMDi", domain: "integration", summary: "Designing personalized language learning journeys for newly arrived refugees.", featured: false, year: 2023 },
  { id: "i3", name: "Cultural Navigator Service", client: "Oslo Kommune", domain: "integration", summary: "A peer-support model helping immigrants navigate Norwegian public services.", featured: false, year: 2024 },
  { id: "i4", name: "Employment Bridge Program", client: "NAV Trøndelag", domain: "integration", summary: "Connecting immigrant professionals with Norwegian employers through skills matching.", featured: false, year: 2023 },
  { id: "i5", name: "Youth Integration Toolkit", client: "Røde Kors", domain: "integration", summary: "Tools for local communities to better include young refugees in social activities.", featured: false, year: 2022 },

  // Urban Development
  { id: "u1", name: "Neighbourhood Identity Mapping", client: "Oslo Kommune", domain: "urban", summary: "Co-creating neighbourhood identities with residents to guide urban planning.", featured: false, year: 2024 },
  { id: "u2", name: "Car-Free City Centre", client: "Trondheim Kommune", domain: "urban", summary: "Designing the transition to a pedestrian-first city centre experience.", featured: false, year: 2023 },
  { id: "u3", name: "Public Space for All Ages", client: "Bærum Kommune", domain: "urban", summary: "Creating intergenerational public spaces that serve children and elderly alike.", featured: false, year: 2022 },
  { id: "u4", name: "Waterfront Revitalization", client: "Drammen Kommune", domain: "urban", summary: "Transforming industrial waterfront areas into vibrant community spaces.", featured: false, year: 2024 },
  { id: "u5", name: "Smart Mobility Hub", client: "Ruter", domain: "urban", summary: "Designing seamless multi-modal transport hubs for suburban commuters.", featured: true, year: 2023 },

  // Climate & Sustainability
  { id: "c1", name: "Circular Economy Service Design", client: "Miljødirektoratet", domain: "climate", summary: "Designing public-facing services that make circular economy participation intuitive.", featured: false, year: 2024 },
  { id: "c2", name: "Green Building Behaviour", client: "Enova", domain: "climate", summary: "Nudging residents toward energy-efficient behaviours in new housing developments.", featured: false, year: 2023 },
  { id: "c3", name: "Food Waste Reduction", client: "Matvett", domain: "climate", summary: "A service design approach to reducing food waste across the Norwegian hospitality sector.", featured: false, year: 2022 },
  { id: "c4", name: "Climate Action Toolkit", client: "KS (Kommunesektorens organisasjon)", domain: "climate", summary: "Practical tools for municipalities to engage citizens in local climate action plans.", featured: false, year: 2024 },
  { id: "c5", name: "Sustainable Transport Choices", client: "Vegvesenet", domain: "climate", summary: "Understanding and influencing commuter decisions toward lower-emission transport.", featured: false, year: 2023 },

  // Digital Transformation
  { id: "d1", name: "Supporting Vulnerable Young Men", client: "NAV / Trondheim Municipality", domain: "digital", summary: "A new cross-institutional service helping young men in the transition to adulthood.", featured: true, year: 2023 },
  { id: "d2", name: "Digital Inclusion for Seniors", client: "Digitaliseringsdirektoratet", domain: "digital", summary: "Ensuring elderly citizens can access critical public services online.", featured: false, year: 2022 },
  { id: "d3", name: "AI Ethics Framework", client: "Datatilsynet", domain: "digital", summary: "Developing practical guidelines for ethical AI deployment in public sector services.", featured: false, year: 2024 },
  { id: "d4", name: "Cross-Agency Data Sharing", client: "DFØ", domain: "digital", summary: "Designing user-centric consent flows for sharing citizen data between agencies.", featured: false, year: 2023 },
  { id: "d5", name: "Municipal Chatbot Strategy", client: "Kristiansand Kommune", domain: "digital", summary: "A human-centered approach to deploying conversational AI in citizen services.", featured: false, year: 2024 },
];

// ── Seeded random ──────────────────────────────────────────────────────────────

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  };
}

// ── Cluster layout positions (relative 0-1) ────────────────────────────────────

const CLUSTER_CENTERS: Record<Domain, { x: number; y: number }> = {
  education:   { x: 0.22, y: 0.28 },
  health:      { x: 0.72, y: 0.24 },
  climate:     { x: 0.15, y: 0.62 },
  digital:     { x: 0.52, y: 0.55 },
  urban:       { x: 0.32, y: 0.76 },
  integration: { x: 0.78, y: 0.70 },
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function ProjectCluster() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Domain | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute dot positions
  const dotPositions = useMemo(() => {
    if (containerSize.w === 0) return new Map<string, { x: number; y: number }>();

    const isMobile = containerSize.w < 768;
    const positions = new Map<string, { x: number; y: number }>();

    // Usable area with padding
    const padX = isMobile ? 40 : 80;
    const padY = isMobile ? 100 : 80;
    const usableW = containerSize.w - padX * 2;
    const usableH = containerSize.h - padY * 2;

    const spreadRadius = isMobile ? 40 : Math.min(usableW, usableH) * 0.08;

    for (const project of PROJECTS) {
      const rng = seededRandom(project.id);
      const center = CLUSTER_CENTERS[project.domain];

      const offsetX = (rng() - 0.5) * spreadRadius * 2;
      const offsetY = (rng() - 0.5) * spreadRadius * 2;

      positions.set(project.id, {
        x: padX + center.x * usableW + offsetX,
        y: padY + center.y * usableH + offsetY,
      });
    }

    return positions;
  }, [containerSize]);

  // Compute constellation lines (1-2 nearest neighbors per dot within cluster)
  const lines = useMemo(() => {
    if (dotPositions.size === 0) return [];

    const result: { x1: number; y1: number; x2: number; y2: number; domain: Domain }[] = [];
    const connected = new Set<string>();

    for (const domain of DOMAINS) {
      const domainProjects = PROJECTS.filter((p) => p.domain === domain);

      for (const project of domainProjects) {
        const pos = dotPositions.get(project.id);
        if (!pos) continue;

        // Find nearest 2 neighbors
        const neighbors = domainProjects
          .filter((p) => p.id !== project.id)
          .map((p) => {
            const nPos = dotPositions.get(p.id)!;
            const dist = Math.hypot(nPos.x - pos.x, nPos.y - pos.y);
            return { id: p.id, dist, pos: nPos };
          })
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 2);

        for (const n of neighbors) {
          const key = [project.id, n.id].sort().join("-");
          if (connected.has(key)) continue;
          connected.add(key);
          result.push({
            x1: pos.x,
            y1: pos.y,
            x2: n.pos.x,
            y2: n.pos.y,
            domain,
          });
        }
      }
    }

    return result;
  }, [dotPositions]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveProject(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleDotClick = useCallback((projectId: string) => {
    setActiveProject((prev) => (prev === projectId ? null : projectId));
  }, []);

  const handleFilterClick = useCallback((domain: Domain) => {
    setActiveFilter((prev) => (prev === domain ? null : domain));
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const hoveredData = hoveredProject
    ? PROJECTS.find((p) => p.id === hoveredProject)
    : null;

  const activeData = activeProject
    ? PROJECTS.find((p) => p.id === activeProject)
    : null;

  const isMobile = containerSize.w < 768;

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-screen flex-shrink-0 overflow-hidden select-none"
      style={{ background: "#212121" }}
      onMouseMove={handleMouseMove}
      onClick={(e) => {
        if (e.target === e.currentTarget) setActiveProject(null);
      }}
    >
      {/* Section header */}
      <div
        style={{
          position: "absolute",
          top: "clamp(24px, 4vh, 48px)",
          left: "clamp(24px, 4vw, 48px)",
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            color: "rgba(255,255,255,0.7)",
            margin: "8px 0 0 0",
            fontWeight: 300,
          }}
        >
          30+ projects across six domains
        </p>
      </div>

      {/* Domain filter pills */}
      <div
        style={{
          position: "absolute",
          bottom: "clamp(16px, 3vh, 32px)",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center",
          zIndex: 10,
          padding: "0 16px",
        }}
      >
        {DOMAINS.map((domain) => {
          const isActive = activeFilter === domain;
          return (
            <button
              key={domain}
              onClick={() => handleFilterClick(domain)}
              aria-label={`Filter by ${DOMAIN_LABELS[domain]}`}
              aria-pressed={isActive}
              style={{
                border: `1px solid ${DOMAIN_COLORS[domain]}`,
                borderRadius: 16,
                padding: "4px 12px",
                fontSize: "0.7rem",
                fontFamily: "var(--font-geist-mono)",
                letterSpacing: "0.05em",
                color: isActive ? "#fff" : DOMAIN_COLORS[domain],
                background: isActive ? DOMAIN_COLORS[domain] : "transparent",
                cursor: "pointer",
                transition: "background 0.2s ease-out, color 0.2s ease-out",
                minHeight: 32,
              }}
            >
              {DOMAIN_LABELS[domain]}
            </button>
          );
        })}
      </div>

      {/* Constellation lines (SVG) */}
      {containerSize.w > 0 && (
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          {lines.map((line, i) => {
            let lineOpacity = 0.06;
            if (activeFilter && line.domain !== activeFilter) lineOpacity = 0.01;
            if (activeProject) lineOpacity = 0.02;
            if (hoveredProject) {
              const hovered = PROJECTS.find((p) => p.id === hoveredProject);
              if (hovered && line.domain === hovered.domain) lineOpacity = 0.12;
              else lineOpacity = 0.02;
            }

            return (
              <line
                key={i}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="rgba(255,255,255,1)"
                strokeWidth={1}
                style={{
                  opacity: lineOpacity,
                  transition: "opacity 0.3s ease-out",
                }}
              />
            );
          })}
        </svg>
      )}

      {/* Cluster labels */}
      {containerSize.w > 0 &&
        !isMobile &&
        DOMAINS.map((domain) => {
          const padX = 80;
          const padY = 80;
          const usableW = containerSize.w - padX * 2;
          const usableH = containerSize.h - padY * 2;
          const center = CLUSTER_CENTERS[domain];
          const cx = padX + center.x * usableW;
          const cy = padY + center.y * usableH;

          let labelOpacity = 0.35;
          if (activeFilter && activeFilter !== domain) labelOpacity = 0.1;
          if (activeFilter === domain) labelOpacity = 0.6;

          return (
            <span
              key={domain}
              style={{
                position: "absolute",
                left: cx,
                top: cy - (isMobile ? 50 : 70),
                transform: "translateX(-50%)",
                fontFamily: "var(--font-geist-mono)",
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: DOMAIN_COLORS[domain],
                opacity: labelOpacity,
                transition: "opacity 0.3s ease-out",
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              {DOMAIN_LABELS[domain]}
            </span>
          );
        })}

      {/* Project dots */}
      {containerSize.w > 0 &&
        PROJECTS.map((project) => {
          const pos = dotPositions.get(project.id);
          if (!pos) return null;

          const size = project.featured ? 20 : 10;
          const isHovered = hoveredProject === project.id;
          const isActive = activeProject === project.id;

          // Compute opacity
          let dotOpacity = 0.7;
          if (activeFilter) {
            dotOpacity = project.domain === activeFilter ? 1.0 : 0.15;
          }
          if (activeProject) {
            dotOpacity = isActive ? 1.0 : 0.25;
          }
          if (hoveredProject && !activeProject) {
            const hovered = PROJECTS.find((p) => p.id === hoveredProject);
            if (hovered) {
              dotOpacity = project.domain === hovered.domain ? 1.0 : 0.35;
            }
          }

          const scale = isHovered ? 1.3 : activeFilter === project.domain ? 1.1 : 1;

          return (
            <div
              key={project.id}
              style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0 }}
            >
              <button
                onClick={() => handleDotClick(project.id)}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
                aria-label={`${project.name} — ${project.client}`}
                style={{
                  position: "absolute",
                  left: pos.x - size / 2,
                  top: pos.y - size / 2,
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  background: DOMAIN_COLORS[project.domain],
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  opacity: dotOpacity,
                  transform: `scale(${scale})`,
                  transition: "transform 0.2s ease-out, opacity 0.3s ease-out",
                  willChange: "transform, opacity",
                  // Ensure minimum touch target
                  boxSizing: "content-box",
                  outline: "none",
                }}
              />

              {/* Featured label */}
              {project.featured && !isMobile && (
                <span
                  style={{
                    position: "absolute",
                    left: pos.x + size / 2 + 8,
                    top: pos.y - 6,
                    fontFamily: "var(--font-geist-sans)",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.7)",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    opacity: dotOpacity,
                    transition: "opacity 0.3s ease-out",
                  }}
                >
                  {project.name}
                </span>
              )}

              {/* Invisible larger touch target overlay */}
              <button
                onClick={() => handleDotClick(project.id)}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
                aria-hidden="true"
                tabIndex={-1}
                style={{
                  position: "absolute",
                  left: pos.x - 22,
                  top: pos.y - 22,
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  outline: "none",
                }}
              />
            </div>
          );
        })}

      {/* Hover tooltip */}
      {hoveredData && !activeProject && !isMobile && (
        <div
          style={{
            position: "fixed",
            left: mousePos.x + 12,
            top: mousePos.y - 8,
            background: "#141414",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            padding: "8px 12px",
            pointerEvents: "none",
            zIndex: 20,
            maxWidth: 240,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#fff",
              fontFamily: "var(--font-geist-sans)",
            }}
          >
            {hoveredData.name}
          </p>
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "0.7rem",
              color: "rgba(255,255,255,0.5)",
              fontFamily: "var(--font-geist-sans)",
            }}
          >
            {hoveredData.client}
          </p>
        </div>
      )}

      {/* Expanded detail card */}
      {activeData && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setActiveProject(null)}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 25,
            }}
          />

          {/* Card */}
          <div
            role="dialog"
            aria-label={activeData.name}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: isMobile ? "calc(100% - 48px)" : 400,
              maxWidth: 400,
              background: "#2a2a2a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "clamp(20px, 3vw, 32px)",
              zIndex: 30,
              animation: "clusterCardIn 0.3s ease-out",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveProject(null)}
              aria-label="Close project details"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "transparent",
                color: "rgba(255,255,255,0.6)",
                fontSize: "1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              ✕
            </button>

            {/* Domain pill */}
            <span
              style={{
                display: "inline-block",
                borderRadius: 16,
                padding: "3px 10px",
                fontSize: "0.65rem",
                fontFamily: "var(--font-geist-mono)",
                letterSpacing: "0.05em",
                color: "#fff",
                background: DOMAIN_COLORS[activeData.domain],
                marginBottom: 12,
              }}
            >
              {DOMAIN_LABELS[activeData.domain]}
            </span>

            {/* Title */}
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "clamp(1.1rem, 2vw, 1.3rem)",
                fontWeight: 500,
                color: "#fff",
                fontFamily: "var(--font-geist-sans)",
                lineHeight: 1.3,
                paddingRight: 24,
              }}
            >
              {activeData.name}
            </h3>

            {/* Client & year */}
            <p
              style={{
                margin: "0 0 16px 0",
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.5)",
                fontFamily: "var(--font-geist-sans)",
              }}
            >
              {activeData.client} · {activeData.year}
            </p>

            {/* Summary */}
            <p
              style={{
                margin: "0 0 24px 0",
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.7)",
                fontFamily: "var(--font-geist-sans)",
                lineHeight: 1.5,
              }}
            >
              {activeData.summary}
            </p>

            {/* Link */}
            <a
              href="#"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                color: DOMAIN_COLORS[activeData.domain],
                fontFamily: "var(--font-geist-sans)",
                textDecoration: "none",
              }}
            >
              View project →
            </a>
          </div>
        </>
      )}

      {/* Keyframe animation (injected once) */}
      <style>{`
        @keyframes clusterCardIn {
          from {
            opacity: 0;
            transform: translate(-50%, -48%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
}
