"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import Image from "next/image";
import type p5Type from "p5";
import {
  type FilterState,
  type Project,
  type ConnectionType,
  DOMAIN_COLORS,
  DOMAIN_LABELS,
  PROJECTS,
  CONNECTIONS,
  NO_FILTERS,
  hasActiveFilters,
  projectMatchesFilters,
  hexToRgb,
} from "./projectNetworkData";
export type { FilterState } from "./projectNetworkData";

/* ───────────── Constants ───────────── */

const THEME_LINE_COLOR = { r: 242, g: 120, b: 135 }; // #F27887 coral
const DARK_LINE_COLOR = { r: 33, g: 33, b: 33 }; // #212121 for light bg

/* Projects, connections, labels, filters — imported from projectNetworkData.ts */

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

type NodePosition = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
};

function computeNodePositions(
  width: number,
  height: number,
  isMobile = false,
  excludeCenter = false,
): Record<string, NodePosition> {
  const positions: Record<string, NodePosition> = {};
  const margin = { x: width * 0.08, y: height * 0.12 };
  const MIN_DISTANCE = isMobile ? 35 : width < 1024 ? 45 : 60;

  // Initial placement using improved hash
  for (const project of PROJECTS) {
    let x = margin.x + seededRandom(project.id, 0) * (width - margin.x * 2);
    let y = margin.y + seededRandom(project.id, 7919) * (height - margin.y * 2);

    // Center exclusion zone (for teaser mode hero text)
    if (excludeCenter) {
      const ez = {
        left: width * 0.25,
        right: width * 0.75,
        top: height * 0.35,
        bottom: height * 0.65,
      };
      if (x > ez.left && x < ez.right && y > ez.top && y < ez.bottom) {
        // Push outward from center
        const cx = width / 2,
          cy = height / 2;
        const angle = Math.atan2(y - cy, x - cx);
        const radius = Math.max(width * 0.26, height * 0.16);
        x = cx + Math.cos(angle) * radius;
        y = cy + Math.sin(angle) * radius;
      }
    }

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

/* ───────────── Component ───────────── */

export type IntroPhase =
  | "dot"
  | "typing-logo"
  | "hold"
  | "springout"
  | "erasing"
  | "typing-headline"
  | "done";

export default function ProjectNetwork({
  className,
  style,
  mode = "full",
  filters: externalFilters,
  onFiltersChange,
  introPhase,
  logoDotPosition,
}: {
  className?: string;
  style?: React.CSSProperties;
  mode?: "full" | "teaser";
  filters?: FilterState;
  onFiltersChange?: (f: FilterState) => void;
  introPhase?: IntroPhase;
  logoDotPosition?: { x: number; y: number };
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const nodeRefsMap = useRef<Record<string, HTMLDivElement | null>>({});
  const labelRefsMap = useRef<Record<string, HTMLDivElement | null>>({});
  const p5Ref = useRef<p5Type | null>(null);
  const positionsRef = useRef<Record<string, NodePosition>>({});
  const highlightedRef = useRef<string | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
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
  // When introPhase is provided, derive entranceReady from it
  const effectiveEntranceReady = introPhase
    ? introPhase === "springout" ||
      introPhase === "erasing" ||
      introPhase === "typing-headline" ||
      introPhase === "done"
    : entranceReady;
  // Lines should only appear after typing-headline phase (or default entrance)
  const linesReady = introPhase ? introPhase === "typing-headline" || introPhase === "done" : true;

  // Mouse position for proximity glow
  const mousePosRef = useRef({ x: -1000, y: -1000 });

  // Responsive & a11y
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const prefersReducedMotionRef = useRef(false);
  const [mobileSheetProject, setMobileSheetProject] = useState<Project | null>(null);
  const [teaserPreview, setTeaserPreview] = useState<{ project: Project; x: number; y: number } | null>(null);

  const [internalFilters, setInternalFilters] = useState<FilterState>(NO_FILTERS);
  const filters = externalFilters ?? internalFilters;
  const setFilters = onFiltersChange ?? setInternalFilters;
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
      (a, b) => seededRandom("entrance", a) - seededRandom("entrance", b),
    ),
  );

  // Reset line entrance timer when lines become ready (for intro-driven mode)
  useEffect(() => {
    if (linesReady && introPhase) {
      mountTimeRef.current = Date.now();
      entranceMultiplierRef.current = 0;
    }
  }, [linesReady, introPhase]);

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
    return CONNECTIONS.filter((c) => c.from === projectId || c.to === projectId)
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
  const applySelectionStyling = useCallback(
    (selId: string | null) => {
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
            el.style.border = "2px solid rgba(0,0,0,0.5)";
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
    },
    [getConnectedIds],
  );

  /* ── Setup p5 + animation loop ── */
  useEffect(() => {
    const container = containerRef.current;
    const canvasContainer = canvasContainerRef.current;
    if (!container || !canvasContainer) return;

    const rect = container.getBoundingClientRect();
    sizeRef.current = { width: rect.width, height: rect.height };
    positionsRef.current = computeNodePositions(
      rect.width,
      rect.height,
      rect.width < 768,
      mode === "teaser",
    );

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
          const s = project.featured ? (mob ? 12 : tab ? 16 : 20) : mob ? 6 : tab ? 8 : 10;
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

          // Entrance: lines fade in
          let entranceTarget: number;
          if (reducedMotion) {
            entranceTarget = 1;
          } else if (!linesReady) {
            entranceTarget = 0;
          } else {
            const entranceElapsed = now - mountTimeRef.current - 600;
            entranceTarget = Math.max(0, Math.min(1, entranceElapsed / 1500));
          }
          entranceMultiplierRef.current += (entranceTarget - entranceMultiplierRef.current) * 0.05;
          const entranceMul = entranceMultiplierRef.current;

          // Idle breathing pulse
          const isIdle = !highlighted && !selected && !hasActiveFilters(filtersRef.current);
          const breathe = isIdle && !reducedMotion ? Math.sin(now * 0.001) * 0.3 + 0.7 : 1;

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
                  ? mob
                    ? 12
                    : cw < 1024
                      ? 16
                      : 20
                  : mob
                    ? 6
                    : cw < 1024
                      ? 8
                      : 10;
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

            const isConnectedToHover = highlighted
              ? conn.from === highlighted || conn.to === highlighted
              : false;
            const isConnectedToSelected = selected
              ? conn.from === selected || conn.to === selected
              : false;

            const color = conn.type === "theme" ? THEME_LINE_COLOR : DARK_LINE_COLOR;

            let baseAlpha: number;
            switch (conn.type) {
              case "domain":
                baseAlpha = 25;
                break;
              case "method":
                baseAlpha = 30;
                break;
              case "scale":
                baseAlpha = 20;
                break;
              case "theme":
                baseAlpha = 30;
                break;
            }

            const matchIds = matchingIdsRef.current;
            const filtersActive = matchIds.size < PROJECTS.length;
            const bothMatch = matchIds.has(conn.from) && matchIds.has(conn.to);
            const oneMatch = matchIds.has(conn.from) || matchIds.has(conn.to);

            let targetAlpha: number;
            if (selected) {
              if (isConnectedToSelected) {
                switch (conn.type) {
                  case "domain":
                    targetAlpha = 45;
                    break;
                  case "method":
                    targetAlpha = 50;
                    break;
                  case "scale":
                    targetAlpha = 40;
                    break;
                  case "theme":
                    targetAlpha = 45;
                    break;
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
              if (highlighted && isConnectedToHover && bothMatch) {
                targetAlpha = baseAlpha * 4;
              }
            } else if (highlighted) {
              targetAlpha = isConnectedToHover ? baseAlpha * 3.5 : baseAlpha * 0.3;
            } else {
              targetAlpha = baseAlpha;
            }

            opacities[ci] = opacities[ci] + (targetAlpha - opacities[ci]) * 0.08;
            const alpha = opacities[ci] * entranceMul * breathe;

            // Static curved path (control point fixed per edge — only moves with node drift)
            const bend = 48;
            const ox = (seededRandom(`edge:${ci}`, 0) - 0.5) * bend * 2;
            const oy = (seededRandom(`edge:${ci}`, 1) - 0.5) * bend * 2;
            const midX = (fromPos.x + toPos.x) / 2 + ox;
            const midY = (fromPos.y + toPos.y) / 2 + oy;

            const ctx = p.drawingContext as CanvasRenderingContext2D;
            ctx.save();

            let strokeW = 1;
            switch (conn.type) {
              case "domain":
                ctx.setLineDash([]);
                strokeW = 1;
                break;
              case "method":
                ctx.setLineDash([6, 8]);
                strokeW = 1.5;
                break;
              case "scale":
                ctx.setLineDash([3, 10]);
                strokeW = 0.75;
                break;
              case "theme":
                ctx.setLineDash([]);
                strokeW = 1;
                break;
            }

            ctx.lineWidth = strokeW;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${alpha / 255})`;
            ctx.beginPath();
            ctx.moveTo(fromPos.x, fromPos.y);
            ctx.quadraticCurveTo(midX, midY, toPos.x, toPos.y);
            ctx.stroke();
            ctx.restore();
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
        positionsRef.current = computeNodePositions(width, height, width < 768, mode === "teaser");

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
  }, [mode]);

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
    [getConnectedIds],
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
    [hoveredProject],
  );

  /* ── Click handlers ── */
  const collapseExpanded = useCallback(() => {
    setExpandedContentVisible(false);
    setExpandedProjectId(null);
  }, []);

  const handleNodeClick = useCallback(
    (projectId: string) => {
      if (mode === "teaser") {
        const project = PROJECTS.find((p) => p.id === projectId);
        if (!project) return;
        const pos = positionsRef.current[projectId];
        if (pos) {
          if (isMobile) {
            setMobileSheetProject(project);
          } else {
            setTeaserPreview({ project, x: pos.x, y: pos.y });
          }
        }
        return;
      }
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
    },
    [selectedProjectId, expandedProjectId, applySelectionStyling, collapseExpanded, mode, isMobile],
  );

  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === containerRef.current) {
        setSelectedProjectId(null);
        selectedIdRef.current = null;
        applySelectionStyling(null);
        collapseExpanded();
        setTeaserPreview(null);
      }
    },
    [applySelectionStyling, collapseExpanded],
  );

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
        height: "100%",
        background: "#F9F9ED",
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

      {/* HTML overlay: section heading (hidden in teaser mode — parent handles text) */}
      {mode !== "teaser" && (
        <div
          style={{
            position: "absolute",
            top: isMobile ? 16 : 32,
            left: isMobile ? 16 : 32,
            zIndex: 10,
            opacity: 0,
            animation: effectiveEntranceReady ? "headingIn 0.6s ease forwards" : undefined,
          }}
        >
          <style>{`@keyframes headingIn { to { opacity: 1; } }`}</style>

          <div className="mt-1 font-sans text-base text-[color:var(--comte-near-black)]">
            Prosjekter
          </div>
        </div>
      )}

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
          onBlur: () => {
            handleNodeLeave();
          },
        };

        // Responsive sizes — teaser mode uses slightly larger dots for better tap targets
        const isTeaser = mode === "teaser";
        const featuredDotSize = isMobile ? 14 : isTablet ? 18 : isTeaser ? 22 : 20;
        const regularDotSize = isMobile ? 8 : isTablet ? 10 : isTeaser ? 12 : 10;
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
                ref={(el) => {
                  nodeRefsMap.current[project.id] = el;
                }}
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
                  backgroundColor: isExpanded ? "rgba(255, 255, 255, 0.95)" : color,
                  border: isExpanded ? "1px solid rgba(0,0,0,0.1)" : "none",
                  backdropFilter: isExpanded ? "blur(12px)" : "none",
                  WebkitBackdropFilter: isExpanded ? "blur(12px)" : "none",
                  boxShadow: isExpanded
                    ? "0 8px 32px rgba(0,0,0,0.4)"
                    : `0 0 8px rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`,
                  cursor: isExpanded ? "default" : "pointer",
                  opacity: effectiveEntranceReady ? 0.8 : 0,
                  transform: isExpanded
                    ? "scale(1)"
                    : `scale(${effectiveEntranceReady ? collapsedScale : 0})`,
                  transformOrigin: "center center",
                  transition: reducedMotion
                    ? "none"
                    : `transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${entranceDelay}ms, opacity 0.5s ease ${entranceDelay}ms, border-radius 0.4s ease, background-color 0.3s ease, box-shadow 0.4s ease, border 0.3s ease`,
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeselectAll();
                    }}
                    aria-label="Close card"
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "none",
                      border: "none",
                      color: "rgba(0,0,0,0.4)",
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
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "rgba(0,0,0,0.8)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "rgba(0,0,0,0.4)";
                    }}
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
                      background: "rgba(0,0,0,0.06)",
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
                      color: "#212121",
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
                      color: "rgba(33,33,33,0.5)",
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
                      color: "rgba(33,33,33,0.6)",
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
                    href={`/projects/${project.slug ?? project.id}`}
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
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.textDecoration = "underline";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.textDecoration = "none";
                    }}
                  >
                    View project →
                  </a>
                </div>
              </div>

              {/* Featured label (hidden when expanded) */}
              {!isExpanded && (
                <div
                  ref={(el) => {
                    labelRefsMap.current[project.id] = el;
                  }}
                  style={{
                    position: "absolute",
                    fontFamily: "var(--font-geist-sans)",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "#212121",
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
              ref={(el) => {
                nodeRefsMap.current[project.id] = el;
              }}
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
                opacity: effectiveEntranceReady ? 0.8 : 0,
                transform: effectiveEntranceReady ? "scale(1)" : "scale(0)",
                transition: reducedMotion
                  ? "none"
                  : `transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${entranceDelay}ms, opacity 0.5s ease ${entranceDelay}ms, box-shadow 0.4s ease, border 0.3s ease`,
                willChange: "transform",
                zIndex: 10,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            {project.featured && (
              <div
                ref={(el) => {
                  labelRefsMap.current[project.id] = el;
                }}
                style={{
                  position: "absolute",
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#212121",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  opacity: effectiveEntranceReady ? 0.8 : 0,
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

      {/* Detail panel (non-featured nodes only — featured use in-place expansion) */}
      {selectedProjectId &&
        !expandedProjectId &&
        (() => {
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
                background: "rgba(255, 255, 255, 0.95)",
                border: "1px solid rgba(0,0,0,0.1)",
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
                  color: "rgba(0,0,0,0.4)",
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
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "rgba(0,0,0,0.8)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "rgba(0,0,0,0.4)";
                }}
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
                  color: "#212121",
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
                  color: "rgba(33,33,33,0.5)",
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
                  color: "rgba(33,33,33,0.7)",
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
                      color: "rgba(33,33,33,0.3)",
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
                            color: "rgba(33,33,33,0.5)",
                            textAlign: "left",
                            lineHeight: 1.3,
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.color = "rgba(33,33,33,0.85)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.color = "rgba(33,33,33,0.5)";
                          }}
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
                            <span style={{ color: "rgba(33,33,33,0.3)" }}>
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
                href={`/projects/${project.slug ?? project.id}`}
                style={{
                  display: "inline-block",
                  marginTop: 20,
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: domainColor,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.textDecoration = "underline";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.textDecoration = "none";
                }}
              >
                View full project →
              </a>
            </div>
          );
        })()}

      {/* Tooltip (desktop only) */}
      {!isMobile && hoveredProject && !teaserPreview && (
        (() => {
          const tColor = DOMAIN_COLORS[hoveredProject.domain];
          return (
            <div
              style={{
                position: "fixed",
                left: tooltipPos.x + 16,
                top: tooltipPos.y - 8,
                background: "#212121",
                borderRadius: 10,
                padding: 0,
                overflow: "hidden",
                pointerEvents: "none",
                zIndex: 100,
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                animation: "tooltipIn 0.12s ease-out forwards",
              }}
            >
              <style>{`@keyframes tooltipIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
              {/* Domain accent bar */}
              <div style={{ height: 3, background: tColor }} />
              <div style={{ padding: "8px 14px 10px" }}>
                <div
                  style={{
                    fontFamily: "var(--font-neue-haas), var(--font-geist-sans)",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: "#fff",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {hoveredProject.name}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-geist-sans)",
                    fontSize: "0.7rem",
                    color: "rgba(255,255,255,0.5)",
                    marginTop: 3,
                  }}
                >
                  {hoveredProject.client} · {hoveredProject.year}
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* Teaser preview card (desktop, teaser mode only) */}
      {mode === "teaser" && teaserPreview && !isMobile && (() => {
        const { project, x, y } = teaserPreview;
        const { width: cw, height: ch } = sizeRef.current;
        const cardW = 320;
        const onRight = x + cardW + 48 < cw;
        const cardLeft = onRight ? x + 24 : x - cardW - 24;
        const cardTop = Math.max(24, Math.min(y - 80, ch - 400));
        const domainColor = DOMAIN_COLORS[project.domain];
        const domainRgb = hexToRgb(domainColor);

        return (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              left: cardLeft,
              top: cardTop,
              width: cardW,
              background: "rgba(255, 255, 255, 0.97)",
              borderRadius: 16,
              overflow: "hidden",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.06)",
              zIndex: 60,
              animation: `teaserCardIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
            }}
          >
            <style>{`
              @keyframes teaserCardIn {
                from { opacity: 0; transform: translateY(8px) scale(0.97); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}</style>

            {/* Hero image or colored band */}
            {project.heroImageUrl ? (
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}>
                <Image
                  src={project.heroImageUrl}
                  alt={project.name}
                  fill
                  className="object-cover"
                  sizes="320px"
                />
                {/* Gradient overlay for readability */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 50%)",
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: 6,
                  background: `linear-gradient(90deg, ${domainColor}, ${domainColor}88)`,
                }}
              />
            )}

            <div style={{ padding: "16px 20px 20px" }}>
              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTeaserPreview(null);
                }}
                aria-label="Close preview"
                style={{
                  position: "absolute",
                  top: project.heroImageUrl ? 8 : 8,
                  right: 8,
                  background: project.heroImageUrl ? "rgba(0,0,0,0.3)" : "none",
                  border: "none",
                  color: project.heroImageUrl ? "#fff" : "rgba(0,0,0,0.4)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  padding: 6,
                  lineHeight: 1,
                  minWidth: 44,
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  zIndex: 2,
                  transition: "background 0.15s ease, color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (project.heroImageUrl) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.5)";
                  } else {
                    (e.currentTarget as HTMLElement).style.color = "rgba(0,0,0,0.8)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (project.heroImageUrl) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.3)";
                  } else {
                    (e.currentTarget as HTMLElement).style.color = "rgba(0,0,0,0.4)";
                  }
                }}
              >
                ✕
              </button>

              {/* Domain pill */}
              <div
                style={{
                  display: "inline-block",
                  background: `rgba(${domainRgb.r},${domainRgb.g},${domainRgb.b},0.12)`,
                  color: domainColor,
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "3px 10px",
                  borderRadius: 10,
                }}
              >
                {DOMAIN_LABELS[project.domain]}
              </div>

              {/* Project name */}
              <h3
                style={{
                  fontFamily: "var(--font-neue-haas), var(--font-geist-sans)",
                  fontSize: "1.15rem",
                  fontWeight: 500,
                  color: "#212121",
                  marginTop: 10,
                  marginBottom: 0,
                  lineHeight: 1.3,
                  letterSpacing: "-0.01em",
                }}
              >
                {project.name}
              </h3>

              {/* Client + year */}
              <div
                style={{
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "0.8rem",
                  color: "rgba(33,33,33,0.45)",
                  marginTop: 4,
                }}
              >
                {project.client} · {project.year}
              </div>

              {/* Summary */}
              <p
                style={{
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                  color: "rgba(33,33,33,0.6)",
                  marginTop: 10,
                  marginBottom: 0,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {project.summary}
              </p>

              {/* View project CTA */}
              <a
                href={`/projects/${project.slug ?? project.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 16,
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: domainColor,
                  textDecoration: "none",
                  transition: "gap 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.gap = "10px";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.gap = "6px";
                }}
              >
                View project <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        );
      })()}

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
              maxHeight: "70vh",
              overflowY: "auto",
              borderRadius: "16px 16px 0 0",
              background: "rgba(255, 255, 255, 0.97)",
              zIndex: 100,
              animation: "sheetUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              boxShadow: "0 -4px 32px rgba(0,0,0,0.15)",
            }}
          >
            <style>{`@keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

            {/* Hero image */}
            {mobileSheetProject.heroImageUrl && (
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: "16px 16px 0 0", overflow: "hidden" }}>
                <Image
                  src={mobileSheetProject.heroImageUrl}
                  alt={mobileSheetProject.name}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 50%)" }} />
              </div>
            )}

            <div style={{ padding: 24 }}>
              {/* Close button */}
              <button
                onClick={() => setMobileSheetProject(null)}
                aria-label="Close"
                style={{
                  position: "absolute",
                  top: mobileSheetProject.heroImageUrl ? 12 : 12,
                  right: 12,
                  background: mobileSheetProject.heroImageUrl ? "rgba(0,0,0,0.3)" : "none",
                  border: "none",
                  color: mobileSheetProject.heroImageUrl ? "#fff" : "rgba(0,0,0,0.4)",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  padding: 8,
                  minWidth: 44,
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  zIndex: 2,
                }}
              >
                ✕
              </button>

              {/* Domain pill */}
              <div
                style={{
                  display: "inline-block",
                  background: `rgba(${hexToRgb(DOMAIN_COLORS[mobileSheetProject.domain]).r},${hexToRgb(DOMAIN_COLORS[mobileSheetProject.domain]).g},${hexToRgb(DOMAIN_COLORS[mobileSheetProject.domain]).b},0.12)`,
                  color: DOMAIN_COLORS[mobileSheetProject.domain],
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "3px 10px",
                  borderRadius: 10,
                }}
              >
                {DOMAIN_LABELS[mobileSheetProject.domain]}
              </div>

              <h2
                style={{
                  fontFamily: "var(--font-neue-haas), var(--font-geist-sans)",
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  color: "#212121",
                  marginTop: 10,
                  marginBottom: 0,
                  lineHeight: 1.3,
                  letterSpacing: "-0.01em",
                }}
              >
                {mobileSheetProject.name}
              </h2>
              <div
                style={{
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "0.85rem",
                  color: "rgba(33,33,33,0.45)",
                  marginTop: 4,
                }}
              >
                {mobileSheetProject.client} · {mobileSheetProject.year}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                  color: "rgba(33,33,33,0.6)",
                  marginTop: 12,
                  marginBottom: 0,
                }}
              >
                {mobileSheetProject.summary}
              </p>
              <a
                href={`/projects/${mobileSheetProject.slug ?? mobileSheetProject.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 20,
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  color: DOMAIN_COLORS[mobileSheetProject.domain],
                  textDecoration: "none",
                }}
              >
                View project <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </>
      )}

      {/* Focus indicator styles */}
      <style>{`
        [role="button"]:focus-visible {
          outline: 2px solid rgba(0,0,0,0.6) !important;
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
