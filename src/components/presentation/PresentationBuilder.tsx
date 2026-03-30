"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, X, Download, Printer, ChevronRight } from "lucide-react";
import Pill from "./ui/Pill";
import Step1Areas from "./steps/Step1Areas";
import Step2Projects from "./steps/Step2Projects";
import Step3Format from "./steps/Step3Format";
import Step4Draft from "./steps/Step4Draft";
import SpikedPresentation from "./SpikedPresentation";
import NumberTicker from "./NumberTicker";
import MobileSlideView from "./MobileSlideView";
import buildSlides from "./buildSlides";
import type { Slide } from "./buildSlides";
import type { OutputType } from "./buildSlides";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1613575831056-0acd5da8f6e8?w=2000&q=80&auto=format&fit=crop";

/* Brand expertise tile colors — cycle through these */
const EXPERTISE_TILE_COLORS = [
  { bg: "#1F3A32", text: "#FFFFFF" },
  { bg: "#F27887", text: "#FFFFFF" },
  { bg: "#D6B84C", text: "#1F3A32" },
  { bg: "#4F7C6C", text: "#FFFFFF" },
  { bg: "#5F7C8A", text: "#FFFFFF" },
  { bg: "#FF5252", text: "#FFFFFF" },
  { bg: "#1F3A32", text: "#FFFFFF" },
  { bg: "#F27887", text: "#FFFFFF" },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);
  return isMobile;
}

