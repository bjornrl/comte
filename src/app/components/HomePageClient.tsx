"use client";

import { useRef, useState } from "react";
import HorizontalScroll, { type HorizontalScrollNavApi } from "./HorizontalScroll";
import BlobNav from "./BlobNav";
import ArrowBlob from "./ArrowBlob";
import { type Project, type Connection, setProjectData } from "./projectNetworkData";

export default function HomePageClient({
  heroText,
  projects,
  connections,
}: {
  heroText: string;
  projects: Project[];
  connections: Connection[];
}) {
  const scrollNavRef = useRef<HorizontalScrollNavApi | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const initialized = useRef(false);
  if (!initialized.current) {
    setProjectData(projects, connections);
    initialized.current = true;
  }

  return (
    <div className="h-screen overflow-hidden">
      <BlobNav />
      <ArrowBlob navRef={scrollNavRef} activeIndex={activeSlideIndex} />
      <HorizontalScroll
        navRef={scrollNavRef}
        onActiveIndexChange={setActiveSlideIndex}
        heroText={heroText}
        projects={projects}
      />
    </div>
  );
}
