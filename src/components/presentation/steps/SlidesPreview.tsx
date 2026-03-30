"use client";

import type { Slide } from "../buildSlides";

export default function SlidesPreview({
  slides,
  cms,
}: {
  slides: Slide[];
  cms: { categories: any[]; projects: any[] };
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 w-full">
      {slides.map((s, i) => {
        const base = "rounded-sm border border-[#E5E5E0] p-4 min-h-[140px] bg-white text-[#1F3A32]";
        if (s.kind === "cover")
          return (
            <div key={i} className={base}>
              <div className="text-sm text-[#676160]">Cover</div>
              <div className="mt-2 text-xl font-semibold">{s.title}</div>
              {s.subtitle && (
                <div className="text-[#676160]">{s.subtitle}</div>
              )}
            </div>
          );
        if (s.kind === "outro")
          return (
            <div key={i} className={base}>
              <div className="text-sm text-[#676160]">Outro</div>
              <div className="mt-2 text-xl font-semibold">
                {s.title ?? "Takk"}
              </div>
            </div>
          );
        if (s.kind === "category") {
          const cat = cms.categories.find((c: any) => c.id === s.categoryId);
          return (
            <div key={i} className={base}>
              <div className="text-sm text-[#676160]">Kategori</div>
              <div className="mt-2 text-lg font-semibold">{cat?.title}</div>
              <p className="text-[#676160] mt-1 text-sm">{cat?.blurb}</p>
            </div>
          );
        }
        if (s.kind === "expertise") {
          const cat = cms.categories.find((c: any) => c.id === s.categoryId);
          return (
            <div key={i} className={base}>
              <div className="text-sm text-[#676160]">Ekspertise</div>
              <div className="mt-2 text-lg font-semibold">
                {(cat?.expertise || []).map((e: string, idx: number) => (
                  <div key={idx}>&#8226; {e}</div>
                ))}
              </div>
            </div>
          );
        }
        if (s.kind === "stats") {
          const cat = cms.categories.find((c: any) => c.id === s.categoryId);
          return (
            <div key={i} className={base}>
              <div className="text-sm text-[#676160]">Statistikk</div>
              <div className="mt-2 text-lg font-semibold">
                {(cat?.stats || [])
                  .slice(0, 3)
                  .map((e: string, idx: number) => (
                    <div key={idx}>&#8226; {e}</div>
                  ))}
              </div>
            </div>
          );
        }
        if (s.kind === "project") {
          const proj = cms.projects.find((p: any) => p.id === s.projectId);
          return (
            <div key={i} className={base}>
              <div className="text-sm text-[#676160]">Prosjekt</div>
              <div className="mt-2 font-semibold">{proj?.title}</div>
              <p className="text-[#676160] text-sm line-clamp-3">
                {proj?.client}
              </p>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
