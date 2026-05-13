import SectionShell from "./SectionShell";
import TiltedHeading from "../TiltedHeading";

const BG = "#F5F5E9";
const FG = "#FF5252";

// Two-line tilted heading at the section's left edge. First line gets
// bisected by the office/what-we-do boundary, second line lives entirely on
// the what-we-do side — same pattern as motto's "Design to / evolve".
const TILT_LINES = ["What do", "we do?"];

type Datapoint = { value?: string; label?: string } | null | undefined;

function DatapointCard({ data, accent }: { data: Datapoint; accent: string }) {
  if (!data?.value && !data?.label) return null;
  return (
    <div
      className="flex h-full min-h-[160px] flex-col justify-between p-6"
      style={{ background: accent, color: "var(--comte-cream)" }}
    >
      <span className="font-[family-name:var(--font-manrope)] text-5xl font-bold leading-none">
        {data.value}
      </span>
      <span className="font-[family-name:var(--font-manrope)] text-sm font-light leading-snug">
        {data.label}
      </span>
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
  datapoint3,
}: Props) {
  // Datapoint card backgrounds stay on the brand palette; only the main textbox
  // adopts the section's FG colour.
  const accents = ["#1F3A32", "#F27887", "#5F7C8A"];
  const datapoints = [datapoint1, datapoint2, datapoint3];

  return (
    <SectionShell
      id="what-we-do"
      bgColor={BG}
      // overflow: visible so the tilted heading can bleed LEFT into the
      // office panel (where it gets bisected by the section boundary).
      style={{ color: FG, overflow: "visible" }}
    >
      <TiltedHeading lines={TILT_LINES} color={FG} parallaxFactor={0.18} />
      <div className="flex h-full flex-col">
        {textbox && (
          <p
            className="max-w-[40ch] font-[family-name:var(--font-manrope)] font-light whitespace-pre-line"
            style={{
              fontSize: "clamp(1.25rem, 2vw, 1.75rem)",
              lineHeight: 1.4,
              color: FG,
            }}
          >
            {textbox}
          </p>
        )}
        <div className="mt-auto grid grid-cols-1 gap-3 md:grid-cols-3">
          {datapoints.map((d, i) => (
            <DatapointCard key={i} data={d} accent={accents[i]} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
