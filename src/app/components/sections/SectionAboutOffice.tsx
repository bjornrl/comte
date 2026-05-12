"use client";

import SectionShell from "./SectionShell";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";

const DEFAULT_BG = "#F9F9ED";

export type OfficeLocation = {
  title?: string;
  description?: string;
  longitude?: number;
  latitude?: number;
  zoom?: number;
};

type Props = {
  backgroundColor?: string;
  locations?: OfficeLocation[];
};

const DEFAULT_LOCATIONS: OfficeLocation[] = [
  { title: "Oslo", description: "", longitude: 10.736, latitude: 59.9202, zoom: 12 },
];

export default function SectionAboutOffice({ backgroundColor, locations }: Props) {
  const items = (locations && locations.length > 0 ? locations : DEFAULT_LOCATIONS).slice(0, 4);

  return (
    <SectionShell id="about-office" bgColor={backgroundColor ?? DEFAULT_BG}>
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
              <div className="relative isolate overflow-hidden rounded-lg">
                <Map center={[lng, lat]} zoom={zoom} className="comte-map h-full w-full rounded-lg">
                  <MapMarker longitude={lng} latitude={lat}>
                    <MarkerContent>
                      <div className="size-3 rounded-full bg-foreground border-2 border-background shadow" />
                    </MarkerContent>
                  </MapMarker>
                </Map>
              </div>

              {/* Title + description, right */}
              <div className="flex min-h-0 flex-col justify-start pt-2">
                <h3 className="mb-2 font-[family-name:var(--font-manrope)] text-2xl font-bold text-foreground">
                  {loc.title ?? `Office ${i + 1}`}
                </h3>
                {loc.description && (
                  <p className="text-foreground/80 font-[family-name:var(--font-manrope)] text-base font-light leading-relaxed whitespace-pre-line">
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
