"use client";

import { useEffect, useRef } from "react";
import { DOMAIN_COLORS } from "./projectNetworkData";

// Same brightened palette as the home network so colours are consistent.
const COLOR_LIST = Object.values({ ...DOMAIN_COLORS, health: "#88C9A6" });

// Sparse: motto is meant to feel like a quieter field than home. ~25 dots,
// no central anchor, no lines back to the hero — these are the "isolated"
// dots that some of the home dots conceptually broke off to connect with.
const DOT_COUNT = 25;
const MOUSE_RADIUS = 140;
const MOUSE_FORCE = 4;
const SPRING_K = 0.025;
const DAMPING = 0.88;
const WOBBLE = 0.18;

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
};

/**
 * Sparse, isolated dot field for the motto panel. Same wobble + cursor
 * repulsion as `HomeBackgroundNetwork`, but no central anchor and no lines.
 * Dots simply drift in place, suggesting endpoints that the home network's
 * broken-off connections "flew toward" as the user scrolled across.
 *
 * Pointer-events disabled.
 */
export default function MottoBackgroundNetwork() {
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

    dotsRef.current = Array.from({ length: DOT_COUNT }, () => {
      const x = Math.random() * widthCss;
      const y = Math.random() * heightCss;
      const sizeRoll = Math.random();
      const size =
        sizeRoll > 0.9 ? 3.5 + Math.random() * 1.5 :
        sizeRoll > 0.6 ? 2 + Math.random() * 1.5 :
                         1 + Math.random() * 1.2;
      return {
        ox: x,
        oy: y,
        x,
        y,
        vx: 0,
        vy: 0,
        color: COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)],
        size,
        phase: Math.random() * Math.PI * 2,
      };
    });

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

    const tick = (t: number) => {
      const mouse = mouseRef.current;
      const dots = dotsRef.current;

      ctx.clearRect(0, 0, widthCss, heightCss);

      for (const dot of dots) {
        const sx = (dot.ox - dot.x) * SPRING_K;
        const sy = (dot.oy - dot.y) * SPRING_K;

        let rx = 0;
        let ry = 0;
        const dx = dot.x - mouse.x;
        const dy = dot.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0.001) {
          const falloff = 1 - dist / MOUSE_RADIUS;
          const force = falloff * MOUSE_FORCE;
          rx = (dx / dist) * force;
          ry = (dy / dist) * force;
        }

        const wx = Math.sin(t * 0.0006 + dot.phase) * WOBBLE;
        const wy = Math.cos(t * 0.0008 + dot.phase) * WOBBLE;

        dot.vx = dot.vx * DAMPING + sx + rx + wx;
        dot.vy = dot.vy * DAMPING + sy + ry + wy;
        dot.x += dot.vx;
        dot.y += dot.vy;

        ctx.globalAlpha = 0.85;
        ctx.fillStyle = dot.color;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
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
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    />
  );
}
