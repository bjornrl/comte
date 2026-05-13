"use client";

import { useEffect, useRef } from "react";
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
};

const WIDTH = "70vw";
// Inner content padding leaves "leeway" so the parallax transform doesn't
// clip the text/image at the panel edges.
const INNER_PADDING_X = "clamp(2rem, 8vw, 6rem)";

function sanityImageUrl(imageField: any, width = 1600): string | null {
  if (!imageField?.asset) return null;
  return urlFor(imageField).width(width).auto("format").quality(80).url();
}

/**
 * Narrow non-snap panel that sits to the left of a main section. Its
 * horizontal position is driven by a CSS transform that's updated on
 * every scroll event of the nearest ancestor marked with
 * `data-horizontal-scroll`. The transform makes the panel appear to
 * move faster than the main sections, giving a depth illusion.
 */
export default function Interstitial({ data, parallaxFactor = 1.35 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Walk up to find the horizontal scroll container.
    let container: HTMLElement | null = el.parentElement;
    while (container && container.dataset.horizontalScroll !== "true") {
      container = container.parentElement;
    }
    if (!container) return;

    const update = () => {
      const naturalLeft = el.offsetLeft;
      const scrollLeft = container!.scrollLeft;
      const offset = -(parallaxFactor - 1) * (scrollLeft - naturalLeft);
      el.style.transform = `translateX(${offset}px)`;
    };

    update();
    container.addEventListener("scroll", update, { passive: true });
    // Re-measure on resize since offsetLeft can change with viewport width.
    const onResize = () => update();
    window.addEventListener("resize", onResize);
    return () => {
      container!.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
    };
  }, [parallaxFactor]);

  const imageUrl = sanityImageUrl(data.image);
  const hasContent = !!(data.text || imageUrl || data.videoUrl);

  return (
    <div
      ref={ref}
      data-interstitial="true"
      className="relative h-svh flex-shrink-0 overflow-hidden"
      style={{
        width: WIDTH,
        scrollSnapAlign: "none",
        background: data.backgroundColor ?? "transparent",
        willChange: "transform",
      }}
      aria-hidden="true"
    >
      {hasContent && (
        <div
          className="flex h-full flex-col items-start justify-center"
          style={{ padding: `clamp(3rem, 6vh, 6rem) ${INNER_PADDING_X}` }}
        >
          {data.videoUrl ? (
            <video
              src={data.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="max-h-full w-full object-contain"
            />
          ) : imageUrl ? (
            <div className="relative w-full" style={{ maxHeight: "70vh", aspectRatio: "4 / 3" }}>
              <Image
                src={imageUrl}
                alt={data.image?.alt ?? ""}
                fill
                className="object-contain"
                sizes="50vw"
              />
            </div>
          ) : data.text ? (
            <p
              className="font-[family-name:var(--font-manrope)] text-foreground/85 font-light leading-relaxed whitespace-pre-line"
              style={{ fontSize: "clamp(1rem, 1.5vw, 1.5rem)" }}
            >
              {data.text}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
