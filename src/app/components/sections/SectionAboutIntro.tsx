"use client";

import Image from "next/image";
import SectionShell, {
  PANEL_PADDING,
  PROJECT_TILE_SECTION_TOP,
  SECTION_TITLE_SIZE,
  SECTION_TITLE_TO_BODY_GAP,
} from "./SectionShell";
import {
  SECTION_BODY_MAX_WIDTH,
  SectionBodyText,
} from "./sectionBodyText";
import SectionPanelHeading from "./SectionPanelHeading";

const BG = "#FFD2D2";
const TITLE = "#FF5252";
const BODY = "#1F3A32";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop";

/** Slight zoom so object-cover crops in tighter on intro video. */
const INTRO_VIDEO_SCALE = 1.1;

const MEDIA_COL = "40vw";
const TEXT_COL_PADDING_LEFT = "clamp(2.5rem, 5vw, 5rem)";
const TEXT_COL_PADDING_RIGHT = "clamp(1.5rem, 4vw, 4rem)";
/** Space between the two text blocks (Who is Comte / Who are we). */
const TEXT_BLOCK_GAP = "2rem";
const blockHeadingStyle = {
  fontFamily: "var(--font-manrope), system-ui, sans-serif",
  fontWeight: 500,
  fontSize: SECTION_TITLE_SIZE,
  lineHeight: 1.1,
  margin: 0,
  marginBottom: SECTION_TITLE_TO_BODY_GAP,
} as const;

type Props = {
  heading?: string;
  videoUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
  whoIsComteTitle?: string;
  whoIsComte?: string;
  whoAreWeTitle?: string;
  whoAreWe?: string;
};

export default function SectionAboutIntro({
  heading,
  videoUrl,
  imageUrl,
  imageAlt,
  whoIsComteTitle,
  whoIsComte,
  whoAreWeTitle,
  whoAreWe,
}: Props) {
  return (
    <SectionShell id="about-intro" bgColor={BG} style={{ padding: 0, color: BODY }}>
      <div
        data-snap-anchor=""
        aria-hidden="true"
        style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0 }}
      />

      <div
        className="grid h-full w-full"
        style={{ gridTemplateColumns: `${MEDIA_COL} minmax(0, 1fr)` }}
      >
        <div className="relative h-full overflow-hidden">
          {videoUrl ? (
            <video
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover object-center"
              style={{
                transform: `scale(${INTRO_VIDEO_SCALE})`,
                transformOrigin: "center center",
              }}
              aria-label={imageAlt || "Intro section video"}
            />
          ) : (
            <Image
              src={imageUrl ?? PLACEHOLDER_IMAGE}
              alt={imageAlt ?? ""}
              fill
              className="object-cover object-center"
              sizes="40vw"
              priority
            />
          )}
        </div>

        <div
          className="grid h-full min-w-0"
          style={{
            gridTemplateRows: heading ? "auto 1fr" : "1fr",
            paddingRight: TEXT_COL_PADDING_RIGHT,
            paddingBottom: PANEL_PADDING,
            paddingLeft: TEXT_COL_PADDING_LEFT,
          }}
        >
          {heading ? (
            <div
              className="w-full min-w-0"
              style={{
                paddingTop: PROJECT_TILE_SECTION_TOP,
                maxWidth: SECTION_BODY_MAX_WIDTH,
              }}
            >
              <SectionPanelHeading snapId="about-intro" color={TITLE} maxWidth="100%">
                {heading}
              </SectionPanelHeading>
            </div>
          ) : null}

          <div className="flex min-h-0 flex-col justify-center">
            <div
              className="flex w-full min-w-0 flex-col"
              style={{ gap: TEXT_BLOCK_GAP, maxWidth: SECTION_BODY_MAX_WIDTH }}
            >
              {(whoIsComteTitle || whoIsComte) && (
                <div className="w-full min-w-0">
                  <h3
                    className="font-[family-name:var(--font-manrope)] leading-tight"
                    style={{ ...blockHeadingStyle, color: TITLE }}
                  >
                    {whoIsComteTitle ?? "Who is Comte"}
                  </h3>
                  {whoIsComte && <SectionBodyText text={whoIsComte} color={BODY} />}
                </div>
              )}

              {(whoAreWeTitle || whoAreWe) && (
                <div className="w-full min-w-0">
                  <h3
                    className="font-[family-name:var(--font-manrope)] leading-tight"
                    style={{ ...blockHeadingStyle, color: TITLE }}
                  >
                    {whoAreWeTitle ?? "Who are we"}
                  </h3>
                  {whoAreWe && <SectionBodyText text={whoAreWe} color={BODY} />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
