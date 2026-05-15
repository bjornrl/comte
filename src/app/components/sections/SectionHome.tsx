import SectionShell, { PANEL_PADDING } from "./SectionShell";
import HomeBackgroundNetwork from "../HomeBackgroundNetwork";

const DEFAULT_BG = "#1F3A32";

type Props = {
  backgroundColor?: string;
  backgroundVideoUrl?: string;
};

// Hardcoded hero copy. Line breaks come from the array order — one entry =
// one rendered line.
const HERO_LINES = ["Comte", "creates change", "that matters"];

// Entry-animation timing (ms). The dot network starts immediately on mount;
// these delays trail behind so the dot field reads as "alive" before the
// wordmark surfaces over it. Tuned alongside HomeBackgroundNetwork's
// LINES_APPEAR_DELAY so the connection lines arrive after the last text
// line settles in.
const HERO_LINE_DELAYS_MS = [900, 1200, 1500];
const HERO_DOT_DELAY_MS = 1000;

export default function SectionHome({ backgroundColor, backgroundVideoUrl }: Props) {
  return (
    <SectionShell
      id="home"
      bgColor={backgroundColor ?? DEFAULT_BG}
      // overflow: visible lets the background canvas extend right into the
      // motto panel so the dot network spans both. Motto's section bg paints
      // at z-auto and the canvas at z-1, so the canvas wins on top of bg but
      // loses to TiltedHeading + hero text (both z-10).
      style={{ padding: 0, overflow: "visible" }}
    >
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

      {/* Interactive dot-network background. Sits above the bg colour/video
          and dim overlay, below the hero text. Lines from the dots converge
          on the hero's white dot via its `data-hero-anchor` attribute. */}
      <HomeBackgroundNetwork />

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
           * Suspended dot — vertically anchored to the "Comte" line via
           * top: -0.15em, but horizontally CENTRED on the viewport. The
           * `left` math takes the dot out of h1's local coord space:
           *   target-x in viewport = 50vw
           *   h1.left in viewport  = PANEL_PADDING
           *   left (from h1's left) = 50vw − PANEL_PADDING − 0.16em
           *   (the 0.16em is half the dot-size so its CENTRE lands on 50vw)
           */}
          <span
            aria-hidden="true"
            data-hero-anchor=""
            style={{
              position: "absolute",
              top: "-0.15em",
              left: `calc(50vw - ${PANEL_PADDING} - 0.16em)`,
              width: "0.32em",
              height: "0.32em",
              borderRadius: "9999px",
              background: "white",
              opacity: 0,
              // The dot uses a scale-and-fade keyframe — it stays anchored
              // in place while the surrounding text slides up.
              animation: "heroDotIn 700ms cubic-bezier(0.25,1,0.5,1) forwards",
              animationDelay: `${HERO_DOT_DELAY_MS}ms`,
            }}
          />
          {HERO_LINES.map((line, i) => (
            <span
              key={i}
              className="block"
              style={{
                opacity: 0,
                animation:
                  "heroFadeIn 700ms cubic-bezier(0.25,1,0.5,1) forwards",
                animationDelay: `${HERO_LINE_DELAYS_MS[i] ?? 0}ms`,
              }}
            >
              {line}
            </span>
          ))}
        </h1>
      </div>

      {/* @keyframes for the cascading hero entry. Text lines slide+fade,
          the white dot only scales+fades (stays put). Inline so the
          animation ships with this section and isn't a global concern. */}
      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroDotIn {
          from { opacity: 0; transform: scale(0); }
          to   { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-snap-id="home"] [style*="heroFadeIn"],
          [data-snap-id="home"] [style*="heroDotIn"] {
            animation-duration: 1ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>
    </SectionShell>
  );
}