function SlideView({
  slide,
  cms,
}: {
  slide: Slide;
  cms: { categories: any[]; projects: any[] };
}) {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileSlideView slide={slide} cms={cms} />;

  if (slide.kind === "cover")
    return (
      <div className="h-full w-full grid place-items-center p-16 bg-[#F9F9ED]">
        <div className="text-center">
          <div className="text-5xl font-semibold text-[#1F3A32]">{slide.title}</div>
          {slide.subtitle && (
            <div className="text-xl text-[#676160] mt-3">{slide.subtitle}</div>
          )}
        </div>
      </div>
    );

  if (slide.kind === "outro")
    return (
      <div className="h-full w-full p-12 flex flex-col items-center justify-center bg-[#F9F9ED]">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-semibold mb-4 text-[#1F3A32]">{slide.title ?? "Comte Bureau"}</h1>
          <p className="text-xl text-[#676160]">
            Vi er et tverrfaglig team som utvikler bedre l&oslash;sninger gjennom design, innsikt og innovasjon.
          </p>
        </div>
        <div className="mt-8 text-center text-[#676160]"><p>comte.no</p></div>
      </div>
    );

  if (slide.kind === "category") {
    const cat = cms.categories.find((c: any) => c.id === slide.categoryId);
    return (
      <div className="relative h-full w-full bg-white">
        <div className="absolute top-6 left-10 right-10 text-sm text-[#676160] flex items-center justify-between" style={{ fontFamily: "var(--font-geist-mono, monospace)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          <div>Comte Bureau</div>
          <div className="font-medium">Tilbudsforslag</div>
          <div>{new Date().getFullYear()}</div>
        </div>
        <div className="relative px-10 pt-24 pb-10 h-full grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex flex-col justify-between text-left">
            <div className="space-y-4">
              <h2 className="text-[clamp(40px,6vw,90px)] leading-[0.95] text-[#1F3A32]">{cat?.title ?? "Kategori"}</h2>
              <p className="text-[clamp(32px,1.5vw,44px)] text-[#676160] max-w-lg leading-relaxed">I Comte Bureau</p>
            </div>
            <p className="text-[#676160] italic text-3xl mt-8">{cat?.blurb ?? "Beskrivelse av kategorien."}</p>
          </div>
          <div className="w-full rounded-2xl overflow-hidden bg-[#F9F9ED] shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cat?.heroImage || "https://images.unsplash.com/photo-1761872936374-ec038c00d705?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740"}
              alt={cat?.title ?? "Kategori"}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="absolute left-10 bottom-6 text-xs text-[#676160]" style={{ fontFamily: "var(--font-geist-mono, monospace)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Comte Bureau</div>
      </div>
    );
  }

  if (slide.kind === "expertise") {
    const cat = cms.categories.find((c: any) => c.id === slide.categoryId) as any;
    const expertiseList = (cat?.expertise || []) as string[];
    return (
      <div className="relative h-full w-full bg-white">
        <div className="absolute top-6 left-10 right-10 text-sm text-[#676160] flex items-center justify-between" style={{ fontFamily: "var(--font-geist-mono, monospace)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          <div>Comte Bureau</div>
          <div className="font-medium">Tilbudsforslag</div>
          <div>{new Date().getFullYear()}</div>
        </div>
        <div className="relative h-full w-full">
          <div className="relative px-10 pt-24 pb-8 h-full flex flex-col gap-12">
            <h2 className="text-[clamp(36px,6vw,90px)] leading-[0.95] mb-8 text-[#1F3A32]">
              Vi kan <span className="italic">hjelpe deg</span> med
            </h2>
            <div className="flex-1 grid grid-cols-4 grid-rows-2 gap-1 min-h-0">
              {Array.from({ length: 8 }).map((_, i) => {
                const item = expertiseList[i];
                const tileColor = EXPERTISE_TILE_COLORS[i % EXPERTISE_TILE_COLORS.length];
                return (
                  <div
                    key={i}
                    className="flex flex-col justify-between rounded-sm p-2 transition-colors hover:brightness-95"
                    style={{
                      backgroundColor: item ? tileColor.bg : "#F9F9ED",
                      color: item ? tileColor.text : "#1F3A32",
                    }}
                  >
                    {item ? (
                      <>
                        <p className="uppercase text-xs tracking-wide opacity-70" style={{ fontFamily: "var(--font-geist-mono, monospace)" }}>{cat?.title ?? "Ekspertise"}</p>
                        <div className="flex flex-row justify-between items-end">
                          <p className="font-semibold leading-[0.9] text-left text-4xl break-words">{item}</p>
                        </div>
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="mt-8 text-xs text-[#676160]" style={{ fontFamily: "var(--font-geist-mono, monospace)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Comte Bureau</div>
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

    return (
      <div className="flex flex-row justify-between p-12 gap-48 h-full bg-white">
        <div className="h-1/3 w-full flex flex-col text-left">
          <p className="text-[clamp(2rem,6vw,7rem)] leading-[0.95] mt-12 text-[#1F3A32]">
            {cat?.statsTitle ?? "Over 20 years of experience"}
          </p>
          {cat?.statsDescription && (
            <p className="text-[#F27887] text-lg w-1/2 mt-12">{cat.statsDescription}</p>
          )}
        </div>
        <div className="divide-y divide-[#1F3A32]/20 w-full flex flex-col justify-center">
          {parsedStats.map((item: { number: string | null; sign: string | null; text: string }, i: number) => (
            <div key={i} className="flex flex-col text-left items-start justify-center leading-none p-4">
              {item.number ? (
                <>
                  <p className="text-[clamp(1.5rem,8vw,10rem)] text-left leading-none text-[#1F3A32]">
                    <NumberTicker from={0} target={parseInt(item.number) || 0} autoStart transition={{ duration: 3.5, type: "tween", ease: "easeInOut" }} />
                    {item.sign && <span>{item.sign}</span>}
                  </p>
                  <p className="mt-2 text-lg text-[#676160]">{item.text}</p>
                </>
              ) : (
                <p className="text-sm text-left text-[#676160]">{item.text}</p>
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
      <div className="h-[100vh] w-full p-12 grid grid-cols-2 grid-rows-4 gap-1 items-center bg-white">
        <div className="col-span-2 row-span-1 h-full flex items-center justify-center">
          <h2 className="text-6xl font-semibold text-[#1F3A32]">{proj?.title}</h2>
        </div>
        <div className="col-span-2 row-span-3 grid grid-cols-2 mt-3 text-lg gap-3 h-full">
          <div className="flex flex-col text-left">
            {proj?.bulletPoints && proj.bulletPoints.length > 0 ? (
              <div className="space-y-3 text-[#1F3A32] text-lg mb-4">
                {proj.bulletPoints.map((point: string, i: number) => (
                  <p key={i} className="text-xl leading-none">{point}</p>
                ))}
              </div>
            ) : (
              <div className="text-[#676160] mb-4">{proj?.excerpt || ""}</div>
            )}
            <div className="flex flex-row justify-between gap-4 mt-auto pt-4">
              <div className="flex flex-col justify-end gap-8 pt-2">
                {proj?.stat1 && (() => {
                  const match = proj.stat1.match(/^(\d+[+\-]?)\s*(.*)$/);
                  const number = match ? match[1] : null;
                  const rest = match ? match[2] : proj.stat1;
                  return (
                    <div className="flex flex-col">
                      {number && (
                        <p className="text-9xl font-bold text-[#1F3A32]">
                          <NumberTicker from={0} target={parseInt(number.replace(/[^0-9]/g, "")) || 0} autoStart transition={{ duration: 2.5, type: "tween", ease: "easeInOut" }} />
                          {number.includes("+") && "+"}{number.includes("-") && "-"}
                        </p>
                      )}
                      <p className={`${number ? "text-lg" : "text-3xl font-bold"} text-[#676160]`}>{rest}</p>
                    </div>
                  );
                })()}
                {proj?.stat2 && (() => {
                  const match = proj.stat2.match(/^(\d+[+\-]?)\s+(.+)$/);
                  const number = match ? match[1] : null;
                  const rest = match ? match[2] : proj.stat2;
                  return (
                    <div className="flex flex-col">
                      {number && (
                        <p className="text-9xl font-bold text-[#1F3A32]">
                          <NumberTicker from={0} target={parseInt(number.replace(/[^0-9]/g, "")) || 0} autoStart transition={{ duration: 2.5, type: "tween", ease: "easeInOut" }} />
                          {number.includes("+") && "+"}{number.includes("-") && "-"}
                        </p>
                      )}
                      <p className={`${number ? "text-lg" : "text-3xl font-bold"} text-[#676160]`}>{rest}</p>
                    </div>
                  );
                })()}
              </div>
              <div className="flex flex-col text-right justify-end gap-2 text-sm text-[#676160]" style={{ fontFamily: "var(--font-geist-mono, monospace)" }}>
                {proj?.client && <p>Klient: <strong className="text-[#1F3A32]">{proj.client}</strong></p>}
                {proj?.location && <p>Lokasjon: <strong className="text-[#1F3A32]">{proj.location}</strong></p>}
                {proj?.year && <p>&Aring;r: <strong className="text-[#1F3A32]">{proj.year}</strong></p>}
                {proj?.industry && <p>Industri: <strong className="text-[#1F3A32]">{proj.industry}</strong></p>}
              </div>
            </div>
          </div>
          {((proj?.images ?? []).length > 0 ? (proj?.images ?? []).slice(0, 1) : [FALLBACK_IMAGE]).map((src: string, i: number) => (
            <div key={i} className="w-full h-full bg-[#4F7C6C] rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function DeckOverlay({ slides, cms, onClose }: { slides: Slide[]; cms: any; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const isMobile = useIsMobile();
  const total = slides.length;
  const go = (delta: number) => setIndex((i) => Math.max(0, Math.min(total - 1, i + delta)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (["ArrowRight", " ", "PageDown"].includes(e.key)) go(1);
      if (["ArrowLeft", "Backspace", "PageUp"].includes(e.key)) go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, total]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMobile) {
      if (index < total - 1) go(1);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width / 2) {
      if (index > 0) go(-1);
    } else {
      if (index < total - 1) go(1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1F3A32]/95 text-white">
      {isMobile && index > 0 && (
        <button onClick={() => go(-1)} className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/90 hover:bg-white text-[#1F3A32] rounded-full flex items-center gap-2 shadow-lg transition-all" style={{ fontSize: "var(--pres-text-base)" }}>
          <ChevronLeft size={20} /><span>Back</span>
        </button>
      )}
      {isMobile && index < total - 1 && (
        <button onClick={() => go(1)} className="absolute top-4 right-4 z-10 px-4 py-2 bg-white/90 hover:bg-white text-[#1F3A32] rounded-full flex items-center gap-2 shadow-lg transition-all" style={{ fontSize: "var(--pres-text-base)" }}>
          <span>Next</span><ChevronRight size={20} />
        </button>
      )}
      <div className="h-full w-full grid place-items-center">
        <div className="w-full h-full bg-[#F9F9ED] text-[#1F3A32] rounded-sm shadow-2xl overflow-hidden cursor-pointer" onClick={handleTap}>
          <SlideView slide={slides[index]} cms={cms} />
        </div>
      </div>
      <div className="absolute bottom-4 inset-x-0 text-center text-sm opacity-80">{index + 1} / {total}</div>
    </div>
  );
}

function ReportOverlay({ slides, cms, onClose }: { slides: Slide[]; cms: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#F9F9ED]">
      <div className="flex items-center justify-between p-3 border-b border-[#E5E5E0]">
        <div className="flex items-center gap-2 text-sm">
          <button className="px-3 py-2 rounded-full flex items-center gap-1 text-[#1F3A32] hover:bg-[#1F3A32]/5 transition-colors" onClick={onClose}>
            <X size={16} /> Lukk
          </button>
          <button className="px-3 py-2 rounded-full border border-[#E5E5E0] flex items-center gap-1 text-[#1F3A32] hover:bg-[#1F3A32]/5 transition-colors" onClick={() => window.print()}>
            <Printer size={16} /> Print / PDF
          </button>
        </div>
        <Pill>Forh&aring;ndsvisning &ndash; A4</Pill>
      </div>
      <div className="p-6 grid gap-6 justify-center bg-[#F9F9ED]/50 overflow-auto h-[calc(100vh-56px)]">
        {slides.map((s, i) => (
          <div key={i} className="bg-white w-[210mm] h-[297mm] shadow rounded-xl overflow-hidden print:shadow-none print:rounded-none">
            <div className="p-16">
              <SlideView slide={s} cms={cms} />
            </div>
          </div>
        ))}
      </div>
      <style>{`@media print { body { -webkit-print-color-adjust: exact; } .print\\:shadow-none{box-shadow:none !important} .print\\:rounded-none{border-radius:0 !important} }`}</style>
    </div>
  );
}

interface PresentationBuilderProps {
  initialProjects: any[];
  initialCategories: any[];
}

export default function PresentationBuilder({
  initialProjects,
  initialCategories,
}: PresentationBuilderProps) {
  const projects = initialProjects;
  const categories = initialCategories;
  const cms = { categories, projects };

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [outputType, setOutputType] = useState<OutputType>("presentation");
  const [query, setQuery] = useState("");
  const [showDeck, setShowDeck] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showSpiked, setShowSpiked] = useState(false);

  const filteredProjects = useMemo(() => {
    const inCat = activeCategory
      ? projects.filter((p: any) => p.categories.includes(activeCategory))
      : projects;
    const q = query.trim().toLowerCase();
    if (!q) return inCat;
    return inCat.filter(
      (p: any) =>
        p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)
    );
  }, [projects, activeCategory, query]);

  const slides = useMemo(
    () => buildSlides(activeCategory, selectedProjects, outputType),
    [activeCategory, selectedProjects, outputType]
  );

  const handleGenerate = () => {
    if (outputType === "presentation") setShowDeck(true);
    else setShowReport(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#F9F9ED] text-[#1F3A32]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <header className="flex items-center justify-between mb-8">
          <div className="text-sm uppercase tracking-wider text-[#676160]" style={{ fontFamily: "var(--font-geist-mono, monospace)" }}>Comte Bureau</div>
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[#E5E5E0] bg-white text-[#1F3A32] hover:bg-[#1F3A32]/5 transition-colors"
                onClick={() => setStep((s) => (s > 1 ? ((s - 1) as any) : s))}
                aria-label="Tilbake"
              >
                <ChevronLeft size={16} /> Tilbake
              </button>
            )}
            <Pill>{new Date().getFullYear()}</Pill>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.section key="step1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Step1Areas
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                setSelectedProjects={setSelectedProjects}
                setStep={setStep}
              />
            </motion.section>
          )}
          {step === 2 && (
            <motion.section key="step2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Step2Projects
                categories={categories}
                filteredProjects={filteredProjects}
                selectedProjects={selectedProjects}
                setSelectedProjects={(updater) => setSelectedProjects(updater(selectedProjects))}
                query={query}
                setQuery={setQuery}
                setStep={setStep}
              />
            </motion.section>
          )}
          {step === 3 && (
            <motion.section key="step3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Step3Format
                outputType={outputType}
                setOutputType={setOutputType}
                selectedProjects={selectedProjects}
                setStep={setStep}
              />
            </motion.section>
          )}
          {step === 4 && (
            <motion.section key="step4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Step4Draft
                slides={slides}
                cms={cms}
                outputType={outputType}
                handleGenerate={handleGenerate}
                handleSpike={() => setShowSpiked(true)}
              />
            </motion.section>
          )}
        </AnimatePresence>

        <footer className="mt-16 text-xs text-[#676160]">&copy; Comte Bureau</footer>
      </div>

      {showDeck && <DeckOverlay slides={slides} cms={cms} onClose={() => setShowDeck(false)} />}
      {showReport && <ReportOverlay slides={slides} cms={cms} onClose={() => setShowReport(false)} />}
      {showSpiked && <SpikedPresentation slides={slides} cms={cms} onClose={() => setShowSpiked(false)} />}
    </div>
  );
}
