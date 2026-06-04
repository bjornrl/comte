"use client";

import { useEffect, useRef } from "react";
import { DOMAIN_COLORS } from "./projectNetworkData";

// Use the palette from projectNetworkData but swap `health` for the brighter
// sage ProjectCluster uses against dark green — the default health hex sits
// too close to home's #1F3A32 background to be visible.
const COLOR_LIST = Object.values({ ...DOMAIN_COLORS, health: "#88C9A6" });

// Dot field for the home panel only (motto uses /lights.html or CMS video).
const HOME_DOT_COUNT = 60;

// ── Cursor interaction ─────────────────────────────────────────────────
// Each dot has a threshold field of THRESHOLD_RADIUS that initially follows
// the dot. The first frame the cursor enters that field the field FREEZES
// in place at the dot's current position — all subsequent "is the cursor
// still inside?" checks use this frozen centre. The freeze lets the user
// nudge the cursor a small distance to break the lock instead of having to
// outrun a field that would otherwise track the moving dot.
//
// While the field is frozen and the cursor is inside, the dot accelerates
// toward the cursor. Once within CAPTURE_RADIUS the dot snaps and follows
// the cursor (FOLLOW_LERP smooth). The instant the cursor exits the frozen
// field, the dot is released and the field starts tracking the dot again.
const THRESHOLD_RADIUS = 160;
const CAPTURE_RADIUS = 24;
const ATTRACT_FORCE = 0.45;
const FOLLOW_LERP = 0.22;
// While captured, the follow target wobbles within a small radius of the
// cursor so dots feel alive rather than rigidly stapled to the pointer. The
// drift is suppressed while the cursor is moving (otherwise it shows up as
// twitch on top of the follow motion) and ramps back in once the cursor
// has been still for CLUSTER_DRIFT_DELAY ms.
const CLUSTER_DRIFT_RADIUS = 5;
const CLUSTER_DRIFT_DELAY = 100;
const CLUSTER_DRIFT_RAMP = 250;

const SPRING_K = 0.025;
const DAMPING = 0.88;
const ANCHOR_SELECTOR = "[data-hero-anchor]";

// ── Captured-dot cluster connections ──────────────────────────────────
// Captured dots additionally draw lines to any other dot within this range.
// As more dots get captured around the cursor, more of these short lines
// appear, forming a denser web local to the cursor.
const CONNECTION_RANGE = 110;
const CONNECTION_ALPHA = 0.18;

// ─── Entry animation (ms) ───────────────────────────────────────────────
// Each dot is assigned a random `appearDelay` in [0, DOT_APPEAR_MAX_DELAY).
// The dot then fades+scales in from 0 to full over DOT_APPEAR_DURATION.
// Lines hold at 0 opacity until LINES_APPEAR_DELAY, then fade in.
const DOT_APPEAR_MAX_DELAY = 800;
const DOT_APPEAR_DURATION = 400;
const LINES_APPEAR_DELAY = 1800;
const LINES_APPEAR_DURATION = 600;

type Dot = {
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  phase: number;
  /** Entry-animation offset (ms after canvas mount) at which this dot starts
   *  fading in. Each dot rolls its own so they appear staggered. */
  appearDelay: number;
  /** True while this dot is following the cursor. */
  captured: boolean;
  /** True while the dot's threshold field is locked to a fixed point — set
   *  the first frame the cursor crosses into the field. */
  frozen: boolean;
  /** Frozen-field centre (in canvas-local coords). Only meaningful when
   *  `frozen` is true. */
  frozenX: number;
  frozenY: number;
  /** Stable per-dot offset from the cursor while captured — gives the
   *  cluster a bit of visual spread instead of pixel-stacking on top of
   *  the pointer. */
  clusterOffsetX: number;
  clusterOffsetY: number;
};

/**
 * Canvas for the home panel only (100vw). Motto has its own background
 * (lights.html or CMS video). Pointer-events disabled.
 */
