"use client";

import { useState } from "react";
import SectionShell from "./SectionShell";
import ProjectNetwork from "../ProjectNetwork";
import ProjectGrid from "../ProjectGrid";
import FilterBar from "../FilterBar";
import { type FilterState, NO_FILTERS } from "../projectNetworkData";

const DEFAULT_BG = "#F9F9ED";

type Props = {
  backgroundColor?: string;
  heading?: string;
};

/**
 * Projects section for the horizontal scroll.
 * The panel itself is 100svh wide; internally it scrolls vertically
 * through Network → Grid → Filter bar.
 */
export default function SectionProjects({ backgroundColor, heading }: Props) {
  const [filters, setFilters] = useState<FilterState>(NO_FILTERS);

  return (
    <SectionShell id="projects" bgColor={backgroundColor ?? DEFAULT_BG} style={{ padding: 0 }}>
      <div className="h-full w-full overflow-y-auto overscroll-contain">
        {/* Map / network section */}
        <div className="relative h-svh w-full">
          {heading && (
            <h2
              className="pointer-events-none absolute z-10 font-[family-name:var(--font-manrope)] font-bold text-foreground"
              style={{
                top: "clamp(2rem, 5vw, 5rem)",
                left: "clamp(2rem, 5vw, 5rem)",
                fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                maxWidth: "20ch",
              }}
            >
              {heading}
            </h2>
          )}
          <ProjectNetwork mode="full" filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Grid section */}
        <ProjectGrid filters={filters} />

        {/* Sticky filter bar */}
        <FilterBar filters={filters} onChange={setFilters} />
      </div>
    </SectionShell>
  );
}
