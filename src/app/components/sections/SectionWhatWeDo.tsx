import SectionShell, { PROJECT_CARD_AREA_TOP, PANEL_PADDING } from "./SectionShell";
import TiltedHeading from "../TiltedHeading";
import { WHAT_WE_DO_BODY_MAX_WIDTH, SectionBodyText } from "./sectionBodyText";

const BG = "#F5F5E9";
const FG = "#FF5252";
// Dark green from the brand palette — used as the outlined-circle stroke
// and as the textbox + outline-circle text colour.
const DARK_GREEN = "#1F3A32";
// Off-white "beige" used for text on the filled red circle.
const BEIGE = "#F5F5E9";

// Two-line tilted heading at the section's left edge. First line gets
// bisected by the office/what-we-do boundary, second line lives entirely on
// the what-we-do side — same pattern as motto's "Design to / evolve".
const TILT_LINES = ["What do", "we do?"];

/** Scale factor for both datapoint blobs — keeps overlap + offset ratios intact. */
const BLOB_LAYOUT_SCALE = 0.75;
const SMALL_BLOB_DIAMETER = "clamp(7.5rem, 10.5vw, 10.5rem)";
const LARGE_BLOB_DIAMETER = "clamp(12rem, 18vw, 18rem)";
/** Small blob sits above the large one — scaled with BLOB_LAYOUT_SCALE. */
const SMALL_BLOB_LIFT = "clamp(-7.5rem, -10.5vw, -5.25rem)";
const SMALL_BLOB_SHIFT = "clamp(4rem, 8vw, 6.5rem)";
const LARGE_BLOB_SHIFT = "clamp(-0.75rem, -1.5vw, -1rem)";

type Datapoint = { value?: string; label?: string } | null | undefined;

/**
 * Two-circle datapoint row: a smaller filled red circle on the left and a
 * larger dark-green outlined circle on the right. Used to visualize the
 * first two datapoints of what-we-do. Datapoint #3 is ignored.
 */
function DatapointCircle({
  data,
  variant,
}: {
  data: Datapoint;
  variant: "small-filled" | "large-outlined";
}) {
  if (!data?.value && !data?.label) return null;
  const isSmall = variant === "small-filled";
  // Diameter scales with viewport but stays within the row band of the
  // section. Bigger circle is ~50% larger by diameter.
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
      // overflow: visible so the tilted heading can bleed LEFT into the
      // office panel (where it gets bisected by the section boundary).
      style={{ color: FG, overflow: "visible", padding: 0 }}
    >
      {/* The 0.2em offset (vs the default 0.5em) shifts the heading's visual
          centre toward the parent's left edge, so the office snap shows the
          line-break around the viewport's right edge instead of inside it,
          and at what-we-do snap the heading sits further left overall. */}
      <TiltedHeading
        lines={TILT_LINES}
        color={FG}
        parallaxFactor={0.18}
        leftOffsetEm={0.2}
      />
      {/* Content is pushed further right so the textbox + circles land well
          outside the viewport at the office snap — only the tilted heading
          peeks past office's right edge. At what-we-do's own snap the
          content sits in the right portion of the panel with the tilted
          heading anchoring the left. */}
      <div
        className="relative h-full"
        style={{ paddingLeft: "30vw" }}
      >
        {textbox && (
          <div
            className="w-full min-w-0"
            style={{
              maxWidth: WHAT_WE_DO_BODY_MAX_WIDTH,
              paddingTop: PROJECT_CARD_AREA_TOP,
            }}
          >
            <SectionBodyText text={textbox} color={FG} />
          </div>
        )}
        {/* Blob row — large circle bottom sits on the project section bottom margin. */}
        <div
          className="absolute flex w-full min-w-0 items-end justify-between"
          style={{
            bottom: PANEL_PADDING,
            maxWidth: WHAT_WE_DO_BODY_MAX_WIDTH,
          }}
        >
          <div
            style={{
              transform: `translate(${SMALL_BLOB_SHIFT}, ${SMALL_BLOB_LIFT})`,
            }}
          >
            <DatapointCircle data={datapoint1} variant="small-filled" />
          </div>
          <div style={{ transform: `translateX(${LARGE_BLOB_SHIFT})` }}>
            <DatapointCircle data={datapoint2} variant="large-outlined" />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
