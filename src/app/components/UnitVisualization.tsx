"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as d3 from "d3";

/* ───────── data types ───────── */
type DataPoint = {
  id: number;
  ageGroup: "0-17" | "18-29" | "30-49" | "50-66" | "67+";
  sector: "health" | "education" | "welfare" | "housing" | "employment" | "other";
  challenge:
    | "loneliness"
    | "exclusion"
    | "mental_health"
    | "access"
    | "integration"
    | "climate"
    | "digital_gap";
  severity: number;
  urban: boolean;
  immigrant: boolean;
  region: "oslo" | "vestland" | "trondelag" | "nordland" | "other";
};

type DotTarget = { x: number; y: number; color: string; radius: number };

/* ───────── helpers ───────── */
function weightedRandom<T>(items: T[], weights: number[]): T {
  const r = Math.random();
  let cum = 0;
  for (let i = 0; i < items.length; i++) {
    cum += weights[i];
    if (r < cum) return items[i];
  }
  return items[items.length - 1];
}

function generateData(count: number): DataPoint[] {
  const data: DataPoint[] = [];
  for (let i = 0; i < count; i++) {
    data.push({
      id: i,
      ageGroup: weightedRandom(
        ["0-17", "18-29", "30-49", "50-66", "67+"],
        [0.2, 0.18, 0.28, 0.22, 0.12]
      ),
      sector: weightedRandom(
        ["health", "education", "welfare", "housing", "employment", "other"],
        [0.25, 0.2, 0.2, 0.12, 0.13, 0.1]
      ),
      challenge: weightedRandom(
        ["loneliness", "exclusion", "mental_health", "access", "integration", "climate", "digital_gap"],
        [0.2, 0.18, 0.15, 0.15, 0.12, 0.1, 0.1]
      ),
      severity: Math.min(1, Math.max(0, 0.5 + (Math.random() - 0.5) * 0.8)),
      urban: Math.random() < 0.7,
      immigrant: Math.random() < 0.15,
      region: weightedRandom(
        ["oslo", "vestland", "trondelag", "nordland", "other"],
        [0.3, 0.2, 0.15, 0.1, 0.25]
      ),
    });
  }
  return data;
}

/* ───────── force layout helper ───────── */
function computeForcePositions(
  count: number,
  getTargetX: (i: number) => number,
  getTargetY: (i: number) => number,
  radius: number
): { x: number; y: number }[] {
  const nodes = Array.from({ length: count }, (_, i) => ({
    index: i,
    x: getTargetX(i) + (Math.random() - 0.5) * 4,
    y: getTargetY(i) + (Math.random() - 0.5) * 4,
    targetX: getTargetX(i),
    targetY: getTargetY(i),
  }));

  const simulation = d3
    .forceSimulation(nodes)
    .force("x", d3.forceX((d: (typeof nodes)[0]) => d.targetX).strength(0.8))
    .force("y", d3.forceY((d: (typeof nodes)[0]) => d.targetY).strength(0.3))
    .force("collide", d3.forceCollide(radius + 1))
    .stop();

  for (let i = 0; i < 300; i++) simulation.tick();
  return nodes.map((n) => ({ x: n.x, y: n.y }));
}

/* ───────── color maps ───────── */
const AGE_COLORS: Record<string, string> = {
  "0-17": "#F27887",
  "18-29": "#FF5252",
  "30-49": "#D6B84C",
  "50-66": "#5F7C8A",
  "67+": "#4F7C6C",
};

const CHALLENGE_COLORS: Record<string, string> = {
  loneliness: "#1F3A32",
  exclusion: "#F27887",
  mental_health: "#FF5252",
  access: "#D6B84C",
  integration: "#5F7C8A",
  climate: "#4F7C6C",
  digital_gap: "#676160",
};

const SECTOR_COLORS: Record<string, string> = {
  health: "#F27887",
  education: "#D6B84C",
  welfare: "#1F3A32",
  housing: "#5F7C8A",
  employment: "#4F7C6C",
  other: "#676160",
};

const CHALLENGE_LABELS: Record<string, string> = {
  loneliness: "Loneliness",
  exclusion: "Exclusion",
  mental_health: "Mental health",
  access: "Access",
  integration: "Integration",
  climate: "Climate",
  digital_gap: "Digital gap",
};

const SECTOR_LABELS: Record<string, string> = {
  health: "Health",
  education: "Education",
  welfare: "Welfare",
  housing: "Housing",
  employment: "Employment",
  other: "Other",
};

/* ───────── view definitions ───────── */
type ViewKey = "everyone" | "age" | "challenge" | "sector" | "urban" | "severity";

type ViewDef = { key: ViewKey; label: string; description: string };

