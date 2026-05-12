import SectionShell, { PANEL_PADDING } from "./SectionShell";

const DEFAULT_BG = "#1F3A32";

type Props = {
  heroText?: string;
  backgroundColor?: string;
  backgroundVideoUrl?: string;
};

export default function SectionHome({ heroText, backgroundColor, backgroundVideoUrl }: Props) {
  const text = heroText ?? "Innovation for societal impact";
  const [firstWord, ...restWords] = text.split(" ");
  const remainder = restWords.join(" ");

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
          className="font-[family-name:var(--font-manrope)] font-bold text-white max-w-[14ch]"
          style={{
            fontSize: "clamp(2rem, 6vw, 5rem)",
            lineHeight: 1.4,
            letterSpacing: "-0.02em",
          }}
        >
          {firstWord}
          {remainder ? (
            <>
              <br />
              {remainder}
            </>
          ) : null}
          <span
            aria-hidden="true"
            className="inline-block align-baseline"
            style={{
              width: "0.6em",
              height: "0.6em",
              marginLeft: "0.15em",
              borderRadius: "9999px",
              background: "white",
              verticalAlign: "baseline",
            }}
          />
        </h1>
      </div>
    </SectionShell>
  );
}
