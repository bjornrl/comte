"use client";

import { useState, useRef } from "react";
import ProjectNetwork from "./ProjectNetwork";
import ProjectGrid from "./ProjectGrid";
import FilterBar from "./FilterBar";
import BlobNav from "./BlobNav";
import Footer from "./Footer";
import {
  type Project,
  type Connection,
  type FilterState,
  NO_FILTERS,
  setProjectData,
} from "./projectNetworkData";

export default function ProjectsPageClient({
  projects,
  connections,
}: {
  projects: Project[];
  connections: Connection[];
}) {
  // Initialize module-level data before first render
  const initialized = useRef(false);
  if (!initialized.current) {
    setProjectData(projects, connections);
    initialized.current = true;
  }

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

      {/* Footer */}
      <Footer />
    </div>
  );
}