const DEFAULT_VIEWS: ViewDef[] = [
  { key: "everyone", label: "Everyone", description: "200 people. Each dot represents someone facing a societal challenge in Norway." },
  { key: "age", label: "By age", description: "Age shapes which challenges people face \u2014 and which services they need." },
  { key: "challenge", label: "By challenge", description: "Loneliness and exclusion are the most common challenges. These are the problems Comte works on." },
  { key: "sector", label: "By sector", description: "Public services touch every one of these people. But the services weren\u2019t designed with them in mind." },
  { key: "urban", label: "Urban / Rural", description: "Most challenges concentrate in cities. But rural areas face different, often invisible problems." },
  { key: "severity", label: "Severity", description: "For many, these challenges compound. The further right, the harder it gets." },
];

/* ───────── axis label types ───────── */
type AxisLabel = { text: string; x: number; y: number };

function computeView(
  view: ViewKey,
  data: DataPoint[],
  width: number,
  height: number,
  dotRadius: number
): { targets: DotTarget[]; axisLabels: AxisLabel[] } {
  const axisLabels: AxisLabel[] = [];

  switch (view) {
    case "everyone": {
      const positions = computeForcePositions(
        data.length,
        () => width / 2,
        () => height / 2,
        dotRadius
      );
      return {
        targets: positions.map((p) => ({
          x: p.x,
          y: p.y,
          color: "#1F3A32",
          radius: dotRadius,
        })),
        axisLabels: [],
      };
    }

    case "age": {
      const groups = ["0-17", "18-29", "30-49", "50-66", "67+"];
      const bandWidth = width / groups.length;
      const positions = computeForcePositions(
        data.length,
        (i) => {
          const idx = groups.indexOf(data[i].ageGroup);
          return bandWidth * idx + bandWidth / 2;
        },
        () => height / 2,
        dotRadius
      );
      groups.forEach((g, idx) => {
        axisLabels.push({ text: g, x: bandWidth * idx + bandWidth / 2, y: height + 20 });
      });
      return {
        targets: positions.map((p, i) => ({
          x: p.x,
          y: p.y,
          color: AGE_COLORS[data[i].ageGroup],
          radius: dotRadius,
        })),
        axisLabels,
      };
    }

    case "challenge": {
      const challenges = Object.keys(CHALLENGE_COLORS);
      const cols = width > 600 ? 4 : 3;
      const rows = Math.ceil(challenges.length / cols);
      const cellW = width / cols;
      const cellH = height / rows;
      const positions = computeForcePositions(
        data.length,
        (i) => {
          const idx = challenges.indexOf(data[i].challenge);
          return (idx % cols) * cellW + cellW / 2;
        },
        (i) => {
          const idx = challenges.indexOf(data[i].challenge);
          return Math.floor(idx / cols) * cellH + cellH / 2;
        },
        dotRadius
      );
      challenges.forEach((c, idx) => {
        axisLabels.push({
          text: CHALLENGE_LABELS[c],
          x: (idx % cols) * cellW + cellW / 2,
          y: Math.floor(idx / cols) * cellH + cellH / 2 + 50,
        });
      });
      return {
        targets: positions.map((p, i) => ({
          x: p.x,
          y: p.y,
          color: CHALLENGE_COLORS[data[i].challenge],
          radius: dotRadius + (data[i].severity - 0.5) * 2,
        })),
        axisLabels,
      };
    }

    case "sector": {
      const sectors = Object.keys(SECTOR_COLORS);
      const bandWidth = width / sectors.length;
      const positions = computeForcePositions(
        data.length,
        (i) => {
          const idx = sectors.indexOf(data[i].sector);
          return bandWidth * idx + bandWidth / 2;
        },
        () => height / 2,
        dotRadius
      );
      sectors.forEach((s, idx) => {
        axisLabels.push({ text: SECTOR_LABELS[s], x: bandWidth * idx + bandWidth / 2, y: height + 20 });
      });
      return {
        targets: positions.map((p, i) => ({
          x: p.x,
          y: p.y,
          color: SECTOR_COLORS[data[i].sector],
          radius: dotRadius,
        })),
        axisLabels,
      };
    }

    case "urban": {
      const urbanW = width * 0.6;
      const ruralW = width * 0.3;
      const gap = width * 0.1;
      const positions = computeForcePositions(
        data.length,
        (i) => (data[i].urban ? urbanW / 2 : urbanW + gap + ruralW / 2),
        () => height / 2,
        dotRadius
      );
      axisLabels.push({ text: "Urban", x: urbanW / 2, y: height + 20 });
      axisLabels.push({ text: "Rural", x: urbanW + gap + ruralW / 2, y: height + 20 });
      return {
        targets: positions.map((p, i) => ({
          x: p.x,
          y: p.y,
          color: data[i].urban ? "#212121" : "#5F7C8A",
          radius: dotRadius,
        })),
        axisLabels,
      };
    }

    case "severity": {
      const pad = 40;
      const xScale = d3.scaleLinear().domain([0, 1]).range([pad, width - pad]);
      const colorScale = d3.scaleSequential(d3.interpolateRgb("#4F7C6C", "#FF5252")).domain([0, 1]);
      const positions = computeForcePositions(
        data.length,
        (i) => xScale(data[i].severity),
        () => height / 2,
        dotRadius
      );
      axisLabels.push({ text: "Low", x: pad, y: height + 20 });
      axisLabels.push({ text: "High", x: width - pad, y: height + 20 });
      return {
        targets: positions.map((p, i) => ({
          x: p.x,
          y: p.y,
          color: colorScale(data[i].severity),
          radius: dotRadius,
        })),
        axisLabels,
      };
    }
  }
}

