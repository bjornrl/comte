import SectionShell from "./SectionShell";
import TiltedHeading from "../TiltedHeading";

const BG = "#1F3A32";
const TILT_COLOR = "#FF5252";

// Hardcoded two-line tilted heading for motto. heroText from the CMS is
// ignored here — split on \n to override if/when the schema gains a multi-
// line field. Both lines render in the rotated block.
const LINES = ["Design to", "evolve"];

type Props = {
  // Kept in the props signature so HomePageClient keeps compiling; not used.
  heroText?: string;
};

export default function SectionMotto(_props: Props) {
  const lines = LINES;

  return (
    <SectionShell
      id="motto"
      bgColor={BG}
      // overflow: visible lets the tilted heading bleed LEFT into the home
      // panel (half of "Design to" sits over home's bg, half over motto's),
      // and TOP/BOTTOM beyond the viewport (clipped by the horizontal-scroll
      // wrapper's overflow-y-hidden).
      style={{ overflow: "visible" }}
    >
      {/* The motto-side dots are drawn by the home section's background
          network canvas, which spans 200vw into this panel's area. */}
      <TiltedHeading lines={lines} color={TILT_COLOR} parallaxFactor={0.18} />
    </SectionShell>
  );
}
