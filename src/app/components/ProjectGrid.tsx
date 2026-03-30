"use client";

import React from "react";
import {
  type FilterState, PROJECTS, projectMatchesFilters, hasActiveFilters,
} from "./projectNetworkData";
import PersonCard from "./PersonCard";
import { comteColors } from "@/lib/comte-colors";

interface ProjectGridProps {
  filters: FilterState;
}

const HOVER_PALETTE = [
  {
    overlay: comteColors.nearBlack,
    text: comteColors.cream,
    meta: "rgba(251, 246, 239, 0.82)",
  },
  {
    overlay: comteColors.darkGreen,
    text: comteColors.lightBase,
    meta: "rgba(249, 249, 237, 0.78)",
  },
  {
    overlay: comteColors.deepRed,
    text: comteColors.cream,
    meta: "rgba(251, 246, 239, 0.84)",
  },
  {
    overlay: comteColors.coolBlue,
    text: comteColors.cream,
    meta: "rgba(251, 246, 239, 0.8)",
  },
] as const;

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
      <div className="max-w-[1800px] mx-auto pt-3 px-2 pb-0">

        <div id="employees">
          <h1 className="text-5xl font-light text-foreground pb-8">All projects</h1>
        </div>
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
          const hoverColors = HOVER_PALETTE[project.name.length % HOVER_PALETTE.length];

          return (
            <PersonCard
              key={project.id}
              title={`${project.client} · ${project.year}`}
              name={project.name}
              description={project.summary}
              imageUrl={PLACEHOLDER_IMAGE}
              href={`/projects/${project.slug ?? project.id}`}
              hoverTextColor={hoverColors.text}
              hoverMetaTextColor={hoverColors.meta}
              hoverOverlayColor={hoverColors.overlay}
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
