import Image from "next/image";
import SectionShell, { CONTENT_TOP, PANEL_PADDING } from "./SectionShell";
// The logo uses a plain <img> instead of next/image because next/image
// applies a `max-width: 100%` style that clamps the rendered size to the
// parent, defeating the rotated-and-oversized layout we want here.

const BG = "#FFD2D2";
const TITLE = "#FF5252";
const BODY = "#1F3A32";
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
const LOGO_SCALE = 1;

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
    <SectionShell id="about-intro" bgColor={BG} style={{ padding: 0, color: BODY }}>
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
            src="/logo-light.svg"
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

        {/* Image — 40vw wide. The image is bottom-anchored to the column
            (flex items-end) instead of using `fill + object-cover`, so the
            asset's BOTTOM edge always lands at the page bottom regardless
            of the image's intrinsic aspect. If the asset is taller than the
            column it crops at the top; shorter, you'll see a strip of the
            section's pink bg above. */}
        <div className="relative h-full overflow-hidden flex items-end">
          <Image
            src={imageUrl ?? PLACEHOLDER_IMAGE}
            alt={imageAlt ?? ""}
            width={500}
            height={750}
            className="w-full h-auto block"
            sizes="40vw"
            priority
            // 1.19× scale from the bottom-centre pivot — the asset visually
            // grows 19% (cropped at the top + sides via overflow-hidden)
            // while its bottom edge stays anchored to the column bottom.
            style={{ transform: "scale(1.19)", transformOrigin: "bottom center" }}
          />
        </div>

        {/* Two text blocks.
            Padding + gap-6 + flex-1 items mirror the office locations stack
            so the top of "Who is Comte" lines up with the top of office's
            first map, and "Who are we" lines up with the second map. */}
        <div
          className="flex h-full min-w-0 flex-col gap-6"
          style={{
            // Trim 1.5rem off CONTENT_TOP so the text rides a little higher.
            // Office's locations column uses the same offset so map tops
            // continue to align with text-block tops.
            paddingTop: `calc(${CONTENT_TOP} - 1.5rem)`,
            paddingRight: "clamp(1.5rem, 4vw, 4rem)",
            paddingBottom: PANEL_PADDING,
            // Wider left pad → more gap between text and the image column.
            paddingLeft: "clamp(2.5rem, 5vw, 5rem)",
          }}
        >
          {(whoIsComteTitle || whoIsComte) && (
            <div className="max-w-[33ch] flex-1">
              <h2
                className="mb-3 font-[family-name:var(--font-manrope)] text-4xl font-medium"
                style={{ color: TITLE }}
              >
                {whoIsComteTitle ?? "Who is Comte"}
              </h2>
              {whoIsComte && (
                <p
                  className="font-[family-name:var(--font-manrope)] text-base font-medium leading-tight whitespace-pre-line"
                  style={{ color: BODY }}
                >
                  {whoIsComte}
                </p>
              )}
            </div>
          )}

          {(whoAreWeTitle || whoAreWe) && (
            <div className="max-w-[33ch] flex-1">
              <h2
                className="mb-3 font-[family-name:var(--font-manrope)] text-4xl font-medium"
                style={{ color: TITLE }}
              >
                {whoAreWeTitle ?? "Who are we"}
              </h2>
              {whoAreWe && (
                <p
                  className="font-[family-name:var(--font-manrope)] text-base font-medium leading-tight whitespace-pre-line"
                  style={{ color: BODY }}
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
