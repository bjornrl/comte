"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

export type InterstitialData = {
  text?: string;
  image?: any;
  videoUrl?: string;
  backgroundColor?: string;
};

type Props = {
  data: InterstitialData;
  /** How fast the panel scrolls relative to the main sections. >1 = faster. */
  parallaxFactor?: number;
  /** Override panel width — defaults to a narrow strip beside the section. */
  width?: string;
};

/** Parallax strip beside the section — wider than before, still not full viewport. */
const DEFAULT_WIDTH = "clamp(16rem, 26vw, 30rem)";
// Inner content padding leaves "leeway" so the parallax transform doesn't
// clip the text at the panel edges (image/video full-bleed modes skip this).
const INNER_PADDING_X = "clamp(1rem, 3vw, 2rem)";

function sanityImageUrl(imageField: any, width = 1600): string | null {
  if (!imageField?.asset) return null;
  return urlFor(imageField).width(width).auto("format").quality(80).url();
}

/** In-frame image/video parallax — fraction of the full panel delta. */
const MEDIA_PARALLAX_SCALE = 0.4;

function getParallaxOffset(
  panel: HTMLElement,
  container: HTMLElement,
  parallaxFactor: number,
  scale = 1,
): number {
  const naturalLeft = panel.offsetLeft;
  const scrollLeft = container.scrollLeft;
  return -(parallaxFactor - 1) * scale * (scrollLeft - naturalLeft);
}

/** Extra width on each side — must cover max in-frame parallax travel while on screen. */
function getMediaBleedPx(
  containerWidth: number,
  panelWidth: number,
  parallaxFactor: number,
): number {
  const strength = (parallaxFactor - 1) * MEDIA_PARALLAX_SCALE;
  // Entering from the right pushes the image right (positive offset) — needs left bleed.
  const maxDelta = containerWidth + panelWidth;
  return Math.ceil(strength * maxDelta + 24);
}

function clampMediaOffset(offset: number, bleed: number): number {
  return Math.max(-bleed, Math.min(bleed, offset));
}

/**
 * Narrow non-snap panel that sits to the left of a main section. Its
 * horizontal position is driven by a CSS transform that's updated on
 * every scroll event of the nearest ancestor marked with
 * `data-horizontal-scroll`. The transform makes the panel appear to
 * move faster than the main sections, giving a depth illusion.
 *
 * Image/video interstitials keep the frame fixed in layout and parallax
 * the media inside an overshoot-width layer so crop edges stay hidden.
 */
export default function Interstitial({
  data,
  parallaxFactor = 1.35,
  width = DEFAULT_WIDTH,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  const imageUrl = sanityImageUrl(data.image);
  const hasText = Boolean(data.text);
  const hasImage = Boolean(imageUrl);
  const hasVideo = Boolean(data.videoUrl);
  const fullBleedMedia = (hasImage || hasVideo) && !hasText;

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel || !fullBleedMedia) return;

    let container: HTMLElement | null = panel.parentElement;
    while (container && container.dataset.horizontalScroll !== "true") {
      container = container.parentElement;
    }
    if (!container) return;

    const media = mediaRef.current;
    if (!media) return;

    const bleed = getMediaBleedPx(
      container.clientWidth,
      panel.offsetWidth,
      parallaxFactor,
    );
    panel.style.setProperty("--interstitial-media-bleed", `${bleed}px`);

    const offset = clampMediaOffset(
      getParallaxOffset(panel, container, parallaxFactor, MEDIA_PARALLAX_SCALE),
      bleed,
    );
    media.style.transform = `translateX(calc(-50% + ${offset}px))`;
  }, [parallaxFactor, fullBleedMedia]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    let container: HTMLElement | null = panel.parentElement;
    while (container && container.dataset.horizontalScroll !== "true") {
      container = container.parentElement;
    }
    if (!container) return;

    const media = mediaRef.current;

    const update = () => {
      if (fullBleedMedia && media) {
        const bleed = getMediaBleedPx(
          container!.clientWidth,
          panel.offsetWidth,
          parallaxFactor,
        );
        panel.style.transform = "none";
        panel.style.setProperty("--interstitial-media-bleed", `${bleed}px`);
        const offset = clampMediaOffset(
          getParallaxOffset(panel, container!, parallaxFactor, MEDIA_PARALLAX_SCALE),
          bleed,
        );
        media.style.transform = `translateX(calc(-50% + ${offset}px))`;
        return;
      }

      const offset = getParallaxOffset(panel, container!, parallaxFactor);
      panel.style.transform = `translateX(${offset}px)`;
    };

    update();
    container.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      container!.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [parallaxFactor, fullBleedMedia]);

  return (
    <div
      ref={panelRef}
      data-interstitial="true"
      className="relative h-svh flex-shrink-0 overflow-hidden"
      style={{
        width,
        scrollSnapAlign: "none",
        background: data.backgroundColor ?? "transparent",
        willChange: fullBleedMedia ? undefined : "transform",
      }}
      aria-hidden={fullBleedMedia ? "true" : undefined}
    >
      {fullBleedMedia ? (
        <div
          ref={mediaRef}
          className="absolute top-0 bottom-0"
          style={{
            left: "50%",
            width: "calc(100% + 2 * var(--interstitial-media-bleed, 20vw))",
            height: "100%",
            willChange: "transform",
          }}
        >
          {hasVideo ? (
            <video
              src={data.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : hasImage && imageUrl ? (
            <Image
              src={imageUrl}
              alt={data.image?.alt ?? ""}
              fill
              className="object-cover"
              sizes="30vw"
            />
          ) : null}
        </div>
      ) : null}

      {!fullBleedMedia && (hasText || hasImage || hasVideo) ? (
        <div
          className="flex h-full flex-col items-start justify-center"
          style={{ padding: `clamp(3rem, 6vh, 6rem) ${INNER_PADDING_X}` }}
        >
          {hasVideo ? (
            <video
              src={data.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="max-h-full w-full object-contain"
            />
          ) : hasImage && imageUrl ? (
            <div className="relative h-full min-h-0 w-full flex-1">
              <Image
                src={imageUrl}
                alt={data.image?.alt ?? ""}
                fill
                className="object-cover"
                sizes="30vw"
              />
            </div>
          ) : hasText ? (
            <p
              className="font-[family-name:var(--font-manrope)] text-foreground/85 font-light leading-relaxed whitespace-pre-line"
              style={{ fontSize: "clamp(1rem, 1.5vw, 1.5rem)" }}
            >
              {data.text}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
