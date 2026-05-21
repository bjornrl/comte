"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import SectionShell, { CONTENT_TOP, PANEL_PADDING } from "./SectionShell";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";

const BG = "#F5F5E9";
const FG = "#1F3A32";
// The intro section's pink continues into the left of office, covering a bit
// over half of the maps' visible width. With maps at ~40vw in office's
// [2fr_3fr] grid, "a bit over half" lands around 22vw of pink.
const INTRO_PINK = "#FFD2D2";
const PINK_EXTENSION = "22vw";
// Office snaps slightly to the LEFT of its natural panel start, so part of
// intro's pink right edge stays visible at office snap (the "right snap"
// off-kilter position).
const SNAP_PULLBACK = "15vw";

// Subtle parallax factor for the office maps. The inner map content shifts
// at this fraction of the scroll delta past the section's snap point, so the
// inside of the map glides left while the frame itself stays put.
const MAP_PARALLAX = 0.18;
// Inner is wider than the wrap by INNER_OVERHANG on each side (as a fraction
// of wrap width). Parallax shifts the inner up to this much before it would
// expose the wrap's edges, so the offset is clamped to ±INNER_OVERHANG × wrap.
const INNER_OVERHANG = 0.15;

// Width of the optional right-side media column (image or video). Mirrors
// the intro section's 40vw image, but a touch narrower so the office
// locations have breathing room on the left.
const MEDIA_WIDTH = "30vw";

export type OfficeLocation = {
  title?: string;
  description?: string;
  longitude?: number;
  latitude?: number;
  zoom?: number;
};

type Props = {
  locations?: OfficeLocation[];
  mediaImageUrl?: string;
  mediaImageAlt?: string;
  mediaVideoUrl?: string;
};

const DEFAULT_LOCATIONS: OfficeLocation[] = [
  { title: "Oslo", description: "", longitude: 10.736, latitude: 59.9202, zoom: 12 },
];

/**
 * Shared inner-parallax effect. The `inner` element shifts horizontally as the
 * horizontal-scroll container moves, at MAP_PARALLAX× the scroll delta past
 * the section's snap point. Clamped to ±INNER_OVERHANG × wrap.clientWidth so
 * the inner's edges never expose the wrap's underlying background.
 *
 * Requirements:
 * - `inner` must be wider than `wrap` by ≥ 2× INNER_OVERHANG (typical: width
 *   130% + marginLeft -15%).
 * - `wrap` must have `overflow: hidden` to clip the inner.
 * - The closest ancestor with `data-snap-id` is treated as the panel; an
 *   optional `[data-snap-anchor]` descendant of the panel overrides the
 *   reference point for the snap calculation (so off-kilter snaps are
 *   respected).
 */
function useInnerParallax(
  wrapRef: React.RefObject<HTMLElement | null>,
  innerRef: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    // Walk up to find the horizontal scroll container.
    let scroller: HTMLElement | null = wrap.parentElement;
    while (scroller && scroller.dataset.horizontalScroll !== "true") {
      scroller = scroller.parentElement;
    }
    if (!scroller) return;

    // Snap reference: the panel's data-snap-anchor if present, else the
    // panel itself. Anchor's distance from the scroller's left edge equals
    // how far we've scrolled past this section's snap point.
    let panel: HTMLElement | null = wrap.parentElement;
    while (panel && !panel.dataset.snapId) panel = panel.parentElement;
    const reference: HTMLElement =
      panel?.querySelector<HTMLElement>("[data-snap-anchor]") ?? panel ?? wrap;

    const update = () => {
      const refRect = reference.getBoundingClientRect();
      const scrollerRect = scroller!.getBoundingClientRect();
      // scrollDelta: how far past the section's snap point we've scrolled.
      // = 0 at snap; positive when scrolling forward, negative when before.
      const scrollDelta = scrollerRect.left - refRect.left;
      // Clamp to the inner's overhang so a hard scroll can never shift the
      // inner far enough to expose the section background through the wrap.
      const slack = INNER_OVERHANG * wrap.clientWidth;
      const raw = -MAP_PARALLAX * scrollDelta;
      const offset = Math.max(-slack, Math.min(slack, raw));
      inner.style.transform = `translate3d(${offset}px, 0, 0)`;
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scroller!.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [wrapRef, innerRef]);
}

/**
 * A non-interactive map with a subtle scroll-driven parallax shift. The map
 * is intentionally larger than its container and clipped, so when the inner
 * element translates the user sees different parts of the map without any
 * black edges. The map is fully passive — no pan, zoom or click interaction.
 */
