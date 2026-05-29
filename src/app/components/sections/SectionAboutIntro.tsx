import Image from "next/image";
import SectionShell, { SECTION_TITLE_SIZE, PANEL_PADDING } from "./SectionShell";
import {
  SECTION_BODY_MAX_WIDTH,
  SectionBodyText,
} from "./sectionBodyText";
// The logo uses a plain <img> instead of next/image because next/image
// applies a `max-width: 100%` style that clamps the rendered size to the
// parent, defeating the rotated-and-oversized layout we want here.

const BG = "#FFD2D2";
const TITLE = "#FF5252";
const BODY = "#1F3A32";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop";

// Logo SVG viewBox is 247×71. Rotated 90°CCW, pre-rotation width = vertical span.
const LOGO_ASPECT = 71 / 247;

// Pre-rotation width equals viewport height so the rotated logo spans exactly
// from the window top to bottom (matches the h-svh snap panel).
const LOGO_VERTICAL_SPAN = "100svh";

// Text column width = 82% of space to the right of the image column.
const TEXT_COL_WIDTH = `calc((100% - 100svh * ${LOGO_ASPECT} - 40vw) * 0.92)`;
/** Space between the two text blocks (Who is Comte / Who are we). */
const TEXT_BLOCK_GAP = "2rem";

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
          gridTemplateColumns: `calc(100svh * ${LOGO_ASPECT}) 40vw ${TEXT_COL_WIDTH} 1fr`,
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
              // Pre-rotation width becomes vertical span after -90° rotation.
              width: LOGO_VERTICAL_SPAN,
              height: `calc(${LOGO_VERTICAL_SPAN} * ${LOGO_ASPECT})`,
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

        {/* Image — fills the column, centred and cropped. */}
        <div className="relative h-full overflow-hidden">
          <Image
            src={imageUrl ?? PLACEHOLDER_IMAGE}
            alt={imageAlt ?? ""}
            fill
            className="object-cover object-center"
            sizes="40vw"
            priority
          />
        </div>

        {/* Two text blocks — vertically centred in the column. */}
        <div
          className="flex h-full min-w-0 flex-col justify-center"
          style={{
            gap: TEXT_BLOCK_GAP,
            paddingTop: PANEL_PADDING,
            paddingRight: "clamp(1.5rem, 4vw, 4rem)",
            paddingBottom: PANEL_PADDING,
            // Wider left pad → more gap between text and the image column.
            paddingLeft: "clamp(2.5rem, 5vw, 5rem)",
          }}
        >
          {(whoIsComteTitle || whoIsComte) && (
            <div className="w-full" style={{ maxWidth: SECTION_BODY_MAX_WIDTH }}>
              <h2
                className="mb-3 font-[family-name:var(--font-manrope)] font-medium leading-tight"
                style={{ color: TITLE, fontSize: SECTION_TITLE_SIZE }}
              >
                {whoIsComteTitle ?? "Who is Comte"}
              </h2>
              {whoIsComte && <SectionBodyText text={whoIsComte} color={BODY} />}
            </div>
          )}

          {(whoAreWeTitle || whoAreWe) && (
            <div className="w-full" style={{ maxWidth: SECTION_BODY_MAX_WIDTH }}>
              <h2
                className="mb-3 font-[family-name:var(--font-manrope)] font-medium leading-tight"
                style={{ color: TITLE, fontSize: SECTION_TITLE_SIZE }}
              >
                {whoAreWeTitle ?? "Who are we"}
              </h2>
              {whoAreWe && <SectionBodyText text={whoAreWe} color={BODY} />}
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  );
}
