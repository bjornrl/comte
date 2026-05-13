import SectionShell, { PANEL_PADDING } from "./SectionShell";

const DEFAULT_BG = "#1F3A32";

type Props = {
  backgroundColor?: string;
  backgroundVideoUrl?: string;
};

// Hardcoded hero copy. Line breaks come from the array order — one entry =
// one rendered line.
const HERO_LINES = ["Comte", "creates change", "that matters"];

export default function SectionHome({ backgroundColor, backgroundVideoUrl }: Props) {
  return (
    <SectionShell id="home" bgColor={backgroundColor ?? DEFAULT_BG} style={{ padding: 0 }}>
      {/* Background video */}
      {backgroundVideoUrl && (
        <video
          src={backgroundVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
      )}

      {/* Dim overlay (improves text legibility over video) */}
      {backgroundVideoUrl && (
        <div aria-hidden="true" className="absolute inset-0 z-0 bg-black/30" />
      )}

      {/* Bottom-left hero text */}
      <div
        className="absolute z-10"
        style={{ left: PANEL_PADDING, bottom: PANEL_PADDING, right: PANEL_PADDING }}
      >
        <h1
          className="relative font-[family-name:var(--font-manrope)] font-bold text-white max-w-[14ch]"
          style={{
            fontSize: "clamp(2.5rem, 7.25vw, 6rem)",
            lineHeight: 1.4,
            letterSpacing: "-0.02em",
          }}
        >
          {/*
           * Suspended dot — placed in the upper-right of the wordmark, like
           * the dot in the Comte logo. All offsets are em-based so the dot
           * scales with the hero font-size.
           */}
          {/*
           * left = (widest-line width in em) − dot-size, so the dot's RIGHT
           * edge lines up with the rightmost letter ("e" in "change") of
           * the longest line. The 7.22em width of "creates change" is a
           * font/letter-spacing constant for this hero text — re-measure if
           * the copy changes.
           */}
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-0.15em",
              left: "6.9em",
              width: "0.32em",
              height: "0.32em",
              borderRadius: "9999px",
              background: "white",
            }}
          />
          {HERO_LINES.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h1>
      </div>
    </SectionShell>
  );
}
