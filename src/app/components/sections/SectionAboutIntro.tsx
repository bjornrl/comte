import Image from "next/image";
import SectionShell from "./SectionShell";

const DEFAULT_BG = "#F9F9ED";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop";

type Props = {
  backgroundColor?: string;
  imageUrl?: string;
  imageAlt?: string;
  whoIsComteTitle?: string;
  whoIsComte?: string;
  whoAreWeTitle?: string;
  whoAreWe?: string;
};

export default function SectionAboutIntro({
  backgroundColor,
  imageUrl,
  imageAlt,
  whoIsComteTitle,
  whoIsComte,
  whoAreWeTitle,
  whoAreWe,
}: Props) {
  return (
    <SectionShell id="about-intro" bgColor={backgroundColor ?? DEFAULT_BG} style={{ padding: 0 }}>
      <div className="grid h-full w-full grid-cols-1 lg:grid-cols-[6fr_4fr]">
        {/* Left ~60%: image */}
        <div className="relative h-full min-h-[50svh] overflow-hidden">
          <Image
            src={imageUrl ?? PLACEHOLDER_IMAGE}
            alt={imageAlt ?? ""}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
          />
        </div>

        {/* Right ~40%: two text blocks */}
        <div className="flex h-full flex-col justify-center gap-12 px-[clamp(1.5rem,4vw,4rem)] py-[clamp(2rem,5vw,5rem)]">
          {(whoIsComteTitle || whoIsComte) && (
            <div>
              <h2 className="mb-3 font-[family-name:var(--font-manrope)] text-2xl font-bold text-foreground">
                {whoIsComteTitle ?? "Who is Comte"}
              </h2>
              {whoIsComte && (
                <p className="text-foreground/80 font-[family-name:var(--font-manrope)] text-base font-light leading-relaxed whitespace-pre-line">
                  {whoIsComte}
                </p>
              )}
            </div>
          )}

          {(whoAreWeTitle || whoAreWe) && (
            <div>
              <h2 className="mb-3 font-[family-name:var(--font-manrope)] text-2xl font-bold text-foreground">
                {whoAreWeTitle ?? "Who are we"}
              </h2>
              {whoAreWe && (
                <p className="text-foreground/80 font-[family-name:var(--font-manrope)] text-base font-light leading-relaxed whitespace-pre-line">
                  {whoAreWe}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  );
}
