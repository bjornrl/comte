"use client";

import React from "react";
import {
  type FilterState, PROJECTS, projectMatchesFilters, hasActiveFilters,
} from "./projectNetworkData";
import PersonCard from "./PersonCard";

interface ProjectGridProps {
  filters: FilterState;
}

export default function ProjectGrid({ filters }: ProjectGridProps) {
  const active = hasActiveFilters(filters);
  const matchCount = active
    ? PROJECTS.filter((p) => projectMatchesFilters(p, filters)).length
    : PROJECTS.length;
  const PLACEHOLDER_IMAGE =
    "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

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

      {/* Grid styled to match About cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 bg-background pt-2 pb-2 px-2">
        {PROJECTS.map((project) => {
          const matches = !active || projectMatchesFilters(project, filters);

          return (
            <PersonCard
              key={project.id}
              title={`${project.client} · ${project.year}`}
              name={project.name}
              description={project.summary}
              imageUrl={PLACEHOLDER_IMAGE}
              href={`/projects/${project.id}`}
              hoverTextColor="#fafafa"
              hoverMetaTextColor="#212121"
              hoverOverlayColor="#212121"
              className={`min-h-[45vh] ${matches ? "opacity-100" : "opacity-20 pointer-events-none"}`}
              cursor={
                <div className="h-20 w-20 rounded-full border border-background/40 bg-background/90 text-foreground flex items-center justify-center text-sm font-medium tracking-wide shadow-lg">
                  Les mer
                </div>
              }
            />
          );
        })}
      </div>
    </section>
  );
}
