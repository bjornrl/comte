"use client";

import { useEffect, useRef } from "react";
import { DOMAIN_COLORS } from "./projectNetworkData";

// Use the palette from projectNetworkData but swap `health` for the brighter
// sage ProjectCluster uses against dark green — the default health hex sits
// too close to home's #1F3A32 background to be visible.
const COLOR_LIST = Object.values({ ...DOMAIN_COLORS, health: "#88C9A6" });

// Dot population split. Home gets the dense cluster anchored to the hero
// white dot; motto gets a sparser "isolated" cluster on the right half of
// the canvas. As the user scrolls past the home→motto boundary, right-
// leaning home dots one by one drop their hero-anchor line and snap a new
// line to a randomly assigned motto dot.
const HOME_DOT_COUNT = 60;
const MOTTO_DOT_COUNT = 25;

const MOUSE_RADIUS = 140;
const MOUSE_FORCE = 4;
const SPRING_K = 0.025;
const DAMPING = 0.88;
const WOBBLE = 0.18;
const ANCHOR_SELECTOR = "[data-hero-anchor]";

// ─── Entry animation (ms) ───────────────────────────────────────────────
// Each dot is assigned a random `appearDelay` in [0, DOT_APPEAR_MAX_DELAY).
// The dot then fades+scales in from 0 to full over DOT_APPEAR_DURATION.
// Lines hold at 0 opacity until LINES_APPEAR_DELAY, then fade in.
const DOT_APPEAR_MAX_DELAY = 800;
const DOT_APPEAR_DURATION = 400;
const LINES_APPEAR_DELAY = 1800;
const LINES_APPEAR_DURATION = 600;

type DotKind = "home" | "motto";

type Dot = {
  kind: DotKind;
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  phase: number;
  /** 0 at the left of the home half → 1 at the right. Home only. */
  rightAffinity: number;
  /** Scroll-progress threshold at which a home dot drops its hero line and
   *  reconnects to a motto dot. Higher = breaks later. Motto dots: unused. */
  breakThreshold: number;
  /** Index of the motto dot this home dot reconnects to after breaking. */
  reconnectIdx: number;
  /** Entry-animation offset (ms after canvas mount) at which this dot starts
   *  fading in. Each dot rolls its own so they appear staggered. */
  appearDelay: number;
};

/**
 * Single canvas spanning the home + motto panels (200vw wide). The canvas
 * is positioned inside the home section, extending past its right edge into
 * motto's visual area. Home section uses `overflow: visible` so the canvas
 * is visible there; TiltedHeading and hero text wrappers carry z-10 so they
 * paint above the canvas's z-1 stacking context.
 *
 * Behaviour layers:
 *   - Wobble + spring + cursor repulsion: same as before.
 *   - Scroll stretch: right-side home dots get yanked in scroll direction.
 *   - Break-off & reconnect: when scroll progress past home > a dot's
 *     `breakThreshold`, the dot drops its line to the hero white dot and
 *     instead draws a line to its assigned motto dot.
 *
 * Pointer-events disabled.
 */
