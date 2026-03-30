"use client";

import StepHeader from "../ui/StepHeader";
import Pill from "../ui/Pill";
import { Card, cx } from "../ui/Card";

const DOMAIN_TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  health:      { bg: "bg-[#F27887]/15", text: "text-[#1F3A32]", border: "border-[#F27887]/30" },
  education:   { bg: "bg-[#D6B84C]/15", text: "text-[#1F3A32]", border: "border-[#D6B84C]/30" },
  integration: { bg: "bg-[#4F7C6C]/15", text: "text-[#1F3A32]", border: "border-[#4F7C6C]/30" },
  urban:       { bg: "bg-[#5F7C8A]/15", text: "text-[#1F3A32]", border: "border-[#5F7C8A]/30" },
  climate:     { bg: "bg-[#1F3A32]/10", text: "text-[#1F3A32]", border: "border-[#1F3A32]/20" },
  digital:     { bg: "bg-[#FF5252]/15", text: "text-[#1F3A32]", border: "border-[#FF5252]/30" },
};

const FALLBACK_TAG = { bg: "bg-[#676160]/10", text: "text-[#1F3A32]", border: "border-[#676160]/20" };

function getTagColor(categoryId: string) {
  return DOMAIN_TAG_COLORS[categoryId] || FALLBACK_TAG;
}

export default function Step2Projects({
  categories,
  filteredProjects,
  selectedProjects,
  setSelectedProjects,
  query,
  setQuery,
  setStep,
}: {
  categories: any[];
  filteredProjects: any[];
  selectedProjects: string[];
  setSelectedProjects: (updater: (prev: string[]) => string[]) => void;
  query: string;
  setQuery: (q: string) => void;
  setStep: (s: 1 | 2 | 3 | 4) => void;
}) {
  return (
    <section>
      <StepHeader
        title="Hvilke prosjekter vil du inkludere?"
        subtitle="Sl&aring; p&aring; prosjekter som er relevante. Du kan s&oslash;ke og filtrere."
      />
      <div className="mb-4 flex items-center gap-3">
        <input
          className="w-full md:max-w-sm rounded-xl border border-[#E5E5E0] px-3 py-2 bg-white text-[#1F3A32] placeholder:text-[#676160]/60 focus:outline-none focus:border-[#1F3A32]/30"
          placeholder="S&oslash;k i prosjekter..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Pill>{selectedProjects.length} valgt</Pill>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 items-stretch">
        {filteredProjects.map((p: any) => {
          const on = selectedProjects.includes(p.id);
          return (
            <Card
              key={p.id}
              selected={on}
              onClick={() =>
                setSelectedProjects((prev) =>
                  prev.includes(p.id)
                    ? prev.filter((x) => x !== p.id)
                    : [...prev, p.id]
                )
              }
            >
              <div className="flex flex-col h-full p-1">
                <div className="flex-1 flex justify-between flex-col">
                  <div className="font-semibold">
                    <div
                      className={cx(
                        "w-4 h-4 rounded-full grid place-items-center border",
                        on ? "bg-[#1F3A32] border-[#1F3A32] text-white" : "bg-white border-[#E5E5E0]"
                      )}
                    />
                    {p.title}{" "}
                    {p.client && (
                      <p className={cx("text-sm mt-1", on ? "text-white/70" : "text-[#676160]")}>
                        {p.client}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {p.categories.map((cid: string) => {
                      const cat = categories.find((c: any) => c.id === cid);
                      const color = getTagColor(cid);
                      return (
                        <span
                          key={cid}
                          className={cx(
                            "text-xs px-2 py-1 rounded-full border",
                            on ? "bg-white/20 text-white border-white/30" : `${color.bg} ${color.text} ${color.border}`
                          )}
                        >
                          {cat?.title ?? cid}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          disabled={!selectedProjects.length}
          onClick={() => setStep(3)}
          className="inline-flex border border-[#1F3A32] items-center gap-2 px-4 py-2 rounded-full bg-[#1F3A32] text-white disabled:bg-[#E5E5E0] disabled:border-[#E5E5E0] disabled:text-[#676160] transition-colors"
        >
          Fortsett
        </button>
      </div>
    </section>
  );
}
