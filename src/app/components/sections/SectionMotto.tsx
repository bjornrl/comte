"use client";

import { useEffect, useState } from "react";
import SectionShell from "./SectionShell";
import TiltedHeading from "../TiltedHeading";
import {
  HERO_FADE_DURATION_MS,
  HERO_MATTERS_LINE_DELAY_MS,
} from "../heroIntroTiming";

const DEFAULT_BG = "#1F3A32";
const TILT_COLOR = "#4F7C6C";

const LINES = ["Design to", "evolve"];

type Props = {
  heroText?: string;
  backgroundColor?: string;
  backgroundVideoUrl?: string;
  /** When false, unmount heavy background media to save CPU. */
  animationsActive?: boolean;
  /** Bumps when the user returns to landing — restarts lights + heading intro. */
  landingEpoch?: number;
};

export default function SectionMotto({
  backgroundColor,
  backgroundVideoUrl,
  animationsActive = true,
  landingEpoch = 1,
}: Props) {
  const bg = backgroundColor ?? DEFAULT_BG;
  const [introSettled, setIntroSettled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setIntroSettled(true);
      return;
    }
    setIntroSettled(false);
    const timer = window.setTimeout(
      () => setIntroSettled(true),
      HERO_MATTERS_LINE_DELAY_MS + HERO_FADE_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [landingEpoch]);

  return (
    <SectionShell
      id="motto"
      bgColor={bg}
      style={{ padding: 0, overflow: "visible", pointerEvents: "none" }}
    >
      {/* Drifting lights — pointer-events on iframe only (section is none). */}
      {!backgroundVideoUrl && animationsActive && (
        <iframe
          key={`motto-lights-${landingEpoch}`}
          src="/lights.html"
          title=""
          aria-hidden="true"
          className="absolute inset-0 z-[1] h-full w-full border-0"
          style={{ pointerEvents: "auto" }}
        />
      )}

      {backgroundVideoUrl && animationsActive && (
        <>
          <video
            key={`motto-video-${landingEpoch}`}
            src={backgroundVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
            className="absolute inset-0 z-0 h-full w-full object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 z-0 bg-black/30" />
        </>
      )}

      <TiltedHeading
        key={`motto-heading-${landingEpoch}`}
        lines={LINES}
        color={TILT_COLOR}
        parallaxFactor={0.18}
        blockAlignPanelXFraction={0.5}
        parallaxResetWhenHiddenSnapId="home"
        fadeIn={{ delayMs: HERO_MATTERS_LINE_DELAY_MS, durationMs: HERO_FADE_DURATION_MS }}
        introSettled={introSettled}
      />
    </SectionShell>
  );
}