export default function HomeBackgroundNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let widthCss = 0;
    let heightCss = 0;
    /** Boundary x between the home half and the motto half of the canvas. */
    let homeWidthCss = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      widthCss = rect.width;
      heightCss = rect.height;
      homeWidthCss = widthCss / 2; // canvas is 200vw, home half is the left 100vw
      canvas.width = Math.max(1, Math.floor(widthCss * dpr));
      canvas.height = Math.max(1, Math.floor(heightCss * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Find the horizontal scroll container once for velocity + progress.
    let scroller: HTMLElement | null = canvas.parentElement;
    while (scroller && scroller.dataset.horizontalScroll !== "true") {
      scroller = scroller.parentElement;
    }

    // ── Initialise motto dots first so home dots can reference them ──────
    const mottoDots: Dot[] = Array.from({ length: MOTTO_DOT_COUNT }, () => {
      const x = homeWidthCss + Math.random() * (widthCss - homeWidthCss);
      const y = Math.random() * heightCss;
      const sizeRoll = Math.random();
      const size =
        sizeRoll > 0.9 ? 3.5 + Math.random() * 1.5 :
        sizeRoll > 0.6 ? 2 + Math.random() * 1.5 :
                         1 + Math.random() * 1.2;
      return {
        kind: "motto" as const,
        ox: x, oy: y, x, y,
        vx: 0, vy: 0,
        color: COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)],
        size,
        phase: Math.random() * Math.PI * 2,
        rightAffinity: 0,
        breakThreshold: 0,
        reconnectIdx: -1,
        appearDelay: Math.random() * DOT_APPEAR_MAX_DELAY,
      };
    });

    // ── Home dots, each assigned a motto dot to reconnect with ───────────
    const homeDots: Dot[] = Array.from({ length: HOME_DOT_COUNT }, () => {
      const x = Math.random() * homeWidthCss;
      const y = Math.random() * heightCss;
      const sizeRoll = Math.random();
      const size =
        sizeRoll > 0.95 ? 4 + Math.random() * 2 :
        sizeRoll > 0.7  ? 2 + Math.random() * 2 :
                          1 + Math.random() * 1.2;
      const rightAffinity = homeWidthCss > 0 ? x / homeWidthCss : 0;
      // Right-side dots break first; left-side basically never break.
      const breakThreshold =
        Math.pow(1 - rightAffinity, 1.4) * 1.4 + Math.random() * 0.2 + 0.05;
      return {
        kind: "home" as const,
        ox: x, oy: y, x, y,
        vx: 0, vy: 0,
        color: COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)],
        size,
        phase: Math.random() * Math.PI * 2,
        rightAffinity,
        breakThreshold,
        reconnectIdx: Math.floor(Math.random() * MOTTO_DOT_COUNT),
        appearDelay: Math.random() * DOT_APPEAR_MAX_DELAY,
      };
    });

    dotsRef.current = [...homeDots, ...mottoDots];

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", resize);

    let prevScrollLeft = scroller?.scrollLeft ?? 0;
    let smoothedScrollVel = 0;
    /** Timestamp of the first rAF callback; the entry animation is measured
     *  in `elapsed = t - mountTime`. */
    let mountTime = 0;

    const tick = (t: number) => {
      if (mountTime === 0) mountTime = t;
      const elapsed = t - mountTime;
      // 0 → 1 fade for the connection lines, gated until LINES_APPEAR_DELAY.
      const linesAlphaScale = Math.max(
        0,
        Math.min(1, (elapsed - LINES_APPEAR_DELAY) / LINES_APPEAR_DURATION),
      );
      const canvasRect = canvas.getBoundingClientRect();

      // ── Scroll-derived state ────────────────────────────────────────────
      let scrollVelocity = 0;
      let homeToMottoProgress = 0;
      if (scroller) {
        const curScroll = scroller.scrollLeft;
        const rawVel = curScroll - prevScrollLeft;
        smoothedScrollVel = smoothedScrollVel * 0.75 + rawVel * 0.25;
        scrollVelocity = smoothedScrollVel;
        prevScrollLeft = curScroll;

        const homePanel = scroller.querySelector<HTMLElement>(
          '[data-snap-id="home"]',
        );
        if (homePanel) {
          const homeOffset = homePanel.offsetLeft;
          const homeWidth = homePanel.offsetWidth;
          if (homeWidth > 0) {
            homeToMottoProgress = (curScroll - homeOffset) / homeWidth;
          }
        }
      }

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
      for (const dot of dots) {
        const sx = (dot.ox - dot.x) * SPRING_K;
        const sy = (dot.oy - dot.y) * SPRING_K;

        let rx = 0, ry = 0;
        const dx = dot.x - mouse.x;
        const dy = dot.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0.001) {
          const falloff = 1 - dist / MOUSE_RADIUS;
          const force = falloff * MOUSE_FORCE;
          rx = (dx / dist) * force;
          ry = (dy / dist) * force;
        }

        // Wobble fades to zero while the user is actively side-scrolling so
        // the dots hold their positions — only the line break/reconnect
        // animation responds to scroll. Full wobble when stationary, 0 by
        // |velocity| ≈ 0.66. Cursor repulsion stays active either way.
        const wobbleScale = Math.max(0, 1 - Math.abs(scrollVelocity) * 1.5);
        const wx = Math.sin(t * 0.0006 + dot.phase) * WOBBLE * wobbleScale;
        const wy = Math.cos(t * 0.0008 + dot.phase) * WOBBLE * wobbleScale;

        dot.vx = dot.vx * DAMPING + sx + rx + wx;
        dot.vy = dot.vy * DAMPING + sy + ry + wy;
        dot.x += dot.vx;
        dot.y += dot.vy;
      }

      // ── Draw lines ──────────────────────────────────────────────────────
      // Lines hold at 0 alpha until LINES_APPEAR_DELAY, then fade in. The
      // base alpha is 0.06 (the original full-opacity line colour).
      if (linesAlphaScale > 0) {
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = `rgba(255,255,255,${0.06 * linesAlphaScale})`;
        ctx.beginPath();
        for (const dot of dots) {
          if (dot.kind !== "home") continue;
          const isBroken = homeToMottoProgress > dot.breakThreshold;
          if (!isBroken) {
            if (cx > -9000) {
              ctx.moveTo(dot.x, dot.y);
              ctx.lineTo(cx, cy);
            }
          } else {
            const target = mottoDots[dot.reconnectIdx];
            if (target) {
              ctx.moveTo(dot.x, dot.y);
              ctx.lineTo(target.x, target.y);
            }
          }
        }
        ctx.stroke();
      }

      // ── Draw dots on top of lines ───────────────────────────────────────
      // Each dot fades + scales in once `elapsed > dot.appearDelay`, ramping
      // up over DOT_APPEAR_DURATION with an ease-out curve.
      for (const dot of dots) {
        const raw = (elapsed - dot.appearDelay) / DOT_APPEAR_DURATION;
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

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", resize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      // 200vw wide so the canvas spans home AND motto. z-index:1 puts it in
      // CSS step-7 (positive stack levels) — painted AFTER step-6 where
      // motto's section bg lives. Below z-10 wrappers (hero text, tilted
      // heading) so those still cover the network where they overlap.
      className="pointer-events-none absolute left-0 top-0 h-full"
      style={{ width: "200vw", zIndex: 1 }}
    />
  );
}
