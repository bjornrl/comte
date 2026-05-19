"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type {
  Project as NetProject,
  Domain,
  Method,
  Scale,
} from "./projectNetworkData";
import { METHOD_LABELS, SCALE_LABELS } from "./projectNetworkData";

// Domains rendered in the cluster view. The palette is tuned for the beige
// (#F5F5E9) panel background — each colour clears WCAG AA 4.5:1 on beige so
// the filter pill labels and small node labels stay readable, and the hues
// are spread far enough apart that all eight remain visually distinct.
const DOMAIN_COLORS: Record<Domain, string> = {
  health: "#2E7855",      // forest green
  education: "#C73D74",   // magenta
  integration: "#C04B1F", // burnt orange
  urban: "#3D5C75",       // slate blue
  climate: "#4F6F33",     // olive moss
  digital: "#CC4444",     // deep red
  culture: "#7A3D8A",     // deep purple
  policy: "#555E70",      // gray-blue
};

const DOMAIN_LABELS: Record<Domain, string> = {
  health: "Health & Care",
  education: "Childhood & Education",
  integration: "Inclusion & Participation",
  urban: "Urban Development",
  climate: "Climate & Sustainability",
  digital: "Digital Transformation",
  culture: "Culture",
  policy: "Policy",
};

const VISIBLE_DOMAINS: Domain[] = [
  "education",
  "culture",
  "health",
  "climate",
  "digital",
  "integration",
  "urban",
  "policy",
];

// Brand colours used by the cluster chrome on the beige background.
const FG_DARK = "#1F3A32";
const BG_CREAM = "#F5F5E9";

// Stable seed for the random scatter so the dot layout doesn't reshuffle on
// every render (which would jitter the constellation as projects load in).
const SCATTER_SEED = "comte-projects-scatter";

// Fallback seed projects (used when Sanity has no projects yet).
type SeedProject = {
  id: string;
  name: string;
  client: string;
  domain: Domain;
  summary: string;
  featured: boolean;
  year: number;
};

const SEED_PROJECTS: SeedProject[] = [
  // Health
  { id: "h1", name: "Redesigning Elderly Care Pathways", client: "Trondheim Municipality", domain: "health", summary: "Rethinking how elderly care is coordinated across home services, GPs, and hospitals.", featured: true, year: 2023 },
  { id: "h2", name: "Digital Health Literacy", client: "Helsedirektoratet", domain: "health", summary: "Improving how patients understand and navigate digital health services.", featured: false, year: 2022 },
  { id: "h3", name: "Mental Health in Schools", client: "Bergen Kommune", domain: "health", summary: "Co-designing early intervention tools for student mental health support.", featured: false, year: 2024 },
  // Education
  { id: "e1", name: "Student Housing Against Loneliness", client: "SiT Trondheim", domain: "education", summary: "Designing common areas in student housing to reduce loneliness and build community.", featured: true, year: 2023 },
  { id: "e2", name: "Vocational Training Futures", client: "Utdanningsdirektoratet", domain: "education", summary: "Reimagining vocational training pathways for a changing job market.", featured: false, year: 2024 },
  // Integration
  { id: "i1", name: "Humanizing the Asylum Process for Children", client: "UDI / UNE / PU", domain: "integration", summary: "Creating child-friendly services across Norway's immigration authorities.", featured: true, year: 2022 },
  { id: "i2", name: "Language Learning Pathways", client: "IMDi", domain: "integration", summary: "Designing personalized language learning journeys for newly arrived refugees.", featured: false, year: 2023 },
  // Urban
  { id: "u1", name: "Neighbourhood Identity Mapping", client: "Oslo Kommune", domain: "urban", summary: "Co-creating neighbourhood identities with residents to guide urban planning.", featured: false, year: 2024 },
  { id: "u2", name: "Car-Free City Centre", client: "Trondheim Kommune", domain: "urban", summary: "Designing the transition to a pedestrian-first city centre experience.", featured: false, year: 2023 },
  // Climate
  { id: "c1", name: "Circular Economy Service Design", client: "Miljødirektoratet", domain: "climate", summary: "Designing public-facing services that make circular economy participation intuitive.", featured: false, year: 2024 },
  { id: "c2", name: "Green Building Behaviour", client: "Enova", domain: "climate", summary: "Nudging residents toward energy-efficient behaviours in new housing developments.", featured: false, year: 2023 },
  // Digital
  { id: "d1", name: "Supporting Vulnerable Young Men", client: "NAV / Trondheim Municipality", domain: "digital", summary: "A new cross-institutional service helping young men in the transition to adulthood.", featured: true, year: 2023 },
  { id: "d2", name: "Digital Inclusion for Seniors", client: "Digitaliseringsdirektoratet", domain: "digital", summary: "Ensuring elderly citizens can access critical public services online.", featured: false, year: 2022 },
];

