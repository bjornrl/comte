"use client";

import { useEffect, useRef } from "react";
import SectionShell from "./SectionShell";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";

const BG = "#F5F5E9";
const FG = "#1F3A32";

// Subtle parallax factor for the office maps. The inner map content shifts
// at this fraction of the scroll delta (relative to the map's own natural
// position), so the map looks like it's gliding slightly while the section
// scrolls past. Mirrors the interstitial parallax but at a much smaller
// magnitude so the marker stays close to its anchor.
const MAP_PARALLAX = 0.18;

export type OfficeLocation = {
  title?: string;
  description?: string;
  longitude?: number;
  latitude?: number;
  zoom?: number;
};

type Props = {
  locations?: OfficeLocation[];
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

    const update = () => {
      // Natural document position: where the map sits when scrollLeft equals
      // the map's offsetLeft (i.e. the map is flush against the viewport's
      // left edge). At that moment, transform is 0 — the inner map is
      // centred inside the (overflow:hidden) frame.
      const naturalLeft = wrap.offsetLeft;
      const scrollLeft = scroller!.scrollLeft;
      const offset = -MAP_PARALLAX * (scrollLeft - naturalLeft);
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
      className="relative isolate h-full w-full overflow-hidden rounded-lg"
      // Block all pointer interaction. Map drags, scroll-zoom, marker hover,
      // etc. simply cannot fire when the container ignores pointer events.
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      <div
        ref={innerRef}
        // Inner extends 15% past each side so the parallax translate has
        // room to slide without exposing the background.
        className="absolute"
        style={{
          top: 0,
          bottom: 0,
          left: "-15%",
          right: "-15%",
          willChange: "transform",
        }}
      >
        <Map
          center={[longitude, latitude]}
          zoom={zoom}
          // Disable every map interaction (drag, zoom, rotate, keyboard, etc.)
          interactive={false}
          // No "improve this map" link / attribution dropdown to click.
          attributionControl={false}
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

export default function SectionAboutOffice({ locations }: Props) {
  const items = (locations && locations.length > 0 ? locations : DEFAULT_LOCATIONS).slice(0, 4);

  return (
    <SectionShell id="about-office" bgColor={BG} style={{ color: FG }}>
      <div className="flex h-full flex-col gap-6">
        {items.map((loc, i) => {
          const lng = loc.longitude ?? 10.736;
          const lat = loc.latitude ?? 59.9202;
          const zoom = loc.zoom ?? 12;
          return (
            <div
              key={`${loc.title ?? "office"}-${i}`}
              className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[2fr_3fr]"
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
    </SectionShell>
  );
}
