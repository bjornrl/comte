import SectionShell from "./SectionShell";

const DEFAULT_BG = "#5A7482";

type Props = {
  backgroundColor?: string;
  /** When false, disable iframe pointer events while off-screen (animation keeps running). */
  animationsActive?: boolean;
};

export default function SectionMotto({
  backgroundColor,
  animationsActive = true,
}: Props) {
  const bg = backgroundColor ?? DEFAULT_BG;

  return (
    <SectionShell
      id="motto"
      bgColor={bg}
      style={{ padding: 0, overflow: "visible", pointerEvents: "none" }}
    >
      <iframe
        src="/lights.html"
        title=""
        aria-hidden="true"
        className="absolute inset-0 z-[1] h-full w-full border-0"
        style={{ pointerEvents: animationsActive ? "auto" : "none" }}
      />
    </SectionShell>
  );
}
