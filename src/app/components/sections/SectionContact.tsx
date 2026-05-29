import SectionShell, {
  SECTION_BODY_CONTENT_TOP,
  SECTION_TITLE_SIZE,
  PANEL_PADDING,
} from "./SectionShell";
import { SECTION_BODY_MAX_WIDTH, SectionBodyText } from "./sectionBodyText";
import { CONTACT_BG, CONTACT_FG } from "../homeLayout";

const TEXT_BLOCK_GAP = "2.5rem";

type Props = {
  block1Title?: string;
  block1Body?: string;
  block2Title?: string;
  block2Body?: string;
  block3Title?: string;
  block3Body?: string;
};

function ContactTextBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="w-full" style={{ maxWidth: SECTION_BODY_MAX_WIDTH }}>
      <h2
        className="mb-3 font-[family-name:var(--font-manrope)] font-medium leading-tight"
        style={{ fontSize: SECTION_TITLE_SIZE }}
      >
        {title}
      </h2>
      <SectionBodyText text={body} color={CONTACT_FG} />
    </div>
  );
}

export default function SectionContact({
  block1Title,
  block1Body,
  block2Title,
  block2Body,
  block3Title,
  block3Body,
}: Props) {
  const title1 = block1Title ?? "Get in touch";
  const body1 = block1Body ?? "hello@comtebureau.com";
  const title2 = block2Title ?? "Where to find us";
  const body2 = block2Body ?? "Oslo, Norway";
  const title3 = block3Title ?? "Contact";
  const body3 = block3Body ?? "";

  return (
    <SectionShell
      id="contact"
      bgColor={CONTACT_BG}
      style={{
        padding: 0,
        color: CONTACT_FG,
      }}
    >
      <div
        className="flex h-full min-w-0 flex-col justify-start"
        style={{
          gap: TEXT_BLOCK_GAP,
          paddingTop: SECTION_BODY_CONTENT_TOP,
          paddingRight: "clamp(1.5rem, 4vw, 4rem)",
          paddingBottom: PANEL_PADDING,
          paddingLeft: "clamp(2.5rem, 5vw, 5rem)",
        }}
      >
        <ContactTextBlock title={title1} body={body1} />
        <ContactTextBlock title={title2} body={body2} />
        <ContactTextBlock title={title3} body={body3} />
      </div>
    </SectionShell>
  );
}
