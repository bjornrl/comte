import SectionShell from "./SectionShell";
import TiltedHeading from "../TiltedHeading";

const BG = "#F5F5E9";
const FG = "#FF5252";
// Dark green from the brand palette — used as the outlined-circle stroke
// and as the textbox + outline-circle text colour.
const DARK_GREEN = "#1F3A32";
// Off-white "beige" used for text on the filled red circle.
const BEIGE = "#F5F5E9";
const LARGE_DATAPOINT_FILL = "#FBFF00";

// Two-line tilted heading at the section's left edge. First line gets
// bisected by the office/what-we-do boundary, second line lives entirely on
// the what-we-do side — same pattern as motto's "Design to / evolve".
const TILT_LINES = ["What do", "we do?"];

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
  const diameter = isSmall ? "clamp(9rem, 13vw, 13rem)" : "clamp(13rem, 19vw, 19rem)";
  const fill = isSmall ? FG : LARGE_DATAPOINT_FILL;
  const stroke = isSmall ? "transparent" : LARGE_DATAPOINT_FILL;
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
          fontSize: isSmall ? "clamp(2.5rem, 4vw, 3.25rem)" : "clamp(3.5rem, 5vw, 4.5rem)",
        }}
      >
        {data.value}
      </span>
      {data.label ? (
        <span
          className="mt-2 px-4 font-medium leading-tight"
          style={{
            fontFamily: "var(--font-roboto), system-ui, sans-serif",
            fontSize: isSmall ? "0.95rem" : "1.1rem",
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
      style={{ color: FG, overflow: "visible" }}
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
        className="flex h-full flex-col"
        style={{ paddingLeft: "30vw" }}
      >
        {textbox && (
          <p
            className="max-w-[28ch] font-[family-name:var(--font-manrope)] font-normal whitespace-pre-line"
            style={{
              fontSize: "clamp(1.25rem, 1.8vw, 1.6rem)",
              lineHeight: 1.2,
              color: FG,
            }}
          >
            {textbox}
          </p>
        )}
        {/* Two circles side-by-side under the textbox. Left = small filled
            red with beige text; right = larger dark-green outline only with
            dark-green text. */}
        <div className="mt-auto flex items-end gap-6">
          <DatapointCircle data={datapoint1} variant="small-filled" />
          <DatapointCircle data={datapoint2} variant="large-outlined" />
        </div>
      </div>
    </SectionShell>
  );
}
