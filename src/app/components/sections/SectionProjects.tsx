"use client";

import ProjectCluster from "../ProjectCluster";
import type { Project } from "../projectNetworkData";

const DEFAULT_BG = "#1F3A32";

type Props = {
  backgroundColor?: string;
  heading?: string;
  projects?: Project[];
};

/**
 * Projects section for the horizontal scroll: a single full-viewport
 * cluster of dots grouped by tag/domain. Not vertically scrollable.
 */
export default function SectionProjects({ backgroundColor, heading, projects }: Props) {
  return (
    <section
      id="projects"
      data-section-id="projects"
      className="relative h-svh w-screen flex-shrink-0 overflow-hidden"
    >
      <ProjectCluster
        projects={projects}
        backgroundColor={backgroundColor ?? DEFAULT_BG}
        heading={heading}
      />
    </section>
  );
}
