import SectionShell from "./SectionShell";

const DEFAULT_BG = "#F9F9ED";

type Props = {
  heroText?: string;
  backgroundColor?: string;
};

export default function SectionMotto({ heroText, backgroundColor }: Props) {
  if (!heroText) return <SectionShell id="motto" bgColor={backgroundColor ?? DEFAULT_BG}>{null}</SectionShell>;

  return (
    <SectionShell id="motto" bgColor={backgroundColor ?? DEFAULT_BG}>
      <div className="absolute inset-0 flex items-center justify-center px-[clamp(1rem,5vw,5rem)]">
        <p
          className="text-center font-[family-name:var(--font-abhaya-libre)] font-semibold text-foreground"
          style={{
            fontSize: "clamp(2rem, 6vw, 5rem)",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            maxWidth: "20ch",
          }}
        >
          {heroText}
        </p>
      </div>
    </SectionShell>
  );
}