/* ───────── easing ───────── */
const EASE = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const TRANSITION_DURATION = 800;

/* ───────── component ───────── */
function dedupeViewsByKey(views: ViewDef[]): ViewDef[] {
  const seen = new Set<ViewKey>();
  const out: ViewDef[] = [];
  for (const v of views) {
    if (seen.has(v.key)) continue;
    seen.add(v.key);
    out.push(v);
  }
  return out;
}

export default function UnitVisualization({ views: viewsProp }: { views?: { key: string; title: string; description: string }[] } = {}) {
  const VIEWS: ViewDef[] = useMemo(() => {
    const raw: ViewDef[] = viewsProp?.length
      ? viewsProp.map((v) => ({
          key: v.key as ViewKey,
          label: v.title,
          description: v.description ?? "",
        }))
      : DEFAULT_VIEWS;
    return dedupeViewsByKey(raw);
  }, [viewsProp]);
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentPositions = useRef<DotTarget[]>([]);
  const rafRef = useRef<number>(0);
  const [activeView, setActiveView] = useState<ViewKey>("everyone");
  const [axisLabels, setAxisLabels] = useState<AxisLabel[]>([]);
  const [labelVisible, setLabelVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 500 });

  const dotCount = dimensions.width > 1024 ? 200 : dimensions.width > 768 ? 150 : 100;
  const dotRadius = dimensions.width > 1024 ? 6 : dimensions.width > 768 ? 5 : 4;
  const dotSize = dotRadius * 2;

  const data = useMemo(() => generateData(200), []);
  const activeData = useMemo(() => data.slice(0, dotCount), [data, dotCount]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Measure container
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        const h = w > 1024 ? 500 : w > 768 ? 400 : 350;
        setDimensions({ width: w, height: h });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const animateToView = useCallback(
    (viewKey: ViewKey) => {
      const { width, height } = dimensions;
      const { targets, axisLabels: labels } = computeView(viewKey, activeData, width, height, dotRadius);

      if (prefersReducedMotion || currentPositions.current.length === 0) {
        // Snap instantly
        targets.forEach((t, i) => {
          const el = dotRefs.current[i];
          if (el) {
            el.style.transform = `translate(${t.x - dotRadius}px, ${t.y - dotRadius}px)`;
            el.style.backgroundColor = t.color;
            el.style.width = `${t.radius * 2}px`;
            el.style.height = `${t.radius * 2}px`;
          }
        });
        currentPositions.current = targets;
        setAxisLabels(labels);
        return;
      }

      cancelAnimationFrame(rafRef.current);

      const startPositions = currentPositions.current.map((p) => ({ ...p }));
      const startTime = performance.now();
      const staggerDelays = targets.map(() => Math.random() * 100);

      // Fade label out, then back in
      setLabelVisible(false);
      setTimeout(() => {
        setAxisLabels(labels);
        setLabelVisible(true);
      }, 300);

      const animate = (now: number) => {
        const elapsed = now - startTime;

        targets.forEach((target, i) => {
          const el = dotRefs.current[i];
          if (!el || !startPositions[i]) return;

          const dotElapsed = Math.max(0, elapsed - staggerDelays[i]);
          const t = Math.min(1, dotElapsed / TRANSITION_DURATION);
          const eased = EASE(t);

          const x = startPositions[i].x + (target.x - startPositions[i].x) * eased;
          const y = startPositions[i].y + (target.y - startPositions[i].y) * eased;
          const r = startPositions[i].radius + (target.radius - startPositions[i].radius) * eased;

          el.style.transform = `translate(${x - r}px, ${y - r}px)`;
          el.style.backgroundColor = target.color;
          el.style.width = `${r * 2}px`;
          el.style.height = `${r * 2}px`;
        });

        const maxElapsed = Math.max(...staggerDelays) + TRANSITION_DURATION;
        if (elapsed < maxElapsed) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          currentPositions.current = targets;
        }
      };

      currentPositions.current = targets; // set early so next switch works
      // But keep startPositions from the snapshot above
      rafRef.current = requestAnimationFrame(animate);
      // Fix: set currentPositions after animation completes
      const maxDelay = Math.max(...staggerDelays) + TRANSITION_DURATION;
      setTimeout(() => {
        currentPositions.current = targets;
      }, maxDelay);
      // Use startPositions during animation, set targets immediately for position tracking
      currentPositions.current = startPositions as DotTarget[];
    },
    [dimensions, activeData, dotRadius, prefersReducedMotion]
  );

  // Initial layout + re-layout on view/dimension change
  useEffect(() => {
    animateToView(activeView);
    return () => cancelAnimationFrame(rafRef.current);
  }, [activeView, animateToView]);

  const handleViewChange = (key: ViewKey) => {
    if (key === activeView) return;
    setActiveView(key);
  };

  const currentDescription = VIEWS.find((v) => v.key === activeView)?.description ?? "";

  return (
    <section className="w-full bg-[var(--comte-light-base)] px-2">
      <div className="mx-auto max-w-[1800px]">
        {/* Dot area */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-lg"
          style={{
            height: `${dimensions.height}px`,
            background: "rgba(0,0,0,0.02)",
          }}
        >
          {activeData.map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                borderRadius: "50%",
                backgroundColor: "#1F3A32",
                opacity: 0.85,
                willChange: "transform",
                pointerEvents: "none",
                transition: "background-color 0.5s ease, width 0.3s ease, height 0.3s ease",
              }}
            />
          ))}

          {/* Axis labels inside the container */}
          {axisLabels
            .filter((l) => l.y <= dimensions.height)
            .map((l, i) => (
              <div
                key={`axis-${i}`}
                className="pointer-events-none absolute"
                style={{
                  left: l.x,
                  top: l.y,
                  transform: "translateX(-50%)",
                  fontFamily: "var(--font-geist-mono, monospace)",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "rgba(0,0,0,0.35)",
                  whiteSpace: "nowrap",
                  opacity: labelVisible ? 1 : 0,
                  transition: "opacity 0.4s ease",
                }}
              >
                {l.text}
              </div>
            ))}
        </div>

        {/* Axis labels below the container */}
        <div className="relative w-full" style={{ height: "32px" }}>
          {axisLabels
            .filter((l) => l.y > dimensions.height)
            .map((l, i) => (
              <div
                key={`below-${i}`}
                className="pointer-events-none absolute"
                style={{
                  left: l.x,
                  top: 8,
                  transform: "translateX(-50%)",
                  fontFamily: "var(--font-geist-mono, monospace)",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "rgba(0,0,0,0.35)",
                  whiteSpace: "nowrap",
                  opacity: labelVisible ? 1 : 0,
                  transition: "opacity 0.4s ease",
                }}
              >
                {l.text}
              </div>
            ))}
        </div>

        {/* View selector buttons */}
        <div className="flex flex-wrap justify-center gap-2 px-0 pb-6">
          {VIEWS.map((v) => {
            const active = activeView === v.key;
            return (
              <button
                key={v.key}
                onClick={() => handleViewChange(v.key)}
                aria-pressed={active}
                className="focus:outline-none focus:ring-2 focus:ring-[var(--comte-dark-green)] focus:ring-offset-2"
                style={{
                  padding: "5px 14px",
                  borderRadius: 16,
                  border: active ? "1px solid #212121" : "1px solid rgba(0,0,0,0.1)",
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "0.7rem",
                  fontWeight: active ? 500 : 450,
                  cursor: "pointer",
                  background: active ? "#212121" : "rgba(0,0,0,0.04)",
                  color: active ? "#F9F9ED" : "rgba(0,0,0,0.5)",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    const t = e.currentTarget;
                    t.style.background = "rgba(0,0,0,0.08)";
                    t.style.color = "rgba(0,0,0,0.7)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    const t = e.currentTarget;
                    t.style.background = "rgba(0,0,0,0.04)";
                    t.style.color = "rgba(0,0,0,0.5)";
                  }
                }}
              >
                {v.label}
              </button>
            );
          })}
        </div>
        {/* Description label */}
        <div
          aria-live="polite"
          className="mx-auto pt-4 pb-8"
          style={{
            maxWidth: "600px",
            textAlign: "center",
            opacity: labelVisible ? 1 : 0,
            transition: "opacity 0.4s ease 0.3s",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-neue-haas)",
              fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)",
              color: "rgba(0,0,0,0.6)",
              lineHeight: 1.5,
              height: "3em", // always reserve two lines (2 * 1.5em)
              overflow: "hidden",
            }}
          >
            {currentDescription}
          </p>
        </div>
      </div>
    </section>
  );
}