export default function HomeBackgroundNetwork({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  /** Entry animation runs once per page load; navbar returns skip it. */
  const entryAnimationDoneRef = useRef(false);
  const activeRef = useRef(active);
  activeRef.current = active;
  const mouseRef = useRef<{ x: number; y: number; lastMoveT: number }>({
    x: -9999,
    y: -9999,
    lastMoveT: 0,
  });
  const rafRef = useRef<number | null>(null);
  const tickRef = useRef<((t: number) => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let widthCss = 0;
    let heightCss = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      widthCss = rect.width;
      heightCss = rect.height;
      canvas.width = Math.max(1, Math.floor(widthCss * dpr));
      canvas.height = Math.max(1, Math.floor(heightCss * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const homeDots: Dot[] = Array.from({ length: HOME_DOT_COUNT }, () => {
      const x = Math.random() * widthCss;
      const y = Math.random() * heightCss;
      const sizeRoll = Math.random();
      const size =
        sizeRoll > 0.95 ? 4 + Math.random() * 2 :
        sizeRoll > 0.7  ? 2 + Math.random() * 2 :
                          1 + Math.random() * 1.2;
      return {
        ox: x, oy: y, x, y,
        vx: 0, vy: 0,
        color: COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)],
        size,
        phase: Math.random() * Math.PI * 2,
        appearDelay: Math.random() * DOT_APPEAR_MAX_DELAY,
        captured: false,
        frozen: false,
        frozenX: 0,
        frozenY: 0,
        clusterOffsetX: (Math.random() - 0.5) * 28,
        clusterOffsetY: (Math.random() - 0.5) * 28,
      };
    });

    dotsRef.current = homeDots;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        lastMoveT: performance.now(),
      };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999, lastMoveT: 0 };
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", resize);

    /** Timestamp of the first rAF callback; the entry animation is measured
     *  in `elapsed = t - mountTime`. */
    let mountTime = 0;

    // Every captured-dot↔nearby-dot pair we've ever drawn gets stored in
    // this set. Each frame we add any new pairs the current cluster
    // produces, then render every entry — so connections live on between
    // the dots even after they've sprung back to their origins.
    const persistentConnections = new Set<string>();
    const pairKey = (a: number, b: number) =>
      a < b ? `${a}-${b}` : `${b}-${a}`;

    const tick = (t: number) => {
      if (!activeRef.current) {
        rafRef.current = null;
        return;
      }
      if (mountTime === 0 && !entryAnimationDoneRef.current) mountTime = t;
      const elapsed = entryAnimationDoneRef.current
        ? LINES_APPEAR_DELAY + LINES_APPEAR_DURATION
        : t - mountTime;
      // 0 → 1 fade for the connection lines, gated until LINES_APPEAR_DELAY.
      const linesAlphaScale = entryAnimationDoneRef.current
        ? 1
        : Math.max(
            0,
            Math.min(1, (elapsed - LINES_APPEAR_DELAY) / LINES_APPEAR_DURATION),
          );
      if (!entryAnimationDoneRef.current && linesAlphaScale >= 1) {
        entryAnimationDoneRef.current = true;
      }
      const canvasRect = canvas.getBoundingClientRect();

      // ── Anchor (hero white dot) in canvas-local coords ──────────────────
      const anchorEl = document.querySelector<HTMLElement>(ANCHOR_SELECTOR);
      let cx = -9999;
      let cy = -9999;
      if (anchorEl) {
        const aRect = anchorEl.getBoundingClientRect();
        cx = aRect.left + aRect.width / 2 - canvasRect.left;
        cy = aRect.top + aRect.height / 2 - canvasRect.top;
      }

      const mouse = mouseRef.current;
      const dots = dotsRef.current;

      ctx.clearRect(0, 0, widthCss, heightCss);

      // ── Update positions ────────────────────────────────────────────────
      // Only the cursor moves dots. Scrolling has zero influence on dot
      // positions (the break/reconnect animation is purely a line-routing
      // change). Idle dots sit at their origin.
      for (const dot of dots) {
        const dxCur = mouse.x - dot.x;
        const dyCur = mouse.y - dot.y;
        const distCur = Math.sqrt(dxCur * dxCur + dyCur * dyCur);

        // Threshold centre: follows the dot until the cursor first enters
        // the field, then sticks at the position it had at that moment.
        const thX = dot.frozen ? dot.frozenX : dot.x;
        const thY = dot.frozen ? dot.frozenY : dot.y;
        const dxTh = mouse.x - thX;
        const dyTh = mouse.y - thY;
        const distTh = Math.sqrt(dxTh * dxTh + dyTh * dyTh);
        const cursorInField = distTh < THRESHOLD_RADIUS;

        if (dot.frozen && !cursorInField) {
          // Cursor escaped the frozen field — fully release the dot.
          dot.frozen = false;
          dot.captured = false;
        } else if (!dot.frozen && cursorInField) {
          // Cursor just crossed in; freeze the field at this dot position
          // so a small wiggle of the cursor can break the lock again.
          dot.frozen = true;
          dot.frozenX = dot.x;
          dot.frozenY = dot.y;
        }

        if (dot.captured) {
          // Follow cursor with a per-dot offset so dots cluster around the
          // pointer instead of pixel-stacking. A small sin/cos drift keyed
          // to each dot's `phase` jitters the target slightly so the
          // cluster breathes around the cursor when stationary. Drift
          // ramps from 0 → 1 only after the cursor has been still for
          // CLUSTER_DRIFT_DELAY, so it doesn't twitch on top of follow.
          const timeSinceMove = t - mouse.lastMoveT;
          const driftScale = Math.max(
            0,
            Math.min(
              1,
              (timeSinceMove - CLUSTER_DRIFT_DELAY) / CLUSTER_DRIFT_RAMP,
            ),
          );
          const driftX =
            Math.sin(t * 0.0012 + dot.phase) *
            CLUSTER_DRIFT_RADIUS *
            driftScale;
          const driftY =
            Math.cos(t * 0.0015 + dot.phase) *
            CLUSTER_DRIFT_RADIUS *
            driftScale;
          const tx = mouse.x + dot.clusterOffsetX + driftX;
          const ty = mouse.y + dot.clusterOffsetY + driftY;
          dot.x += (tx - dot.x) * FOLLOW_LERP;
          dot.y += (ty - dot.y) * FOLLOW_LERP;
          dot.vx = 0;
          dot.vy = 0;
          continue;
        }

        // Free state: spring toward origin. If the field is frozen (i.e.
        // the cursor is currently inside the locked threshold) also pull
        // the dot toward the cursor — that's the "drift" phase before snap.
        const sx = (dot.ox - dot.x) * SPRING_K;
        const sy = (dot.oy - dot.y) * SPRING_K;

        let ax = 0;
        let ay = 0;
        if (dot.frozen && distCur > 0.001) {
          // Force ramps from 0 at the field rim → ATTRACT_FORCE at the
          // centre so dots close to the cursor accelerate the fastest.
          const force = ATTRACT_FORCE * (1 - distTh / THRESHOLD_RADIUS);
          ax = (dxCur / distCur) * force;
          ay = (dyCur / distCur) * force;
        }

        dot.vx = dot.vx * DAMPING + sx + ax;
        dot.vy = dot.vy * DAMPING + sy + ay;
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Snap to captured state once the dot is at the cursor.
        if (dot.frozen && distCur < CAPTURE_RADIUS) {
          dot.captured = true;
        }
      }

      // ── Draw lines to hero anchor ───────────────────────────────────────
      if (linesAlphaScale > 0 && cx > -9000) {
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = `rgba(255,255,255,${0.06 * linesAlphaScale})`;
        ctx.beginPath();
        for (const dot of dots) {
          ctx.moveTo(dot.x, dot.y);
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();

        // ── Cluster connections (active + persistent) ───────────────────
        // While a dot is captured, any other dot within CONNECTION_RANGE
        // becomes a new persistent pair. Pairs accumulate over time and
        // are drawn every frame at the dots' CURRENT positions — so when
        // a dot springs back to its origin, the connection lines follow
        // it back and stay visible from then on.
        for (let i = 0; i < dots.length; i++) {
          const cdot = dots[i];
          if (!cdot.captured) continue;
          for (let j = 0; j < dots.length; j++) {
            if (i === j) continue;
            const odot = dots[j];
            const ddx = cdot.x - odot.x;
            const ddy = cdot.y - odot.y;
            const dd = Math.sqrt(ddx * ddx + ddy * ddy);
            if (dd < CONNECTION_RANGE) {
              persistentConnections.add(pairKey(i, j));
            }
          }
        }

        if (persistentConnections.size > 0) {
          ctx.strokeStyle = `rgba(255,255,255,${
            CONNECTION_ALPHA * linesAlphaScale
          })`;
          ctx.beginPath();
          for (const key of persistentConnections) {
            const dashIdx = key.indexOf("-");
            const a = +key.slice(0, dashIdx);
            const b = +key.slice(dashIdx + 1);
            const da = dots[a];
            const db = dots[b];
            if (!da || !db) continue;
            ctx.moveTo(da.x, da.y);
            ctx.lineTo(db.x, db.y);
          }
          ctx.stroke();
        }
      }

      // ── Draw dots on top of lines ───────────────────────────────────────
      // Each dot fades + scales in once `elapsed > dot.appearDelay`, ramping
      // up over DOT_APPEAR_DURATION with an ease-out curve.
      for (const dot of dots) {
        const raw = entryAnimationDoneRef.current
          ? 1
          : (elapsed - dot.appearDelay) / DOT_APPEAR_DURATION;
        const t01 = Math.max(0, Math.min(1, raw));
        if (t01 <= 0) continue;
        const eased = 1 - Math.pow(1 - t01, 2);
        ctx.globalAlpha = 0.85 * eased;
        ctx.fillStyle = dot.color;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size * eased, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(tick);
    };

    tickRef.current = tick;
    if (activeRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", resize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      tickRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!active) {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }
    if (rafRef.current == null && tickRef.current) {
      rafRef.current = requestAnimationFrame(tickRef.current);
    }
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 h-full w-full"
      style={{ zIndex: 1 }}
    />
  );
}
