"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import type p5Type from "p5";

/* ───────────── Types ───────────── */

type Domain = "health" | "education" | "integration" | "urban" | "climate" | "digital";

type Project = {
  id: string;
  name: string;
  client: string;
  domain: Domain;
  summary: string;
  featured: boolean;
  year: number;
};

type ConnectionType = "domain" | "method" | "scale" | "theme";

type Connection = {
  from: string;
  to: string;
  type: ConnectionType;
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
  { id: "h1", name: "Redesigning Elderly Care Pathways", client: "Trondheim Kommune", domain: "health", summary: "Rethinking how elderly care is coordinated across home services, GPs, and hospitals.", featured: true, year: 2023 },
  { id: "h2", name: "Digital Health Literacy", client: "Helsedirektoratet", domain: "health", summary: "Improving how patients understand and navigate digital health services.", featured: false, year: 2022 },
  { id: "h3", name: "Mental Health Service Mapping", client: "Bergen Kommune", domain: "health", summary: "Mapping the patient journey through municipal mental health services.", featured: false, year: 2021 },
  { id: "h4", name: "Home Care Coordination", client: "Stavanger Kommune", domain: "health", summary: "Streamlining communication between home care workers and families.", featured: false, year: 2023 },
  { id: "h5", name: "Hospital Wayfinding", client: "St. Olavs Hospital", domain: "health", summary: "Redesigning physical and digital wayfinding for a major university hospital.", featured: false, year: 2022 },

  // Education
  { id: "e1", name: "Student Housing Against Loneliness", client: "SiT Trondheim", domain: "education", summary: "Designing common areas in student housing to reduce loneliness and build community.", featured: true, year: 2023 },
  { id: "e2", name: "Learning Space Innovation", client: "NTNU", domain: "education", summary: "Rethinking university learning spaces for hybrid teaching models.", featured: false, year: 2024 },
  { id: "e3", name: "Teacher Collaboration Platform", client: "Utdanningsdirektoratet", domain: "education", summary: "Designing tools for cross-school teacher knowledge sharing.", featured: false, year: 2022 },
  { id: "e4", name: "Vocational Training Pathways", client: "Trøndelag Fylkeskommune", domain: "education", summary: "Reimagining the journey from vocational school to employment.", featured: false, year: 2023 },
  { id: "e5", name: "Library as Third Place", client: "Deichman Bibliotek", domain: "education", summary: "Transforming public libraries into vibrant community learning hubs.", featured: false, year: 2021 },

  // Integration
  { id: "i1", name: "Humanizing the Asylum Process for Children", client: "UDI / UNE / PU", domain: "integration", summary: "Creating child-friendly services across Norway's immigration authorities.", featured: true, year: 2022 },
  { id: "i2", name: "Language Learning Ecosystems", client: "IMDi", domain: "integration", summary: "Mapping how refugees access and navigate language learning opportunities.", featured: false, year: 2023 },
  { id: "i3", name: "Cultural Navigator Service", client: "Drammen Kommune", domain: "integration", summary: "Designing peer-to-peer cultural navigation for newly arrived families.", featured: false, year: 2022 },
  { id: "i4", name: "Employment Bridge Program", client: "NAV Intro", domain: "integration", summary: "Connecting skilled immigrants with employers through structured mentorship.", featured: false, year: 2024 },
  { id: "i5", name: "Digital Inclusion for Seniors", client: "Røde Kors", domain: "integration", summary: "Helping elderly immigrants access essential digital services.", featured: false, year: 2021 },

  // Urban
  { id: "u1", name: "Neighbourhood Identity Mapping", client: "Oslo Kommune", domain: "urban", summary: "Co-creating neighbourhood identities with residents to guide urban planning.", featured: true, year: 2024 },
  { id: "u2", name: "Car-Free City Centre", client: "Tromsø Kommune", domain: "urban", summary: "Designing the transition experience for a pedestrianized city centre.", featured: false, year: 2023 },
  { id: "u3", name: "Waterfront Public Space", client: "Bodø Kommune", domain: "urban", summary: "Envisioning inclusive public spaces along the harbour redevelopment.", featured: false, year: 2022 },
  { id: "u4", name: "School Route Safety", client: "Bærum Kommune", domain: "urban", summary: "Mapping and improving safe walking routes to schools with children.", featured: false, year: 2023 },
  { id: "u5", name: "Rural Co-Working Spaces", client: "Distriktssenteret", domain: "urban", summary: "Designing shared workspaces that strengthen rural communities.", featured: false, year: 2024 },

  // Climate
  { id: "c1", name: "Circular Economy Mapping", client: "Miljødirektoratet", domain: "climate", summary: "Visualizing material flows to identify circular economy opportunities.", featured: true, year: 2023 },
  { id: "c2", name: "Green Mobility Nudging", client: "Ruter", domain: "climate", summary: "Designing behavioural nudges for sustainable transport choices.", featured: false, year: 2022 },
  { id: "c3", name: "Climate Budget Communication", client: "Kristiansand Kommune", domain: "climate", summary: "Making municipal climate budgets understandable for citizens.", featured: false, year: 2024 },
  { id: "c4", name: "Food Waste Reduction", client: "Matvett", domain: "climate", summary: "Service design for reducing food waste in grocery supply chains.", featured: false, year: 2021 },
  { id: "c5", name: "Nature-Based Solutions Toolkit", client: "NINA", domain: "climate", summary: "A toolkit helping municipalities plan with nature, not against it.", featured: false, year: 2023 },

  // Digital
  { id: "d1", name: "Supporting Vulnerable Young Men", client: "NAV / Trondheim Kommune", domain: "digital", summary: "A new cross-institutional service helping young men in the transition to adulthood.", featured: true, year: 2023 },
  { id: "d2", name: "Digital Samtykke Platform", client: "Digitaliseringsdirektoratet", domain: "digital", summary: "Designing a consent management platform for public data sharing.", featured: false, year: 2024 },
  { id: "d3", name: "Citizen Dashboard", client: "KS", domain: "digital", summary: "A unified view of all municipal services for citizens.", featured: false, year: 2022 },
  { id: "d4", name: "AI Ethics Framework", client: "Datatilsynet", domain: "digital", summary: "Practical guidelines for ethical AI use in public services.", featured: false, year: 2023 },
  { id: "d5", name: "Cross-Agency Case Management", client: "DFØ", domain: "digital", summary: "Redesigning how cases flow across government agencies.", featured: false, year: 2021 },
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

/* ───────────── Helpers ───────────── */

function seededRandom(seed: string, index: number): number {
  let hash = 0;
  const str = seed + index;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return (hash % 1000) / 1000;
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
  height: number
): Record<string, NodePosition> {
  const clusterCenters: Record<Domain, { x: number; y: number }> = {
    health: { x: width * 0.2, y: height * 0.3 },
    education: { x: width * 0.5, y: height * 0.2 },
    integration: { x: width * 0.8, y: height * 0.3 },
    urban: { x: width * 0.15, y: height * 0.65 },
    climate: { x: width * 0.5, y: height * 0.75 },
    digital: { x: width * 0.82, y: height * 0.68 },
  };

  const spreadRadius = Math.min(width, height) * 0.08;
  const positions: Record<string, NodePosition> = {};

  for (const project of PROJECTS) {
    const center = clusterCenters[project.domain];
    const rx = seededRandom(project.id, 0) * spreadRadius;
    const ry = seededRandom(project.id, 1) * spreadRadius;
    const x = center.x + rx;
    const y = center.y + ry;
    positions[project.id] = { baseX: x, baseY: y, x, y };
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

  /* ── Setup p5 + animation loop ── */
  useEffect(() => {
    const container = containerRef.current;
    const canvasContainer = canvasContainerRef.current;
    if (!container || !canvasContainer) return;

    const rect = container.getBoundingClientRect();
    sizeRef.current = { width: rect.width, height: rect.height };
    positionsRef.current = computeNodePositions(rect.width, rect.height);

    // Init particles for each connection
    particlesRef.current = CONNECTIONS.map((conn, i) => {
      const from = positionsRef.current[conn.from];
      const to = positionsRef.current[conn.to];
      if (!from || !to) return [];
      return initParticles(i, from, to);
    });

    // Position node divs initially
    for (const project of PROJECTS) {
      const pos = positionsRef.current[project.id];
      const el = nodeRefsMap.current[project.id];
      if (pos && el) {
        const size = project.featured ? 20 : 10;
        el.style.left = `${pos.x - size / 2}px`;
        el.style.top = `${pos.y - size / 2}px`;
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
        };

        p.draw = () => {
          p.clear();
          frameRef.current++;
          const time = frameRef.current * 0.01;
          const positions = positionsRef.current;
          const highlighted = highlightedRef.current;

          // Drift nodes
          for (const project of PROJECTS) {
            const pos = positions[project.id];
            if (!pos) continue;
            const driftX = Math.sin(time + seededRandom(project.id, 10) * 6.28) * 8;
            const driftY = Math.cos(time * 0.7 + seededRandom(project.id, 11) * 6.28) * 8;
            pos.x = pos.baseX + driftX;
            pos.y = pos.baseY + driftY;

            // Update HTML node positions via ref
            const el = nodeRefsMap.current[project.id];
            if (el) {
              const size = project.featured ? 20 : 10;
              el.style.left = `${pos.x - size / 2}px`;
              el.style.top = `${pos.y - size / 2}px`;
            }
            const label = labelRefsMap.current[project.id];
            if (label) {
              label.style.left = `${pos.x + 16}px`;
              label.style.top = `${pos.y - 8}px`;
            }
          }

          // Draw particle connections
          for (let ci = 0; ci < CONNECTIONS.length; ci++) {
            const conn = CONNECTIONS[ci];
            const fromPos = positions[conn.from];
            const toPos = positions[conn.to];
            if (!fromPos || !toPos) continue;

            const particles = particlesRef.current[ci];
            if (!particles) continue;

            const isHighlighted = highlighted
              ? conn.from === highlighted || conn.to === highlighted
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

            let alpha: number;
            if (highlighted) {
              alpha = isHighlighted ? baseAlpha * 3.5 : baseAlpha * 0.3;
            } else {
              alpha = baseAlpha;
            }

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
        positionsRef.current = computeNodePositions(width, height);

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

      // Dim/brighten nodes
      for (const p of PROJECTS) {
        const el = nodeRefsMap.current[p.id];
        if (!el) continue;
        if (p.id === project.id) {
          el.style.transform = "scale(1.4)";
          el.style.opacity = "1";
        } else if (p.domain === project.domain) {
          el.style.transform = "scale(1)";
          el.style.opacity = "1";
        } else {
          el.style.transform = "scale(1)";
          el.style.opacity = "0.3";
        }
      }
      // Dim/brighten labels
      for (const p of PROJECTS) {
        const label = labelRefsMap.current[p.id];
        if (!label) continue;
        if (p.domain === project.domain) {
          label.style.opacity = "1";
        } else {
          label.style.opacity = "0.3";
        }
      }
    },
    []
  );

  const handleNodeLeave = useCallback(() => {
    highlightedRef.current = null;
    setHoveredProject(null);

    for (const p of PROJECTS) {
      const el = nodeRefsMap.current[p.id];
      if (el) {
        el.style.transform = "scale(1)";
        el.style.opacity = "0.8";
      }
      const label = labelRefsMap.current[p.id];
      if (label) {
        label.style.opacity = "0.8";
      }
    }
  }, []);

  const handleNodeMove = useCallback(
    (e: React.MouseEvent) => {
      if (hoveredProject) {
        setTooltipPos({ x: e.clientX, y: e.clientY });
      }
    },
    [hoveredProject]
  );

  /* ── Cluster center positions for domain labels ── */
  const getClusterCenters = useCallback(() => {
    const { width, height } = sizeRef.current;
    return {
      health: { x: width * 0.2, y: height * 0.3 },
      education: { x: width * 0.5, y: height * 0.2 },
      integration: { x: width * 0.8, y: height * 0.3 },
      urban: { x: width * 0.15, y: height * 0.65 },
      climate: { x: width * 0.5, y: height * 0.75 },
      digital: { x: width * 0.82, y: height * 0.68 },
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
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
          top: 32,
          left: 32,
          zIndex: 10,
        }}
      >
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

      {/* HTML overlay: domain labels */}
      {(Object.keys(DOMAIN_LABELS) as Domain[]).map((domain) => {
        const centers = getClusterCenters();
        const center = centers[domain];
        return (
          <div
            key={domain}
            style={{
              position: "absolute",
              left: center.x,
              top: center.y - 40,
              transform: "translateX(-50%)",
              fontFamily: "var(--font-geist-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.25)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            {DOMAIN_LABELS[domain]}
          </div>
        );
      })}

      {/* HTML overlay: project nodes */}
      {PROJECTS.map((project) => {
        const size = project.featured ? 20 : 10;
        const color = DOMAIN_COLORS[project.domain];
        const rgb = hexToRgb(color);
        return (
          <React.Fragment key={project.id}>
            <div
              ref={(el) => { nodeRefsMap.current[project.id] = el; }}
              onMouseEnter={(e) => handleNodeEnter(project, e)}
              onMouseLeave={handleNodeLeave}
              onMouseMove={handleNodeMove}
              style={{
                position: "absolute",
                width: size,
                height: size,
                borderRadius: "50%",
                backgroundColor: color,
                boxShadow: `0 0 8px rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`,
                cursor: "pointer",
                opacity: 0.8,
                transition: "transform 0.2s ease-out, opacity 0.3s ease",
                willChange: "transform",
                zIndex: 10,
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
      })}

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

      {/* Tooltip */}
      {hoveredProject && (
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
    </div>
  );
}
