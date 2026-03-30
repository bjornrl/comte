"use client";

import { Download, Sparkles } from "lucide-react";
import StepHeader from "../ui/StepHeader";
import downloadJSON from "../downloadJSON";
import SlidesPreview from "./SlidesPreview";
import type { Slide } from "../buildSlides";

export default function Step4Draft({
  slides,
  cms,
  outputType,
  handleGenerate,
  handleSpike,
}: {
  slides: Slide[];
  cms: { categories: any[]; projects: any[] };
  outputType: "presentation" | "report";
  handleGenerate: () => void;
  handleSpike: () => void;
}) {
  return (
    <section className="flex flex-col items-center">
      <StepHeader title="Utkast" subtitle="Forh&aring;ndsvisning av slides" />
      <SlidesPreview slides={slides} cms={cms} />
      <div className="w-full mt-6 flex items-center justify-end gap-3">
        <button
          className="px-4 py-2 flex flex-row justify-center items-center gap-2 rounded-full border border-[#E5E5E0] text-[#676160] hover:border-[#1F3A32]/30 transition-colors"
          onClick={() => downloadJSON("slides.json", slides)}
        >
          <Download size={16} /> Last ned slides.json
        </button>
        <button
          className="px-4 py-2 rounded-full border-0 bg-gradient-to-r from-[#F27887] to-[#FF5252] text-white font-bold hover:from-[#e06878] hover:to-[#e04848] transition-all transform hover:scale-105 flex items-center gap-2"
          onClick={handleSpike}
        >
          <Sparkles size={16} /> Spike it
        </button>
        <button
          className="px-4 py-2 rounded-full border border-[#1F3A32] bg-[#1F3A32] text-white hover:bg-[#1F3A32]/90 transition-colors"
          onClick={handleGenerate}
        >
          Generer {outputType === "presentation" ? "presentasjon" : "PDF"}
        </button>
      </div>
    </section>
  );
}
