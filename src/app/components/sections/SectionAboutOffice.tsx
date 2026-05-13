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
const INTRO_PINK = "#EE7883";
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

    // Find the snap reference for this panel: the data-snap-anchor element
    // if present (so off-kilter snaps like office's -15vw pullback are
    // respected), otherwise the panel itself. The anchor's distance from the
    // scroller's left edge equals how far we've scrolled past this section's
    // snap point — which is the only signal parallax should react to.
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
  }, []);

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
        // Hard transition: intro's pink for the first PINK_EXTENSION, then BG.
        background: `linear-gradient(to right, ${INTRO_PINK} 0, ${INTRO_PINK} ${PINK_EXTENSION}, ${BG} ${PINK_EXTENSION}, ${BG} 100%)`,
        // Full-bleed left; padding is reapplied inside the locations column.
        // Right padding pushes the content (locations + media) back into the
        // first 94vw of section width, leaving the panel's extra 36vw on the
        // right as empty cream where the tilted "What do we do?" heading can
        // slide cleanly without overlapping the office image.
        // 36vw padding = 130vw panel − 94vw content area.
        padding: 0,
        paddingRight: "36vw",
      }}
    >
      {/*
       * Off-kilter snap anchor: viewport's left edge lands at -SNAP_PULLBACK
       * relative to the panel's natural offsetLeft, so a slice of intro's
       * right edge stays visible when this section is the active snap.
       */}
      <div
        data-snap-anchor=""
        aria-hidden="true"
        style={{
          position: "absolute",
          left: `calc(-1 * ${SNAP_PULLBACK})`,
          top: 0,
          width: 0,
          height: 0,
        }}
      />
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
            paddingTop: CONTENT_TOP,
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
                className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[200px_1fr] gap-4 md:grid-cols-[2fr_3fr] md:grid-rows-1"
              >
                {/* Map rectangle, left */}
                <ParallaxMap longitude={lng} latitude={lat} zoom={zoom} />

                {/* Title + description, right */}
                <div className="flex min-h-0 flex-col justify-start pt-2">
                  <h3 className="mb-2 font-[family-name:var(--font-manrope)] text-2xl font-bold">
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

        {/* Right-side media — flush with the section's right edge, video
            wins if both video and image are provided. */}
        {hasMedia && (
          <div className="relative h-full w-full overflow-hidden">
            {mediaVideoUrl ? (
              <video
                src={mediaVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : mediaImageUrl ? (
              <Image
                src={mediaImageUrl}
                alt={mediaImageAlt ?? ""}
                fill
                className="object-cover"
                sizes="30vw"
              />
            ) : null}
          </div>
        )}
      </div>
    </SectionShell>
  );
}
