"use client";

import ProjectNetwork from "../../components/ProjectNetwork";
import BlobNav from "../../components/BlobNav";

export default function ProjectsPage() {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#212121",
    }}>
      <BlobNav />
      <ProjectNetwork />
    </div>
  );
}
