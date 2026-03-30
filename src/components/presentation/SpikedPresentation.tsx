"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import type { Slide } from "./buildSlides";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1613575831056-0acd5da8f6e8?w=2000&q=80&auto=format&fit=crop";

/* Spiked expertise tile colors — brand accent cycle */
const SPIKED_TILE_COLORS = [
  { bg: "#F27887", text: "#FFFFFF" },
  { bg: "#D6B84C", text: "#1F3A32" },
  { bg: "#FF5252", text: "#FFFFFF" },
  { bg: "#5F7C8A", text: "#FFFFFF" },
  { bg: "#4F7C6C", text: "#FFFFFF" },
  { bg: "#F27887", text: "#FFFFFF" },
  { bg: "#1F3A32", text: "#FFFFFF" },
  { bg: "#D6B84C", text: "#1F3A32" },
];

function SpikedSlideView({
  slide,
  cms,
}: {
  slide: Slide;
  cms: { categories: any[]; projects: any[] };
}) {
  if (slide.kind === "cover") {
    return (
      <div className="h-full w-full relative overflow-hidden bg-gradient-to-br from-[#1F3A32] via-[#4F7C6C] to-[#F27887]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#F9F9ED] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#D6B84C] rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-[#F27887] rounded-full blur-2xl" />
        </div>
        <div className="relative h-full flex flex-col items-center justify-center p-16 text-white">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-8xl font-black mb-6 tracking-tight" style={{ transform: "rotate(-2deg)" }}>
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="text-3xl font-light mt-4" style={{ transform: "rotate(1deg)" }}>
                {slide.subtitle}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  if (slide.kind === "outro") {
    return (
      <div className="h-full w-full bg-gradient-to-br from-[#1F3A32] via-[#4F7C6C] to-[#F27887] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-center text-white"
          >
            <h2 className="text-9xl font-black mb-8" style={{ transform: "rotate(-3deg)" }}>
              {slide.title ?? "Takk"}
            </h2>
            <div className="flex justify-center gap-4">
              <Sparkles size={48} className="animate-pulse text-[#D6B84C]" />
              <Sparkles size={48} className="animate-pulse delay-150 text-[#F27887]" />
              <Sparkles size={48} className="animate-pulse delay-300 text-[#D6B84C]" />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (slide.kind === "category") {
    const cat = cms.categories.find((c: any) => c.id === slide.categoryId);
    return (
      <div className="h-full w-full bg-[#F9F9ED] p-16 flex flex-col justify-center">
        <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="max-w-4xl">
          <div className="inline-block px-6 py-2 bg-[#D6B84C] text-[#1F3A32] text-sm font-bold mb-6" style={{ transform: "rotate(-2deg)" }}>
            KATEGORI
          </div>
          <h2 className="text-7xl font-black mb-6 text-[#1F3A32] leading-tight" style={{ transform: "rotate(1deg)" }}>
            {cat?.title ?? "Kategori"}
          </h2>
          <p className="text-2xl text-[#676160] leading-relaxed max-w-2xl" style={{ transform: "rotate(-0.5deg)" }}>
            {cat?.blurb ?? ""}
          </p>
        </motion.div>
      </div>
    );
  }

  if (slide.kind === "expertise") {
    const cat = cms.categories.find((c: any) => c.id === slide.categoryId) as any;
    const expertiseList = (cat?.expertise || []) as string[];
    return (
      <div className="h-full w-full bg-[#1F3A32] text-white p-16 overflow-auto">
        <div className="mb-12">
          <h2 className="text-6xl font-black mb-4" style={{ transform: "rotate(-1deg)" }}>
            Vi kan hjelpe deg med
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {expertiseList.map((item, i) => {
            const tileColor = SPIKED_TILE_COLORS[i % SPIKED_TILE_COLORS.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 border-4 transition-transform"
                style={{
                  backgroundColor: tileColor.bg,
                  color: tileColor.text,
                  borderColor: tileColor.bg,
                  transform: `rotate(${i % 2 === 0 ? "-1" : "1"}deg)`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "rotate(0deg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = `rotate(${i % 2 === 0 ? "-1" : "1"}deg)`; }}
              >
                <p className="text-3xl font-bold">{item}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  if (slide.kind === "stats") {
    const cat = cms.categories.find((c: any) => c.id === slide.categoryId) as any;
    return (
      <div className="h-full w-full bg-gradient-to-br from-[#F27887] via-[#FF5252] to-[#D6B84C] p-16 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-center text-white"
        >
          <div className="text-9xl font-black mb-8" style={{ transform: "rotate(-5deg)" }}>
            {cat?.stats || "Stats"}
          </div>
        </motion.div>
      </div>
    );
  }

  if (slide.kind === "project") {
    const proj = cms.projects.find((p: any) => p.id === slide.projectId) as any;
    return (
      <div className="h-full w-full bg-white p-12 overflow-auto">
        <div className="grid grid-cols-12 gap-6 h-full">
          <div className="col-span-7 flex flex-col justify-between">
            <div>
              <div className="inline-block px-4 py-1 bg-[#1F3A32] text-white text-xs font-bold mb-4" style={{ transform: "rotate(-2deg)" }}>
                PROSJEKT
              </div>
              <h2 className="text-6xl font-black mb-6 text-[#1F3A32] leading-tight" style={{ transform: "rotate(0.5deg)" }}>
                {proj?.title}
              </h2>
              <div className="text-lg text-[#676160] leading-relaxed mb-8" style={{ transform: "rotate(-0.5deg)" }}>
                {proj?.excerpt || ""}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#D6B84C]/20" style={{ transform: "rotate(-1deg)" }}>
                <p className="text-xs uppercase mb-2 text-[#676160]">Klient</p>
                <p className="text-xl font-bold text-[#1F3A32]">{proj?.client}</p>
              </div>
              <div className="p-4 bg-[#F27887]/20" style={{ transform: "rotate(1deg)" }}>
                <p className="text-xs uppercase mb-2 text-[#676160]">&Aring;r</p>
                <p className="text-xl font-bold text-[#1F3A32]">{proj?.year}</p>
              </div>
            </div>
          </div>
          <div className="col-span-5 flex flex-col gap-4">
            {((proj?.images ?? []).length > 0 ? (proj?.images ?? []).slice(0, 2) : [FALLBACK_IMAGE]).map((src: string, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.2 }}
                className={`flex-1 bg-[#F9F9ED] rounded-2xl overflow-hidden border-4 transition-transform`}
                style={{
                  borderColor: i === 0 ? "#4F7C6C" : "#F27887",
                  transform: `rotate(${i % 2 === 0 ? "-2" : "2"}deg)`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "rotate(0deg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = `rotate(${i % 2 === 0 ? "-2" : "2"}deg)`; }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function SpikedPresentation({
  slides,
  cms,
  onClose,
}: {
  slides: Slide[];
  cms: { categories: any[]; projects: any[] };
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const total = slides.length;
  const go = (delta: number) =>
    setIndex((i) => Math.max(0, Math.min(total - 1, i + delta)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (["ArrowRight", " ", "PageDown"].includes(e.key)) go(1);
      if (["ArrowLeft", "Backspace", "PageUp"].includes(e.key)) go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, total]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#1F3A32] via-[#4F7C6C] to-[#F27887]">
      <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
        <button className="px-4 py-2 rounded-full text-white transition-all hover:bg-white/10" onClick={onClose}>
          <X size={18} /> Lukk
        </button>
      </div>
      <div className="h-full w-full grid place-items-center p-4">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.9, rotate: 5 }}
          transition={{ duration: 0.3 }}
          className="w-[95vw] h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-[#D6B84C]"
        >
          <SpikedSlideView slide={slides[index]} cms={cms} />
        </motion.div>
      </div>
      <div className="absolute bottom-4 inset-x-0 text-center z-10">
        <div className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold border-2 border-white/30">
          {index + 1} / {total}
        </div>
      </div>
      <button
        onClick={() => go(-1)}
        disabled={index === 0}
        className="absolute left-4 top-1/2 -translate-y-1/2 px-4 py-2 rounded-full border-2 border-white/50 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
        aria-label="Previous slide"
      >
        &larr;
      </button>
      <button
        onClick={() => go(1)}
        disabled={index === total - 1}
        className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 rounded-full border-2 border-white/50 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
        aria-label="Next slide"
      >
        &rarr;
      </button>
    </div>
  );
}
