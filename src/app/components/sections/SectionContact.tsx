import SectionShell, { CONTENT_TOP, PANEL_PADDING } from "./SectionShell";

const BG = "#4F7C6C";
const FG = "#F5F5E9";

type Props = {
  block1Title?: string;
  block1Body?: string;
  block2Title?: string;
  block2Body?: string;
};

export default function SectionContact({
  block1Title,
  block1Body,
  block2Title,
  block2Body,
}: Props) {
  const title1 = block1Title ?? "Get in touch";
  const body1 = block1Body ?? "hello@comtebureau.com";
  const title2 = block2Title ?? "Where to find us";
  const body2 = block2Body ?? "Oslo, Norway";

  return (
    <SectionShell id="contact" bgColor={BG} style={{ padding: 0, color: FG }}>
      <div
        className="flex h-full min-w-0 flex-col gap-6"
        style={{
          paddingTop: `calc(${CONTENT_TOP} - 1.5rem)`,
          paddingRight: PANEL_PADDING,
          paddingBottom: PANEL_PADDING,
          paddingLeft: PANEL_PADDING,
        }}
      >
        <div className="max-w-[33ch] flex-1">
          <h2 className="mb-3 font-[family-name:var(--font-manrope)] text-4xl font-bold">
            {title1}
          </h2>
          <p className="font-[family-name:var(--font-manrope)] text-base font-bold leading-tight whitespace-pre-line">
            {body1}
          </p>
        </div>

        <div className="max-w-[33ch] flex-1">
          <h2 className="mb-3 font-[family-name:var(--font-manrope)] text-4xl font-bold">
            {title2}
          </h2>
          <p className="font-[family-name:var(--font-manrope)] text-base font-bold leading-tight whitespace-pre-line">
            {body2}
          </p>
        </div>
      </div>
    </SectionShell>
  );
}
