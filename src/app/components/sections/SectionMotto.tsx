import SectionShell from "./SectionShell";

const BG = "#1F3A32";
const FG = "#F5F5E9";

type Props = {
  heroText?: string;
};

export default function SectionMotto({ heroText }: Props) {
  if (!heroText) return <SectionShell id="motto" bgColor={BG}>{null}</SectionShell>;

  return (
    <SectionShell id="motto" bgColor={BG}>
      <div className="absolute inset-0 flex items-center justify-center px-[clamp(1rem,5vw,5rem)]">
        <p
          className="text-center font-[family-name:var(--font-abhaya-libre)] font-semibold"
          style={{
            fontSize: "clamp(2rem, 6vw, 5rem)",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            maxWidth: "20ch",
            color: FG,
          }}
        >
          {heroText}
        </p>
      </div>
    </SectionShell>
  );
}
