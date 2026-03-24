"use client";

import React from "react";
import {
  type FilterState,
  PROJECTS, DOMAIN_COLORS, DOMAIN_LABELS,
  projectMatchesFilters, hasActiveFilters, hexToRgb,
} from "./projectNetworkData";

interface ProjectGridProps {
  filters: FilterState;
}

export default function ProjectGrid({ filters }: ProjectGridProps) {
  const active = hasActiveFilters(filters);
  const matchCount = active
    ? PROJECTS.filter((p) => projectMatchesFilters(p, filters)).length
    : PROJECTS.length;

  return (
    <section style={{ background: "#F9F9ED", paddingBottom: "10rem" }}>
      {/* Heading */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 2rem 0 2rem" }}>
        <h2 style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          color: "#212121",
          margin: 0,
          lineHeight: 1.1,
        }}>
          All projects
        </h2>
        <div style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "rgba(0,0,0,0.4)",
          marginTop: 4,
        }}>
          {matchCount} project{matchCount !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Grid */}
      <div style={{
        maxWidth: 1200,
        margin: "2rem auto 0 auto",
        padding: "0 2rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "1rem",
      }}>
        {PROJECTS.map((project) => {
          const matches = !active || projectMatchesFilters(project, filters);
          const color = DOMAIN_COLORS[project.domain];
          const rgb = hexToRgb(color);

          return (
            <a
              key={project.id}
              href={`/projects/${project.id}`}
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: 12,
                padding: 16,
                cursor: matches ? "pointer" : "default",
                textDecoration: "none",
                opacity: matches ? 1 : 0.15,
                transform: matches ? "scale(1)" : "scale(0.97)",
                pointerEvents: matches ? "auto" : "none",
                transition: "opacity 0.4s ease, transform 0.3s ease, box-shadow 0.2s ease",
                display: "block",
              }}
              onMouseEnter={(e) => {
                if (matches) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
                }
              }}
              onMouseLeave={(e) => {
                if (matches) {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              {/* Image placeholder */}
              <div style={{
                width: "100%",
                aspectRatio: "16 / 10",
                background: "rgba(0,0,0,0.04)",
                borderRadius: 8,
                marginBottom: 12,
              }} />

              {/* Domain pill */}
              <div style={{
                display: "inline-block",
                background: `rgba(${rgb.r},${rgb.g},${rgb.b},0.15)`,
                color: color,
                fontFamily: "var(--font-geist-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "3px 10px",
                borderRadius: 10,
                marginBottom: 8,
              }}>
                {DOMAIN_LABELS[project.domain]}
              </div>

              {/* Name */}
              <div style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#212121",
                lineHeight: 1.3,
              }}>
                {project.name}
              </div>

              {/* Client + year */}
              <div style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "0.8rem",
                color: "rgba(0,0,0,0.45)",
                marginTop: 4,
              }}>
                {project.client} · {project.year}
              </div>

              {/* Summary */}
              <div style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "0.85rem",
                lineHeight: 1.5,
                color: "rgba(0,0,0,0.6)",
                marginTop: 8,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}>
                {project.summary}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
