"use client";

import StepHeader from "../ui/StepHeader";
import { Card } from "../ui/Card";

const CATEGORY_HOVER_COLORS = [
  "hover:bg-[#F27887]/10",
  "hover:bg-[#D6B84C]/10",
  "hover:bg-[#4F7C6C]/10",
  "hover:bg-[#5F7C8A]/10",
  "hover:bg-[#1F3A32]/10",
  "hover:bg-[#FF5252]/10",
];

export default function Step1Areas({
  categories,
  activeCategory,
  setActiveCategory,
  setSelectedProjects,
  setStep,
}: {
  categories: any[];
  activeCategory: string | null;
  setActiveCategory: (id: string) => void;
  setSelectedProjects: (ids: string[]) => void;
  setStep: (s: 1 | 2 | 3 | 4) => void;
}) {
  return (
    <section>
      <div className="p-12 flex flex-col justify-center items-center">
        <StepHeader
          title="Omr&aring;der"
          subtitle="Velg ett omr&aring;de for &aring; lage presentasjon"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
        {categories.map((c: any, i: number) => {
          const hoverColor = CATEGORY_HOVER_COLORS[i % CATEGORY_HOVER_COLORS.length];

          return (
            <Card
              key={c.id}
              selected={activeCategory === c.id}
              onClick={() => {
                setActiveCategory(c.id);
                setSelectedProjects([]);
                setStep(2);
              }}
              hoverColor={hoverColor}
            >
              <div className="flex flex-col items-start gap-2 p-4 min-h-20">
                <div className="text-[clamp(20px,4vw,25px)] font-semibold min-h-12">
                  {c.title}
                </div>
                {c.blurb && (
                  <p className="text-sm text-[#676160] line-clamp-2">{c.blurb}</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
