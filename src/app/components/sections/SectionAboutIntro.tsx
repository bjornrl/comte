import Image from "next/image";
import SectionShell from "./SectionShell";
// The logo uses a plain <img> instead of next/image because next/image
// applies a `max-width: 100%` style that clamps the rendered size to the
// parent, defeating the rotated-and-oversized layout we want here.

const BG = "#EE7883";
const FG = "#F5F5E9";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop";

// Logo SVG viewBox is 247×71. Rotated 90°CCW, its width / height = 71/247.
const LOGO_ASPECT = 71 / 247;

// LOGO_SCALE > 1 oversizes the SVG so the artwork (which has whitespace
// around it inside the SVG's own viewBox) reaches the column's top and
// bottom edges. ~1.23 puts the "comte" letters flush against the top of
// the page and the dot flush against the bottom — that's the maximum
// scale before the artwork starts falling off-screen on both ends and
// the visible portion becomes the SVG's empty middle. The pink box
// overshoots both edges and is clipped by overflow-hidden; the section
// background is the same pink so nothing visible is lost.
const LOGO_SCALE = 2;

type Props = {
  imageUrl?: string;
  imageAlt?: string;
  whoIsComteTitle?: string;
  whoIsComte?: string;
  whoAreWeTitle?: string;
  whoAreWe?: string;
};

export default function SectionAboutIntro({
  imageUrl,
  imageAlt,
  whoIsComteTitle,
  whoIsComte,
  whoAreWeTitle,
  whoAreWe,
}: Props) {
  return (
    <SectionShell id="about-intro" bgColor={BG} style={{ padding: 0, color: FG }}>
      {/*
       * Three-column layout:
       *   1. Comte logo, rotated 90°CCW, full height, no margin to section
       *   2. Image (40vw, narrower than before)
       *   3. Two text blocks (the remaining width)
       */}
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `calc(100svh * ${LOGO_ASPECT}) 40vw 1fr`,
        }}
      >
        {/* Rotated Comte logo — anchors the snap at its horizontal middle */}
        <div className="relative h-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-pink.svg"
            alt=""
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              // Pre-rotation: width ≈ panel height × LOGO_SCALE so the rotated
              // logo can overshoot the panel top/bottom and the visible
              // artwork inside the SVG reaches the page edges.
              width: `calc(100svh * ${LOGO_SCALE})`,
              height: `calc(100svh * ${LOGO_ASPECT} * ${LOGO_SCALE})`,
              maxWidth: "none",
              maxHeight: "none",
              transformOrigin: "center center",
              transform: "translate(-50%, -50%) rotate(-90deg)",
            }}
          />
          {/*
           * Snap anchor placed at the logo column's horizontal middle.
           * HorizontalScroll uses this element's position as the intro snap
           * target, so the viewport's left edge lands exactly at the middle
           * of the rotated logo when intro is snapped.
           */}
          <div
            data-snap-anchor=""
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: 0,
              height: 0,
            }}
          />
        </div>

        {/* Image — now 40vw wide */}
        <div className="relative h-full overflow-hidden">
          <Image
            src={imageUrl ?? PLACEHOLDER_IMAGE}
            alt={imageAlt ?? ""}
            fill
            className="object-cover"
            sizes="40vw"
            priority
          />
        </div>

        {/* Two text blocks */}
        <div className="flex h-full flex-col justify-center gap-12 px-[clamp(1.5rem,4vw,4rem)] py-[clamp(2rem,5vw,5rem)]">
          {(whoIsComteTitle || whoIsComte) && (
            <div>
              <h2 className="mb-3 font-[family-name:var(--font-manrope)] text-2xl font-bold">
                {whoIsComteTitle ?? "Who is Comte"}
              </h2>
              {whoIsComte && (
                <p
                  className="font-[family-name:var(--font-manrope)] text-base font-light leading-relaxed whitespace-pre-line"
                  style={{ color: FG, opacity: 0.92 }}
                >
                  {whoIsComte}
                </p>
              )}
            </div>
          )}

          {(whoAreWeTitle || whoAreWe) && (
            <div>
              <h2 className="mb-3 font-[family-name:var(--font-manrope)] text-2xl font-bold">
                {whoAreWeTitle ?? "Who are we"}
              </h2>
              {whoAreWe && (
                <p
                  className="font-[family-name:var(--font-manrope)] text-base font-light leading-relaxed whitespace-pre-line"
                  style={{ color: FG, opacity: 0.92 }}
                >
                  {whoAreWe}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  );
}
