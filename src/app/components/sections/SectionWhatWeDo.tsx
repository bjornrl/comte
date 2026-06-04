"use client";

import SectionShell, {
  PANEL_PADDING,
  PROJECT_CONTENT_TOP_BELOW_PANEL_TITLE,
  PROJECT_TILE_SECTION_TOP,
} from "./SectionShell";
import {
  SECTION_TEXT_COLUMN_MARGIN_LEFT,
  WHAT_WE_DO_BODY_MAX_WIDTH,
  SectionBodyText,
} from "./sectionBodyText";
import SectionPanelHeading from "./SectionPanelHeading";

const WHAT_WE_DO_HEADING = "What do we do?";

const BG = "#F5F5E9";
const FG = "#FF5252";
const DARK_GREEN = "#1F3A32";
const BEIGE = "#F5F5E9";

const BLOB_INSET_RIGHT = "clamp(3rem, 8vw, 12rem)";
const BLOB_LAYOUT_SCALE = 0.75;
const SMALL_BLOB_DIAMETER = "clamp(7.5rem, 10.5vw, 10.5rem)";
const LARGE_BLOB_DIAMETER = "clamp(12rem, 18vw, 18rem)";
const SMALL_ON_LARGE_RIGHT = "0";
const SMALL_ON_LARGE_TOP = "clamp(-5.25rem, -9.5vw, -4.5rem)";
const SMALL_ON_LARGE_NUDGE_X = "clamp(0.35rem, 1vw, 0.75rem)";
const SMALL_ON_LARGE_NUDGE_Y = "clamp(-0.35rem, -0.75vw, -0.5rem)";

type Datapoint = { value?: string; label?: string } | null | undefined;

function DatapointCircle({
  data,
  variant,
}: {
  data: Datapoint;
  variant: "small-filled" | "large-outlined";
}) {
  if (!data?.value && !data?.label) return null;
  const isSmall = variant === "small-filled";
  const diameter = isSmall ? SMALL_BLOB_DIAMETER : LARGE_BLOB_DIAMETER;
  const fill = isSmall ? FG : "transparent";
  const stroke = isSmall ? "transparent" : DARK_GREEN;
  const textColor = isSmall ? BEIGE : DARK_GREEN;
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{
        width: diameter,
        height: diameter,
        borderRadius: "9999px",
        background: fill,
        border: `2px solid ${stroke}`,
        color: textColor,
        fontFamily: "var(--font-roboto), system-ui, sans-serif",
        flexShrink: 0,
      }}
    >
      <span
        className="font-bold leading-none"
        style={{
          fontFamily: "var(--font-roboto), system-ui, sans-serif",
          fontSize: isSmall
            ? `clamp(${2.75 * BLOB_LAYOUT_SCALE}rem, ${4.5 * BLOB_LAYOUT_SCALE}vw, ${3.5 * BLOB_LAYOUT_SCALE}rem)`
            : `clamp(${4.25 * BLOB_LAYOUT_SCALE}rem, ${6 * BLOB_LAYOUT_SCALE}vw, ${5.5 * BLOB_LAYOUT_SCALE}rem)`,
        }}
      >
        {data.value}
      </span>
      {data.label ? (
        <span
          className="mt-2 px-4 font-medium leading-tight"
          style={{
            fontFamily: "var(--font-roboto), system-ui, sans-serif",
            fontSize: isSmall ? "0.9375rem" : "1.0625rem",
            maxWidth: "90%",
          }}
        >
          {data.label}
        </span>
      ) : null}
    </div>
  );
}

type Props = {
  textbox?: string;
  datapoint1?: Datapoint;
  datapoint2?: Datapoint;
  datapoint3?: Datapoint;
};

export default function SectionWhatWeDo({
  textbox,
  datapoint1,
  datapoint2,
}: Props) {
  return (
    <SectionShell
      id="what-we-do"
      bgColor={BG}
      style={{ color: FG, padding: 0, overflow: "hidden" }}
    >
      <div
        className="relative h-full"
        style={{ paddingLeft: PANEL_PADDING, paddingRight: PANEL_PADDING }}
      >
        {/* Text column — title + body share the same left edge. */}
        <div
          className="relative min-w-0"
          style={{
            maxWidth: WHAT_WE_DO_BODY_MAX_WIDTH,
            marginLeft: SECTION_TEXT_COLUMN_MARGIN_LEFT,
          }}
        >
          <div
            className="absolute left-0 right-0 max-w-full"
            style={{
              top: PROJECT_TILE_SECTION_TOP,
              zIndex: 10,
            }}
          >
            <SectionPanelHeading snapId="what-we-do" color={FG}>
              {WHAT_WE_DO_HEADING}
            </SectionPanelHeading>
          </div>

          {textbox ? (
            <div
              className="w-full min-w-0"
              style={{ paddingTop: PROJECT_CONTENT_TOP_BELOW_PANEL_TITLE }}
            >
              <SectionBodyText text={textbox} color={FG} />
            </div>
          ) : null}
        </div>

        <div
          className="absolute"
          style={{
            right: BLOB_INSET_RIGHT,
            bottom: PANEL_PADDING,
          }}
        >
          <div className="relative inline-block">
            <DatapointCircle data={datapoint2} variant="large-outlined" />
            <div
              style={{
                position: "absolute",
                right: SMALL_ON_LARGE_RIGHT,
                top: SMALL_ON_LARGE_TOP,
                transform: `translate(${SMALL_ON_LARGE_NUDGE_X}, ${SMALL_ON_LARGE_NUDGE_Y})`,
              }}
            >
              <DatapointCircle data={datapoint1} variant="small-filled" />
            </div>
          </div>
        </div>
      </div>

    </SectionShell>
  );
}
