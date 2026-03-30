"use client";

import { FileText, Play } from "lucide-react";
import StepHeader from "../ui/StepHeader";
import { Card } from "../ui/Card";

export default function Step3Format({
  outputType,
  setOutputType,
  selectedProjects,
  setStep,
}: {
  outputType: "presentation" | "report";
  setOutputType: (v: "presentation" | "report") => void;
  selectedProjects: string[];
  setStep: (s: 1 | 2 | 3 | 4) => void;
}) {
  return (
    <section>
      <StepHeader
        title="Hva vil du presentere?"
        subtitle="Velg formatet &ndash; levende presentasjon eller PDF-rapport."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        <Card
          selected={outputType === "presentation"}
          onClick={() => setOutputType("presentation")}
        >
          <div className="flex items-start gap-3 p-4">
            <div className="w-10 h-10 rounded-full bg-[#1F3A32] text-white grid place-items-center">
              <Play size={18} />
            </div>
            <div>
              <div className="text-xl font-semibold">Presentasjon</div>
              <p className={`mt-1 text-sm ${outputType === "presentation" ? "text-white/70" : "text-[#676160]"}`}>
                Lysbildefremvisning i nettleseren.
              </p>
            </div>
          </div>
        </Card>
        <Card
          selected={outputType === "report"}
          onClick={() => setOutputType("report")}
        >
          <div className="flex items-start gap-3 p-4">
            <div className="w-10 h-10 rounded-full bg-[#1F3A32] text-white grid place-items-center">
              <FileText size={18} />
            </div>
            <div>
              <div className="text-xl font-semibold">Rapport (PDF)</div>
              <p className={`mt-1 text-sm ${outputType === "report" ? "text-white/70" : "text-[#676160]"}`}>
                Utskriftsvennlig, ferdig for deling.
              </p>
            </div>
          </div>
        </Card>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-[#676160]">
          {selectedProjects.length} prosjekter valgt
        </div>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 rounded-full border border-[#1F3A32] text-[#1F3A32] hover:bg-[#1F3A32]/5 transition-colors"
            onClick={() => setStep(2)}
          >
            Endre prosjekter
          </button>
          <button
            className="px-4 py-2 rounded-full border border-[#1F3A32] bg-[#1F3A32] text-white hover:bg-[#1F3A32]/90 transition-colors"
            onClick={() => setStep(4)}
          >
            Lag utkast
          </button>
        </div>
      </div>
    </section>
  );
}
