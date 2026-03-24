"use client";

import { useState } from "react";
import ProjectNetwork from "../../components/ProjectNetwork";
import ProjectGrid from "../../components/ProjectGrid";
import FilterBar from "../../components/FilterBar";
import BlobNav from "../../components/BlobNav";
import { type FilterState, NO_FILTERS } from "../../components/projectNetworkData";

export default function ProjectsPage() {
  const [filters, setFilters] = useState<FilterState>(NO_FILTERS);

  return (
    <div style={{ background: "#F9F9ED", minHeight: "100vh" }}>
      <BlobNav />

      {/* Map section */}
      <div style={{ height: "100svh", position: "relative" }}>
        <ProjectNetwork mode="full" filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Grid section */}
      <ProjectGrid filters={filters} />

      {/* Sticky filter bar */}
      <FilterBar filters={filters} onChange={setFilters} />
    </div>
  );
}