function ParallaxMap({
  longitude,
  latitude,
  zoom,
}: {
  longitude: number;
  latitude: number;
  zoom: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useInnerParallax(wrapRef, innerRef);

  return (
    <div
      ref={wrapRef}
      className="relative isolate h-full w-full overflow-hidden"
      // Block all pointer interaction. Map drags, scroll-zoom, marker hover,
      // etc. simply cannot fire when the container ignores pointer events.
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      {/*
       * Plain block-flow wrapper sized 130% wide and pulled 15% to the left.
       * MapLibre measures clientWidth/clientHeight of the Map's container
       * once on mount; absolute-positioned ancestors with negative left/right
       * computed widths can race with that measurement and leave the canvas
       * at 0×0. Sticking to width + margin avoids the issue while preserving
       * the "wider than the frame, clipped by overflow-hidden" effect.
       */}
      <div
        ref={innerRef}
        className="h-full"
        style={{
          width: "130%",
          marginLeft: "-15%",
          willChange: "transform",
        }}
      >
        <Map
          center={[longitude, latitude]}
          zoom={zoom}
          // Disable every map interaction (drag, zoom, rotate, keyboard, etc.)
          interactive={false}
          className="comte-map h-full w-full"
        >
          <MapMarker longitude={longitude} latitude={latitude}>
            <MarkerContent>
              <div className="size-3 rounded-full bg-foreground border-2 border-background shadow" />
            </MarkerContent>
          </MapMarker>
        </Map>
      </div>
    </div>
  );
}

/**
 * The right-side image or video with the same inner-parallax shift as
 * ParallaxMap. The media is rendered into an inner element that's 130% wide
 * with -15% left margin so it overhangs the visible wrap by 15% on each side;
 * the parallax shift pulls the inner left/right within that slack as the user
 * scrolls past the section's snap point. Video wins if both are provided.
 */
function ParallaxMedia({
  imageUrl,
  imageAlt,
  videoUrl,
}: {
  imageUrl?: string;
  imageAlt?: string;
  videoUrl?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useInnerParallax(wrapRef, innerRef);

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden"
    >
      <div
        ref={innerRef}
        className="relative h-full"
        style={{
          width: "130%",
          marginLeft: "-15%",
          willChange: "transform",
        }}
      >
        {videoUrl ? (
          <video
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? ""}
            fill
            className="object-cover"
            // Inner is 130% of the 30vw frame → source area is ~39vw wide.
            sizes="39vw"
          />
        ) : null}
      </div>
    </div>
  );
}

export default function SectionAboutOffice({
  locations,
  mediaImageUrl,
  mediaImageAlt,
  mediaVideoUrl,
}: Props) {
  const items = (locations && locations.length > 0 ? locations : DEFAULT_LOCATIONS).slice(0, 4);
  const hasMedia = !!(mediaVideoUrl || mediaImageUrl);

  return (
    <SectionShell
      id="about-office"
      bgColor={BG}
      style={{
        color: FG,
        // One continuous pink block on the left of the section, full height,
        // with cream taking over before the map's right edge (the maps
        // intentionally extend past the pink). The 22% stop is a touch
        // before where each map ends (map cell ~27% of section width × 95%
        // map fill ≈ 25.7%, so 22% leaves ~3.7% of section for cream-behind-
        // map breathing room before the map's right edge).
        background: `linear-gradient(to right, ${INTRO_PINK} 0, ${INTRO_PINK} 22%, ${BG} 22%, ${BG} 100%)`,
        // Layout: 52vw locations + 30vw image = 82vw panel.
        padding: 0,
        paddingRight: 0,
        // overflow: visible so each map cell's negative left margin can bleed
        // a sliver of the map off-screen to the left at office snap.
        overflow: "visible",
      }}
    >
      {/* No snap anchor — office snaps flush at its panel offset so the
          left edge of the panel lines up exactly with intro's right edge. */}
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: hasMedia ? `1fr ${MEDIA_WIDTH}` : "1fr",
        }}
      >
        {/* Locations column — re-applies SectionShell's padding internally. */}
        <div
          className="flex min-w-0 flex-col gap-6"
          style={{
            // Matches the intro text column's lifted top so map tops stay
            // aligned with the intro's "Who is Comte" / "Who are we" tops.
            paddingTop: `calc(${CONTENT_TOP} - 1.5rem)`,
            paddingRight: PANEL_PADDING,
            paddingBottom: PANEL_PADDING,
            paddingLeft: 0,
          }}
        >
          {items.map((loc, i) => {
            const lng = loc.longitude ?? 10.736;
            const lat = loc.latitude ?? 59.9202;
            const zoom = loc.zoom ?? 12;
            return (
              <div
                key={`${loc.title ?? "office"}-${i}`}
                // `flex-1 min-h-0` gives the grid a definite height inside the
                // column-flex parent, but without an explicit row template the
                // single grid row sizes to its content (the heading + paragraph),
                // collapsing the map cell to ~30–90px. `grid-rows-1` (single
                // row, 1fr) forces the row to fill the container so the map
                // cell stretches to the full available height on md+.
                className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[200px_1fr] gap-4 md:grid-cols-[3fr_2fr] md:grid-rows-1"
              >
                {/* Map cell: transparent (the section-level pink gradient
                    sits behind). Both maps anchor top-left so the title in
                    the adjacent text column lines up with the top of the
                    map. Negative left margin lets the map's left bleed
                    past the section/intro boundary at office snap. */}
                <div
                  className="relative h-full"
                  style={{ marginLeft: "-5vw" }}
                >
                  <div
                    className="absolute top-0 left-0 overflow-hidden"
                    style={{ width: "95%", height: "82%" }}
                  >
                    <ParallaxMap longitude={lng} latitude={lat} zoom={zoom} />
                  </div>
                </div>

                {/* Title + description, right */}
                <div className="flex min-h-0 flex-col justify-start pt-2">
                  <h3 className="mb-2 font-[family-name:var(--font-manrope)] text-4xl font-bold">
                    {loc.title ?? `Office ${i + 1}`}
                  </h3>
                  {loc.description && (
                    <p
                      className="font-[family-name:var(--font-manrope)] text-base font-light leading-relaxed whitespace-pre-line"
                      style={{ color: FG, opacity: 0.85 }}
                    >
                      {loc.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right-side media — flush with the section's right edge. Same
            inner-parallax shift as the maps so the image/video glides in
            sync with them as the user scrolls past the snap point. */}
        {hasMedia && (
          <ParallaxMedia
            imageUrl={mediaImageUrl}
            imageAlt={mediaImageAlt}
            videoUrl={mediaVideoUrl}
          />
        )}
      </div>
    </SectionShell>
  );
}