function seedToNetProject(p: SeedProject): NetProject {
  return {
    id: p.id,
    name: p.name,
    client: p.client,
    domain: p.domain,
    summary: p.summary,
    featured: p.featured,
    year: p.year,
    scale: "municipal",
    methods: [] as Method[],
    innovationLevel: "incremental",
  };
}

const FALLBACK_NET_PROJECTS: NetProject[] = SEED_PROJECTS.map(seedToNetProject);

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  };
}

const DEFAULT_BG = BG_CREAM;

type ProjectClusterProps = {
  projects?: NetProject[];
  backgroundColor?: string;
  heading?: string;
};

export default function ProjectCluster({ projects, backgroundColor, heading }: ProjectClusterProps) {
  // Only include projects whose domain is visible in this view.
  const incoming = projects?.length ? projects : FALLBACK_NET_PROJECTS;
  const activeProjects = useMemo(
    () => incoming.filter((p) => VISIBLE_DOMAINS.includes(p.domain)),
    [incoming],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Domain | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [photoIdx, setPhotoIdx] = useState(0);

  // Refs used by the rAF loop that drives the per-dot drift and cursor-snap
  // motion. Keeping these out of React state means the animation never
  // triggers a re-render — we mutate DOM `transform`s and line endpoint
  // attributes directly each frame.
  const dotWrappersRef = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  const lineRefsRef = useRef<Map<string, SVGLineElement | null>>(new Map());
  const offsetsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  // Mouse position mirrored into a ref so the rAF closure doesn't have to
  // depend on the mousePos state (which would restart the effect on every
  // pointer move). Start far off-screen so a stationary cursor at (0,0)
  // doesn't snap a dot in the top-left corner.
  const mousePosRef = useRef({ x: -10000, y: -10000 });
  // Last hovered project id that we pushed into state — lets the rAF loop
  // avoid calling setHoveredProject every frame, only on actual transitions.
  const lastHoverIdRef = useRef<string | null>(null);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute dot positions — random scatter with minimum-distance spacing
  // (Poisson-disk-style rejection sampling). Seeded so the layout is stable
  // across renders. Each project gets up to MAX_ATTEMPTS tries to land at
  // least `minDist` pixels from every already-placed dot; if no candidate
  // clears the bar within the budget, the dot is placed at the last
  // candidate (so we never infinite-loop on dense layouts).
  const dotPositions = useMemo(() => {
    if (containerSize.w === 0) return new Map<string, { x: number; y: number }>();
    const isMobile = containerSize.w < 768;
    // Reserve generous top room for the section heading and bottom room for
    // the (navbar-sized) filter bar. The bottom budget covers the filter
    // pills (48 px tall) + their bottom offset (clamp 16–32 px) + a
    // breathing gap, doubled-up so wrapped pill rows on narrower viewports
    // still don't touch any dots.
    const padX = isMobile ? 24 : 80;
    const padTop = isMobile ? 140 : 180;
    const padBottom = isMobile ? 200 : 200;
    const usableW = Math.max(0, containerSize.w - padX * 2);
    const usableH = Math.max(0, containerSize.h - padTop - padBottom);
    if (usableW === 0 || usableH === 0)
      return new Map<string, { x: number; y: number }>();

    // Min distance scales with the per-dot area so density stays similar on
    // small and large viewports. 0.65× the ideal grid spacing gives some
    // organic clumping without overlap (dots are 10–20 px).
    const minDist =
      Math.sqrt((usableW * usableH) / Math.max(1, activeProjects.length)) * 0.65;
    const MAX_ATTEMPTS = 200;

    const rng = seededRandom(SCATTER_SEED);
    const positions = new Map<string, { x: number; y: number }>();
    const placed: { x: number; y: number }[] = [];

    for (const project of activeProjects) {
      let chosen: { x: number; y: number } | null = null;
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const candidate = {
          x: padX + rng() * usableW,
          y: padTop + rng() * usableH,
        };
        let conflict = false;
        for (const p of placed) {
          if (Math.hypot(p.x - candidate.x, p.y - candidate.y) < minDist) {
            conflict = true;
            break;
          }
        }
        if (!conflict) {
          chosen = candidate;
          break;
        }
        // Keep the last candidate as a fallback so we never end up with null.
        chosen = candidate;
      }
      if (chosen) {
        positions.set(project.id, chosen);
        placed.push(chosen);
      }
    }
    return positions;
  }, [containerSize, activeProjects]);

  // Constellation lines — every node ends up with at most MAX_DEGREE edges.
  // For each project we shuffle its NEAREST_POOL closest neighbours and walk
  // them in random order, accepting an edge only if neither endpoint has
  // already hit the degree cap. The result is a sparse web (≈ N edges for
  // N nodes) where the picks favour the local neighbourhood but the random
  // walk introduces enough variation that lines aren't strictly to the very
  // nearest neighbour. Endpoint IDs are kept so the filter / animation
  // logic can address each line by its endpoints.
  const lines = useMemo(() => {
    if (dotPositions.size === 0) return [];
    const rng = seededRandom("comte-projects-connections");
    const NEAREST_POOL = 7;
    const MAX_DEGREE = 2;
    const result: {
      fromId: string;
      toId: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }[] = [];
    const connected = new Set<string>();
    const degree = new Map<string, number>();
    const getDeg = (id: string) => degree.get(id) ?? 0;

    for (const project of activeProjects) {
      if (getDeg(project.id) >= MAX_DEGREE) continue;
      const pos = dotPositions.get(project.id);
      if (!pos) continue;
      const ranked = activeProjects
        .filter((p) => p.id !== project.id)
        .map((p) => {
          const nPos = dotPositions.get(p.id);
          if (!nPos) return null;
          return {
            id: p.id,
            dist: Math.hypot(nPos.x - pos.x, nPos.y - pos.y),
            pos: nPos,
          };
        })
        .filter((n): n is { id: string; dist: number; pos: { x: number; y: number } } => n !== null)
        .sort((a, b) => a.dist - b.dist);

      // Shuffled nearest pool (Fisher-Yates via the seeded RNG).
      const nearPool = ranked.slice(0, NEAREST_POOL).slice();
      for (let i = nearPool.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [nearPool[i], nearPool[j]] = [nearPool[j], nearPool[i]];
      }

      for (const n of nearPool) {
        if (getDeg(project.id) >= MAX_DEGREE) break;
        if (getDeg(n.id) >= MAX_DEGREE) continue;
        const key = [project.id, n.id].sort().join("-");
        if (connected.has(key)) continue;
        connected.add(key);
        degree.set(project.id, getDeg(project.id) + 1);
        degree.set(n.id, getDeg(n.id) + 1);
        result.push({
          fromId: project.id,
          toId: n.id,
          x1: pos.x,
          y1: pos.y,
          x2: n.pos.x,
          y2: n.pos.y,
        });
      }
    }
    return result;
  }, [dotPositions, activeProjects]);

  // Domain lookup for quick filter-match checks against line endpoints.
  const projectDomainById = useMemo(() => {
    const map = new Map<string, Domain>();
    for (const p of activeProjects) map.set(p.id, p.domain);
    return map;
  }, [activeProjects]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveProject(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Mirror mousePos state into a ref so the animation loop reads the latest
  // cursor coords without depending on the state (which would restart the
  // effect on every pointer move).
  useEffect(() => {
    mousePosRef.current = mousePos;
  }, [mousePos]);

  // rAF loop — every frame we compute a per-dot offset = ambient drift +
  // cursor snap, smoothed toward the previous frame's offset, and apply it
  // to the dot's wrapper as a translate3d. The constellation lines follow:
  // each line's x1/y1/x2/y2 is rewritten using the endpoints' offsets so
  // the web breathes with the dots. All updates go straight to the DOM —
  // no setState, no re-renders.
  useEffect(() => {
    const section = containerRef.current;
    if (!section || dotPositions.size === 0) return;

    // Per-project drift phases/frequencies, seeded from the project ID so
    // the assignments are stable across mounts and every dot wobbles on
    // its own rhythm (no synchronised "marching" effect).
    const phases = new Map<
      string,
      { px: number; py: number; fx: number; fy: number }
    >();
    for (const project of activeProjects) {
      const rng = seededRandom(project.id + "-drift");
      phases.set(project.id, {
        px: rng() * Math.PI * 2,
        py: rng() * Math.PI * 2,
        fx: 0.07 + rng() * 0.06, // 0.07–0.13 Hz
        fy: 0.07 + rng() * 0.06,
      });
    }

    const DRIFT_AMP = 6;        // px — ambient wobble amplitude
    const SNAP_RADIUS = 110;    // px — cursor proximity that triggers snap
    const HOVER_RADIUS = 110;   // px — within this anchor-distance, dot is "hovered"
    // No position smoothing: the dot tracks the cursor instantly when
    // snapped. Drift is already a smooth sine wave, so it doesn't need
    // smoothing either. Engage/release transitions are softened by ramping
    // `snapFactor` over a few frames (see SNAP_RAMP below).
    const SNAP_RAMP = 0.35;     // per-frame ramp rate of snap engagement

    // Per-project ramped snap engagement (0 = pure drift, 1 = pure cursor
    // tracking). Smoothing the FACTOR over a few frames gives the visual
    // a soft engage/release while keeping cursor tracking instant when the
    // factor is at 1.
    const snapFactors = new Map<string, number>();

    let rafId: number | null = null;
    const t0 = performance.now();

    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      const rect = section.getBoundingClientRect();
      const mx = mousePosRef.current.x - rect.left;
      const my = mousePosRef.current.y - rect.top;

      // Single pass to find the project whose anchor is nearest the cursor.
      // ONLY that project gets the snap + hover treatment — every other dot
      // is purely on drift. This guarantees one-dot-at-a-time interaction
      // and makes hover detection deterministic (no reliance on the browser
      // getting mouseover/enter timing right across rapidly-moving buttons).
      let nearestId: string | null = null;
      let nearestDist = Infinity;
      for (const project of activeProjects) {
        const anchor = dotPositions.get(project.id);
        if (!anchor) continue;
        const d = Math.hypot(mx - anchor.x, my - anchor.y);
        if (d < nearestDist) {
          nearestDist = d;
          nearestId = project.id;
        }
      }
      const inSnapRange = nearestId !== null && nearestDist < SNAP_RADIUS;
      const inHoverRange = nearestId !== null && nearestDist < HOVER_RADIUS;

      // Push hover state into React only on transitions — calling setState
      // every frame would re-render the whole cluster constantly. The ref
      // is the local source of truth; the state setter just notifies React.
      const newHoverId = inHoverRange ? nearestId : null;
      if (newHoverId !== lastHoverIdRef.current) {
        lastHoverIdRef.current = newHoverId;
        setHoveredProject(newHoverId);
      }

      for (const project of activeProjects) {
        const anchor = dotPositions.get(project.id);
        if (!anchor) continue;
        const ph = phases.get(project.id);
        if (!ph) continue;

        // Ramp this project's snap engagement. Target = 1 if this is the
        // nearest dot within range, else 0. The ramp gives a soft "grab"
        // when the cursor enters range and a soft "release" when it
        // leaves — without slowing the dot's tracking of the cursor once
        // engagement is at 1.
        const targetSnapFactor =
          inSnapRange && project.id === nearestId ? 1 : 0;
        const currentSF = snapFactors.get(project.id) ?? 0;
        const sf = currentSF + (targetSnapFactor - currentSF) * SNAP_RAMP;
        snapFactors.set(project.id, sf);

        // Raw snap = cursor relative to anchor → dot sits exactly under cursor.
        // The ramped factor `sf` scales both the snap pull and the drift
        // suppression, so engage/release is smooth but tracking is instant.
        const snapX = (mx - anchor.x) * sf;
        const snapY = (my - anchor.y) * sf;

        // Ambient drift around the anchor, faded out by the snap factor so
        // a snapped dot doesn't wobble.
        const driftMult = 1 - sf;
        const driftX =
          Math.sin(2 * Math.PI * ph.fx * t + ph.px) * DRIFT_AMP * driftMult;
        const driftY =
          Math.cos(2 * Math.PI * ph.fy * t + ph.py) * DRIFT_AMP * driftMult;

        const offX = driftX + snapX;
        const offY = driftY + snapY;
        offsetsRef.current.set(project.id, { x: offX, y: offY });

        const wrapper = dotWrappersRef.current.get(project.id);
        if (wrapper) {
          wrapper.style.transform = `translate3d(${offX}px, ${offY}px, 0)`;
        }
      }

      // Make the connecting lines follow the dots by writing the offset
      // endpoints back to each <line>'s attributes.
      for (const d of lines) {
        const key = [d.fromId, d.toId].sort().join("-");
        const line = lineRefsRef.current.get(key);
        if (!line) continue;
        const ofFrom = offsetsRef.current.get(d.fromId) ?? { x: 0, y: 0 };
        const ofTo = offsetsRef.current.get(d.toId) ?? { x: 0, y: 0 };
        line.setAttribute("x1", String(d.x1 + ofFrom.x));
        line.setAttribute("y1", String(d.y1 + ofFrom.y));
        line.setAttribute("x2", String(d.x2 + ofTo.x));
        line.setAttribute("y2", String(d.y2 + ofTo.y));
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [dotPositions, activeProjects, lines]);

  const handleDotClick = useCallback((projectId: string) => {
    setActiveProject((prev) => (prev === projectId ? null : projectId));
  }, []);
  const handleFilterClick = useCallback((domain: Domain) => {
    setActiveFilter((prev) => (prev === domain ? null : domain));
  }, []);

  // Native pointer-event listener for the cursor. React's synthetic
  // `onMouseMove` was failing to fire during cursor hover on the user's
  // hardware (only working during click-and-hold). Native pointer events
  // sidestep that entirely and unify mouse + pen + touch.
  //
  // The ref is updated synchronously on every event (read every rAF frame
  // for snap + hover detection). The React state is rate-limited to one
  // update per animation frame so that 120–500 Hz mice don't trigger a
  // re-render flood, which would starve the rAF loop and cause the snap
  // to jitter instead of smoothly converging on the cursor. State is only
  // needed for the tooltip's position, so this throttle is invisible.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let rafPending = false;
    const flushState = () => {
      rafPending = false;
      setMousePos({ ...mousePosRef.current });
    };
    const schedule = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(flushState);
    };
    const onMove = (e: PointerEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      schedule();
    };
    const onLeave = () => {
      // Park cursor far off-screen so the rAF loop's nearest-dot search
      // finds nothing in range — no dot stays stuck snapped/hovered.
      mousePosRef.current = { x: -10000, y: -10000 };
      schedule();
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointercancel", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointercancel", onLeave);
    };
  }, []);

  const hoveredData = hoveredProject ? activeProjects.find((p) => p.id === hoveredProject) : null;
  const activeData = activeProject ? activeProjects.find((p) => p.id === activeProject) : null;

  useEffect(() => {
    setPhotoIdx(0);
  }, [activeProject]);

  const galleryUrls = useMemo(() => {
    if (!activeData) return [];
    const g = activeData.galleryUrls?.filter(Boolean);
    if (g && g.length > 0) return g;
    if (activeData.heroImageUrl) return [activeData.heroImageUrl];
    return [];
  }, [activeData]);

  const isMobile = containerSize.w < 768;

  return (
    <section
      ref={containerRef}
      className="relative h-full w-full overflow-hidden select-none"
      style={{ background: backgroundColor ?? DEFAULT_BG }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setActiveProject(null);
      }}
    >
      {/* Section header */}
      {heading && (
        <div
          style={{
            position: "absolute",
            // Sits one PANEL_PADDING below the nav (same as other sections).
            top: "calc(clamp(1rem, 2.5vw, 2.5rem) + 48px + clamp(2rem, 5vw, 5rem))",
            left: "clamp(2rem, 5vw, 5rem)",
            zIndex: 10,
            maxWidth: "20ch",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-manrope), system-ui, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
              color: FG_DARK,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {heading}
          </h2>
        </div>
      )}

      {/* Tag filter pills. Size + typography match BlobNav (48 px tall,
          Work Sans 0.95 rem, 4 px gap) so the bottom bar reads as the
          horizontal counterpart to the top nav. Per-domain colour is kept
          as the visual cue: outlined-in-domain-colour when idle, filled
          when active. */}
      <div
        style={{
          position: "absolute",
          bottom: "clamp(16px, 3vh, 32px)",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          justifyContent: "center",
          zIndex: 10,
          padding: "0 16px",
          maxWidth: "calc(100vw - 32px)",
        }}
      >
        {VISIBLE_DOMAINS.map((domain) => {
          const isActive = activeFilter === domain;
          return (
            <button
              key={domain}
              onClick={() => handleFilterClick(domain)}
              aria-label={`Filter by ${DOMAIN_LABELS[domain]}`}
              aria-pressed={isActive}
              style={{
                // 48 px tall to mirror BlobNav's BOX_HEIGHT. Padding is
                // also asymmetric (top 4, bottom 0) so the lowercase text
                // sits slightly below visual centre — the same trick the
                // nav uses to centre Work Sans's x-height optically.
                height: 48,
                padding: "4px 14px 0 14px",
                border: `1px solid ${DOMAIN_COLORS[domain]}`,
                borderRadius: 0,
                fontFamily: "var(--font-work-sans), system-ui, sans-serif",
                fontSize: "0.95rem",
                fontWeight: 400,
                letterSpacing: "0.01em",
                textTransform: "lowercase",
                color: isActive ? BG_CREAM : DOMAIN_COLORS[domain],
                background: isActive ? DOMAIN_COLORS[domain] : "transparent",
                cursor: "pointer",
                transition: "background 0.2s ease-out, color 0.2s ease-out",
                whiteSpace: "nowrap",
                lineHeight: 1,
              }}
            >
              {DOMAIN_LABELS[domain]}
            </button>
          );
        })}
      </div>

      {/* Constellation lines. Dark-green hairlines on beige; the per-line
          opacity reacts to hover / open card / active filter so the web
          recedes when something else demands attention. With endpoints'
          IDs stored, the filter logic dims lines whose endpoints don't
          touch the active filter. */}
      {containerSize.w > 0 && (
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          aria-hidden="true"
        >
          {lines.map((line) => {
            const key = [line.fromId, line.toId].sort().join("-");
            // Quieter baseline: the lines should read as faint connective
            // tissue rather than competing with the dots themselves.
            let lineOpacity = 0.10;
            if (activeFilter) {
              const fromDomain = projectDomainById.get(line.fromId);
              const toDomain = projectDomainById.get(line.toId);
              const touches = fromDomain === activeFilter || toDomain === activeFilter;
              lineOpacity = touches ? 0.18 : 0.03;
            }
            if (activeProject) {
              const touches = line.fromId === activeProject || line.toId === activeProject;
              lineOpacity = touches ? 0.22 : 0.03;
            }
            if (hoveredProject) {
              const touches = line.fromId === hoveredProject || line.toId === hoveredProject;
              lineOpacity = touches ? 0.28 : 0.05;
            }
            return (
              <line
                key={key}
                ref={(el) => {
                  lineRefsRef.current.set(key, el);
                }}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={FG_DARK}
                strokeWidth={1}
                style={{ opacity: lineOpacity, transition: "opacity 0.3s ease-out" }}
              />
            );
          })}
        </svg>
      )}

      {/* Project dots. Each dot is ONE button — the 44×44 wrapper is the
          hit target AND the element the rAF loop translates each frame for
          drift + cursor snap. The visible dot is just a `<span>` styled as
          a coloured circle, centred inside the button with `pointer-events:
          none` so it never competes with the wrapper for events. This
          collapses the old two-button structure (visible + invisible-on-
          top) that was creating hit-test ambiguity. */}
      {containerSize.w > 0 &&
        activeProjects.map((project) => {
          const pos = dotPositions.get(project.id);
          if (!pos) return null;
          const size = project.featured ? 20 : 10;
          const HIT = 44; // px — 44×44 hit area centred on the anchor
          const isHovered = hoveredProject === project.id;
          const isActive = activeProject === project.id;
          // Base full opacity; fade non-matches when a filter / open card /
          // hover demands focus elsewhere. The filter case fades by 80%
          // (opacity 0.2) so the in-filter dots clearly dominate.
          let dotOpacity = 1.0;
          if (activeFilter) dotOpacity = project.domain === activeFilter ? 1.0 : 0.2;
          if (activeProject) dotOpacity = isActive ? 1.0 : 0.3;
          if (hoveredProject && !activeProject) {
            dotOpacity = isHovered ? 1.0 : 0.4;
          }
          // Hover expands the dot noticeably; the active-filter highlight
          // stays a subtle nudge.
          const scale = isHovered ? 1.8 : activeFilter === project.domain ? 1.15 : 1;

          return (
            <button
              key={project.id}
              ref={(el) => {
                dotWrappersRef.current.set(project.id, el);
              }}
              onClick={() => handleDotClick(project.id)}
              aria-label={`${project.name} — ${project.client}`}
              style={{
                position: "absolute",
                left: pos.x - HIT / 2,
                top: pos.y - HIT / 2,
                width: HIT,
                height: HIT,
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                outline: "none",
                willChange: "transform",
              }}
            >
              {/* Visible coloured dot — purely visual; pointer-events: none
                  so the wrapper button is the only hit target. */}
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: HIT / 2 - size / 2,
                  top: HIT / 2 - size / 2,
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  background: DOMAIN_COLORS[project.domain],
                  display: "block",
                  pointerEvents: "none",
                  opacity: dotOpacity,
                  transform: `scale(${scale})`,
                  transformOrigin: "center",
                  transition:
                    "transform 0.18s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease-out",
                  willChange: "transform, opacity",
                }}
              />
              {project.featured && !isMobile && (
                <span
                  style={{
                    position: "absolute",
                    left: HIT / 2 + size / 2 + 8,
                    top: HIT / 2 - 6,
                    fontFamily: "var(--font-manrope), system-ui, sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "rgba(31,58,50,0.78)",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    opacity: dotOpacity,
                    transition: "opacity 0.3s ease-out",
                  }}
                >
                  {project.name}
                </span>
              )}
            </button>
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
            borderRadius: 0,
            padding: "8px 12px",
            pointerEvents: "none",
            zIndex: 20,
            maxWidth: 240,
          }}
        >
          <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 600, color: "#fff", fontFamily: "var(--font-manrope), system-ui, sans-serif" }}>
            {hoveredData.name}
          </p>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-manrope), system-ui, sans-serif" }}>
            {hoveredData.client}
          </p>
        </div>
      )}

      {/* Expanded detail card */}
      {activeData && (
        <ExpandedProjectCard
          project={activeData}
          galleryUrls={galleryUrls}
          photoIdx={photoIdx}
          setPhotoIdx={setPhotoIdx}
          onClose={() => setActiveProject(null)}
          isMobile={isMobile}
        />
      )}

      <style>{`
        @keyframes clusterCardIn {
          from { opacity: 0; transform: translate(-50%, -48%); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </section>
  );
}

// ---------------------------------------------------------------------------
// ExpandedProjectCard
//
// Modal-style card that opens when a project dot is clicked. The card has its
// own vertical scroll (max-height 86vh) so it can host more content than the
// viewport allows. Inside that scroll, the carousel image runs a parallax
// translate at 0.5× the scroll speed so the image LAGS the text — it stays
// visible roughly twice as long as it would with regular flow.
//
// Layout, top to bottom:
//   - Backdrop click target + close button (outside the parallax)
//   - Carousel (image + chevrons), parallax target
//   - Main category chip (filled) + sub-categories (outlined chips)
//   - Title
//   - Customers (joined with " · ") + year on its own line
//   - Description
//   - Scale + Method chips on one row
//   - Responsible: small headshot left, phone / email right (two lines)
//   - Optional auxiliary links
// ---------------------------------------------------------------------------

type ExpandedProjectCardProps = {
  project: NetProject;
  galleryUrls: string[];
  photoIdx: number;
  setPhotoIdx: (updater: (i: number) => number) => void;
  onClose: () => void;
  isMobile: boolean;
};

// Parallax factor: how slowly the carousel image moves relative to the
// card's scroll. 0 = stick to text (no parallax), 1 = scroll at same speed
// (also no parallax). 0.5 = image moves at half speed, so it lags the text.
const CARD_PARALLAX_FACTOR = 0.5;

function ExpandedProjectCard({
  project,
  galleryUrls,
  photoIdx,
  setPhotoIdx,
  onClose,
  isMobile,
}: ExpandedProjectCardProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);

  // Drive the image parallax off the card's own scrollTop. Uses requestAnimationFrame
  // to coalesce scroll bursts into one DOM write per frame.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const parallax = parallaxRef.current;
    if (!scroller || !parallax) return;

    const apply = () => {
      parallax.style.transform = `translate3d(0, ${scroller.scrollTop * CARD_PARALLAX_FACTOR}px, 0)`;
      rafIdRef.current = null;
    };
    const onScroll = () => {
      if (rafIdRef.current != null) return;
      rafIdRef.current = requestAnimationFrame(apply);
    };

    // Initial application in case the card opens with scrollTop > 0.
    apply();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [project.id]);

  const accent = DOMAIN_COLORS[project.domain];
  const customers = project.customers && project.customers.length > 0
    ? project.customers
    : project.client
      ? [project.client]
      : [];
  const subCategories = project.subCategories ?? project.displayTags ?? [];
  const responsible = project.responsible;
  const scaleLabel = project.scale && project.scale in SCALE_LABELS
    ? SCALE_LABELS[project.scale as Scale]
    : null;
  const methodLabels = (project.methods ?? [])
    .filter((m): m is Method => m in METHOD_LABELS)
    .map((m) => METHOD_LABELS[m]);

  return (
    <>
      {/* Click-outside-to-close backdrop */}
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, zIndex: 25 }}
        aria-hidden="true"
      />
      {/* Card */}
      <div
        role="dialog"
        aria-label={project.name}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? "calc(100% - 48px)" : 440,
          maxWidth: 480,
          maxHeight: "86vh",
          background: "#2a2a2a",
          border: "1px solid rgba(255,255,255,0.1)",
          padding: 0,
          overflow: "hidden", // outer keeps the close button stable; inner scrolls
          zIndex: 30,
          animation: "clusterCardIn 0.3s ease-out",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Close — stays fixed in the card's upper-right, outside the scroller */}
        <button
          onClick={onClose}
          aria-label="Close project details"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(0,0,0,0.55)",
            color: "rgba(255,255,255,0.9)",
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            zIndex: 40,
          }}
        >
          ✕
        </button>

        {/* Scroll viewport */}
        <div
          ref={scrollerRef}
          style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}
        >
          {/* Parallax image at top of scroll content */}
          <div
            ref={parallaxRef}
            style={{
              willChange: "transform",
              // Below sits the text; the image carousel itself has aspect 16/10.
            }}
          >
            {galleryUrls.length > 0 ? (
              <div className="relative w-full" style={{ aspectRatio: "16/10" }}>
                <Image
                  key={galleryUrls[photoIdx]}
                  src={galleryUrls[photoIdx]}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="480px"
                />
                {galleryUrls.length > 1 ? (
                  <>
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoIdx((i) => (i - 1 + galleryUrls.length) % galleryUrls.length);
                      }}
                      style={{
                        position: "absolute",
                        left: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 36,
                        height: 36,
                        border: "1px solid rgba(255,255,255,0.2)",
                        background: "rgba(0,0,0,0.45)",
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2,
                      }}
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoIdx((i) => (i + 1) % galleryUrls.length);
                      }}
                      style={{
                        position: "absolute",
                        right: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 36,
                        height: 36,
                        border: "1px solid rgba(255,255,255,0.2)",
                        background: "rgba(0,0,0,0.45)",
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2,
                      }}
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Text content — flows normally underneath the parallax image */}
          <div style={{ padding: "clamp(16px, 3vw, 24px)" }}>
            {/* Category row: filled main + outlined subs */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 14,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 10px",
                  fontSize: "0.65rem",
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                  letterSpacing: "0.05em",
                  color: "#fff",
                  background: accent,
                }}
              >
                {DOMAIN_LABELS[project.domain]}
              </span>
              {subCategories.map((cat) => (
                <span
                  key={cat.id}
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    fontSize: "0.65rem",
                    fontFamily: "var(--font-manrope), system-ui, sans-serif",
                    letterSpacing: "0.05em",
                    color: cat.color ?? "rgba(255,255,255,0.85)",
                    background: "transparent",
                    border: `1px solid ${cat.color ?? "rgba(255,255,255,0.4)"}`,
                  }}
                >
                  {cat.label}
                </span>
              ))}
            </div>

            {/* Title */}
            <h3
              style={{
                margin: "0 0 6px 0",
                fontSize: "clamp(1.1rem, 2vw, 1.3rem)",
                fontWeight: 500,
                color: "#fff",
                fontFamily: "var(--font-manrope), system-ui, sans-serif",
                lineHeight: 1.3,
                paddingRight: 24,
              }}
            >
              {project.name}
            </h3>

            {/* Customers (dot-separated when >1) */}
            {customers.length > 0 ? (
              <p
                style={{
                  margin: "0 0 2px 0",
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.75)",
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                }}
              >
                {customers.join(" · ")}
              </p>
            ) : null}

            {/* Year, on its own line under customers */}
            <p
              style={{
                margin: "0 0 14px 0",
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.55)",
                fontFamily: "var(--font-manrope), system-ui, sans-serif",
              }}
            >
              {project.year}
            </p>

            {/* Description */}
            <p
              style={{
                margin: "0 0 14px 0",
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.78)",
                fontFamily: "var(--font-manrope), system-ui, sans-serif",
                lineHeight: 1.55,
              }}
            >
              {project.summary}
            </p>

            {/* Scale + Method chips on one row */}
            {(scaleLabel || methodLabels.length > 0) ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {scaleLabel ? (
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      fontSize: "0.65rem",
                      fontFamily: "var(--font-manrope), system-ui, sans-serif",
                      letterSpacing: "0.05em",
                      color: "rgba(255,255,255,0.85)",
                      border: "1px solid rgba(255,255,255,0.35)",
                    }}
                  >
                    {scaleLabel}
                  </span>
                ) : null}
                {methodLabels.map((label) => (
                  <span
                    key={label}
                    style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      fontSize: "0.65rem",
                      fontFamily: "var(--font-manrope), system-ui, sans-serif",
                      letterSpacing: "0.05em",
                      color: "rgba(255,255,255,0.85)",
                      border: "1px solid rgba(255,255,255,0.35)",
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : null}

            {/* Responsible block: headshot left, phone + email right */}
            {responsible ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 8,
                  paddingTop: 14,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.06)",
                  }}
                >
                  {responsible.photoUrl ? (
                    <Image
                      src={responsible.photoUrl}
                      alt={responsible.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    fontFamily: "var(--font-manrope), system-ui, sans-serif",
                    fontSize: "0.78rem",
                    lineHeight: 1.3,
                    minWidth: 0,
                  }}
                >
                  {responsible.phone ? (
                    <a
                      href={`tel:${responsible.phone.replace(/\s+/g, "")}`}
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        textDecoration: "none",
                      }}
                    >
                      {responsible.phone}
                    </a>
                  ) : (
                    <span style={{ color: "rgba(255,255,255,0.55)" }}>{responsible.name}</span>
                  )}
                  {responsible.email ? (
                    <a
                      href={`mailto:${responsible.email}`}
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        textDecoration: "none",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {responsible.email}
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* Auxiliary links (external project pages etc.) */}
            {(project.cardLinks ?? []).filter((l) => l.url).length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 6,
                  marginTop: 14,
                }}
              >
                {(project.cardLinks ?? []).map((link) =>
                  link.url ? (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 500,
                        color: accent,
                        fontFamily: "var(--font-manrope), system-ui, sans-serif",
                        textDecoration: "none",
                      }}
                    >
                      {link.label || link.url}
                    </a>
                  ) : null,
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
