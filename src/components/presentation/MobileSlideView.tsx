"use client";

import NumberTicker from "./NumberTicker";
import type { Slide } from "./buildSlides";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1613575831056-0acd5da8f6e8?w=2000&q=80&auto=format&fit=crop";

/* Brand expertise tile colors for mobile */
const MOBILE_TILE_COLORS = [
  { bg: "#1F3A32", text: "#FFFFFF" },
  { bg: "#F27887", text: "#FFFFFF" },
  { bg: "#D6B84C", text: "#1F3A32" },
  { bg: "#4F7C6C", text: "#FFFFFF" },
  { bg: "#5F7C8A", text: "#FFFFFF" },
  { bg: "#FF5252", text: "#FFFFFF" },
  { bg: "#1F3A32", text: "#FFFFFF" },
  { bg: "#F27887", text: "#FFFFFF" },
];

export default function MobileSlideView({
  slide,
  cms,
}: {
  slide: Slide;
  cms: { categories: any[]; projects: any[] };
}) {
  if (slide.kind === "cover")
    return (
      <div
        className="h-full w-full grid place-items-center bg-[#F9F9ED]"
        style={{ padding: "var(--pres-padding-xl)" }}
      >
        <div className="text-left">
          <div className="font-semibold text-[#1F3A32]" style={{ fontSize: "var(--pres-h1)" }}>
            {slide.title}
          </div>
          {slide.subtitle && (
            <div
              className="text-[#676160]"
              style={{
                fontSize: "var(--pres-text-lg)",
                marginTop: "var(--pres-gap-md)",
              }}
            >
              {slide.subtitle}
            </div>
          )}
        </div>
      </div>
    );

  if (slide.kind === "outro")
    return (
      <div
        className="h-full w-full flex flex-col items-center justify-center bg-[#F9F9ED]"
        style={{ padding: "var(--pres-padding-xl)" }}
      >
        <div className="text-center" style={{ marginBottom: "var(--pres-gap-lg)" }}>
          <h1
            className="font-semibold text-[#1F3A32]"
            style={{
              fontSize: "var(--pres-h1)",
              marginBottom: "var(--pres-padding-base)",
            }}
          >
            {slide.title ?? "Comte Bureau"}
          </h1>
          <p className="text-[#676160]" style={{ fontSize: "var(--pres-text-lg)" }}>
            Vi er et tverrfaglig team som utvikler bedre l&oslash;sninger gjennom
            design, innsikt og innovasjon.
          </p>
        </div>
        <div
          className="text-center text-[#676160]"
          style={{ marginTop: "var(--pres-gap-lg)", fontSize: "var(--pres-text-base)" }}
        >
          <p>comte.no</p>
        </div>
      </div>
    );

  if (slide.kind === "category") {
    const cat = cms.categories.find((c: any) => c.id === slide.categoryId);
    return (
      <div
        className="relative h-full w-full bg-white"
        style={{ padding: "var(--pres-padding-lg)" }}
      >
        <div className="h-full flex flex-col justify-between">
          <div style={{ gap: "var(--pres-gap-base)" }} className="flex flex-col">
            <h2 className="leading-tight text-[#1F3A32]" style={{ fontSize: "var(--pres-h2)" }}>
              {cat?.title ?? "Kategori"}
            </h2>
            <p className="text-[#676160] leading-relaxed" style={{ fontSize: "var(--pres-text-xl)" }}>
              I Comte Bureau
            </p>
            <p
              className="text-[#676160] italic"
              style={{ fontSize: "var(--pres-text-xl)", marginTop: "var(--pres-padding-base)" }}
            >
              {cat?.blurb ?? "Beskrivelse av kategorien."}
            </p>
          </div>
          <div
            className="text-[#676160]"
            style={{ fontSize: "var(--pres-text-xs)", marginTop: "var(--pres-padding-base)", fontFamily: "var(--font-geist-mono, monospace)", letterSpacing: "0.05em", textTransform: "uppercase" }}
          >
            Comte Bureau
          </div>
        </div>
      </div>
    );
  }

  if (slide.kind === "expertise") {
    const cat = cms.categories.find((c: any) => c.id === slide.categoryId) as any;
    const expertiseList = (cat?.expertise || []) as string[];
    return (
      <div
        className="relative h-full w-full bg-white"
        style={{ padding: "var(--pres-padding-lg)" }}
      >
        <div className="h-full flex flex-col" style={{ gap: "var(--pres-gap-lg)" }}>
          <h2
            className="leading-tight text-[#1F3A32]"
            style={{ fontSize: "var(--pres-h2)", marginBottom: "var(--pres-padding-base)" }}
          >
            Vi kan <span className="italic">hjelpe deg</span> med
          </h2>
          <div className="flex-1 grid grid-cols-2" style={{ gap: "var(--pres-gap-sm)" }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const item = expertiseList[i];
              const tileColor = MOBILE_TILE_COLORS[i % MOBILE_TILE_COLORS.length];
              return (
                <div
                  key={i}
                  className="flex flex-col justify-between transition-colors hover:brightness-95"
                  style={{
                    padding: "var(--pres-padding-sm)",
                    borderRadius: "var(--pres-radius-sm)",
                    backgroundColor: item ? tileColor.bg : "#F9F9ED",
                    color: item ? tileColor.text : "#1F3A32",
                  }}
                >
                  {item ? (
                    <>
                      <p className="uppercase tracking-wide opacity-70" style={{ fontSize: "var(--pres-text-xs)", fontFamily: "var(--font-geist-mono, monospace)" }}>
                        {cat?.title ?? "Ekspertise"}
                      </p>
                      <p className="font-semibold leading-[0.9] text-left break-words" style={{ fontSize: "var(--pres-text-lg)" }}>
                        {item}
                      </p>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="text-[#676160]" style={{ marginTop: "var(--pres-padding-base)", fontSize: "var(--pres-text-xs)", fontFamily: "var(--font-geist-mono, monospace)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Comte Bureau
          </div>
        </div>
      </div>
    );
  }

  if (slide.kind === "stats") {
    const cat = cms.categories.find((c: any) => c.id === slide.categoryId) as any;
    const statsArray = Array.isArray(cat?.stats) ? cat.stats : cat?.stats ? [cat.stats] : [];
    const parsedStats = statsArray.map((stat: string) => {
      const match = stat.match(/^(\d+)([+\-%]?)\s+(.+)$/);
      if (match) return { number: match[1], sign: match[2], text: match[3] };
      return { number: null, sign: null, text: stat };
    });
    const gridStats = parsedStats.slice(0, 3);

    return (
      <div className="h-full w-full bg-white" style={{ padding: "var(--pres-padding-lg)" }}>
        <div className="grid grid-cols-2 grid-rows-2 h-full" style={{ gap: "var(--pres-gap-base)" }}>
          <div className="flex flex-col justify-center">
            <p className="leading-tight text-[#1F3A32]" style={{ fontSize: "var(--pres-h2)" }}>
              {cat?.statsTitle ?? "Over 20 years of experience"}
            </p>
            {cat?.statsDescription && (
              <p className="text-[#F27887]" style={{ fontSize: "var(--pres-text-sm)", marginTop: "var(--pres-gap-sm)" }}>
                {cat.statsDescription}
              </p>
            )}
          </div>
          {gridStats.map((item: { number: string | null; sign: string | null; text: string }, i: number) => (
            <div key={i} className="flex flex-col justify-center text-left leading-none">
              {item.number ? (
                <>
                  <p className="text-[#1F3A32]" style={{ fontSize: "var(--pres-stat-large)" }}>
                    <NumberTicker from={0} target={parseInt(item.number) || 0} autoStart transition={{ duration: 3.5, type: "tween", ease: "easeInOut" }} />
                    {item.sign && <span>{item.sign}</span>}
                  </p>
                  <p className="text-[#676160]" style={{ marginTop: "var(--pres-gap-sm)", fontSize: "var(--pres-text-sm)" }}>
                    {item.text}
                  </p>
                </>
              ) : (
                <p className="text-left text-[#676160]" style={{ fontSize: "var(--pres-text-sm)" }}>{item.text}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.kind === "project") {
    const proj = cms.projects.find((p: any) => p.id === slide.projectId) as any;
    return (
      <div className="h-full w-full flex flex-col bg-white" style={{ padding: "var(--pres-padding-lg)", gap: "var(--pres-gap-base)" }}>
        <div className="flex-shrink-0">
          <h2 className="font-semibold text-[#1F3A32]" style={{ fontSize: "var(--pres-h2)" }}>
            {proj?.title}
          </h2>
        </div>
        <div className="flex-shrink-0 w-full" style={{ aspectRatio: "16/9" }}>
          {((proj?.images ?? []).length > 0 ? (proj?.images ?? []).slice(0, 1) : [FALLBACK_IMAGE]).map((src: string, i: number) => (
            <div key={i} className="w-full h-full bg-[#F9F9ED] overflow-hidden flex items-center justify-center" style={{ borderRadius: "var(--pres-radius-base)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="max-w-full max-h-full w-auto h-auto object-contain" />
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          {proj?.bulletPoints && proj.bulletPoints.length > 0 ? (
            <div className="text-[#1F3A32]" style={{ gap: "var(--pres-gap-sm)", display: "flex", flexDirection: "column" }}>
              {proj.bulletPoints.map((point: string, i: number) => (
                <p key={i} className="leading-relaxed" style={{ fontSize: "var(--pres-text-base)" }}>{point}</p>
              ))}
            </div>
          ) : (
            <div className="text-[#676160]" style={{ fontSize: "var(--pres-text-base)" }}>
              {proj?.excerpt || ""}
            </div>
          )}
        </div>
        <div className="flex-shrink-0 flex flex-col border-t border-[#E5E5E0]" style={{ gap: "var(--pres-gap-base)", paddingTop: "var(--pres-padding-base)" }}>
          {proj?.stat1 && (() => {
            const match = proj.stat1.match(/^(\d+[+\-]?)\s*(.*)$/);
            const number = match ? match[1] : null;
            const rest = match ? match[2] : proj.stat1;
            return (
              <div className="flex flex-col">
                {number && (
                  <p className="font-bold text-[#1F3A32]" style={{ fontSize: "var(--pres-stat-large)" }}>
                    <NumberTicker from={0} target={parseInt(number.replace(/[^0-9]/g, "")) || 0} autoStart transition={{ duration: 2.5, type: "tween", ease: "easeInOut" }} />
                    {number.includes("+") && "+"}{number.includes("-") && "-"}
                  </p>
                )}
                <p className="text-[#676160]" style={{ fontSize: number ? "var(--pres-text-base)" : "var(--pres-text-lg)", fontWeight: number ? "normal" : "bold" }}>
                  {rest}
                </p>
              </div>
            );
          })()}
          <div className="flex flex-col text-[#676160]" style={{ gap: "var(--pres-gap-xs)", fontSize: "var(--pres-text-xs)", fontFamily: "var(--font-geist-mono, monospace)" }}>
            {proj?.client && <p>Klient: <strong className="text-[#1F3A32]">{proj.client}</strong></p>}
            {proj?.location && <p>Lokasjon: <strong className="text-[#1F3A32]">{proj.location}</strong></p>}
            {proj?.year && <p>&Aring;r: <strong className="text-[#1F3A32]">{proj.year}</strong></p>}
            {proj?.industry && <p>Industri: <strong className="text-[#1F3A32]">{proj.industry}</strong></p>}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
