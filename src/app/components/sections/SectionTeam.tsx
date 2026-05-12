import SectionShell from "./SectionShell";
import PersonCard from "../PersonCard";
import { comteColors } from "@/lib/comte-colors";
import { urlFor } from "@/sanity/lib/image";

const DEFAULT_BG = "#F9F9ED";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop";

const HOVER_PALETTE = [
  { overlay: comteColors.nearBlack, text: comteColors.cream, meta: "rgba(251, 246, 239, 0.82)" },
  { overlay: comteColors.darkGreen, text: comteColors.lightBase, meta: "rgba(249, 249, 237, 0.78)" },
  { overlay: comteColors.deepRed, text: comteColors.cream, meta: "rgba(251, 246, 239, 0.84)" },
  { overlay: comteColors.coolBlue, text: comteColors.cream, meta: "rgba(251, 246, 239, 0.8)" },
] as const;

function sanityImageUrl(imageField: any, width = 800): string | null {
  if (!imageField?.asset) return null;
  return urlFor(imageField).width(width).auto("format").quality(80).url();
}

type Props = {
  backgroundColor?: string;
  heading?: string;
  teamMembers: any[];
};

export default function SectionTeam({ backgroundColor, heading, teamMembers }: Props) {
  return (
    <SectionShell id="team" bgColor={backgroundColor ?? DEFAULT_BG}>
      <div className="flex h-full flex-col gap-6 overflow-hidden">
        {heading && (
          <h2 className="font-[family-name:var(--font-manrope)] font-bold text-foreground"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}>
            {heading}
          </h2>
        )}
        <div className="flex-1 grid min-h-0 grid-cols-2 gap-2 overflow-y-auto md:grid-cols-3 lg:grid-cols-4">
          {teamMembers.map((member: any, i: number) => {
            const palette = HOVER_PALETTE[i % HOVER_PALETTE.length];
            const bio =
              member.bio
                ?.map((block: any) => block.children?.map((child: any) => child.text).join(""))
                .join(" ") ?? "";
            const photoUrl = sanityImageUrl(member.photo, 800) ?? PLACEHOLDER_IMAGE;

            return (
              <PersonCard
                key={member._id}
                title={member.role}
                name={member.name}
                description={bio}
                imageUrl={photoUrl}
                email={member.email}
                hoverTextColor={palette.text}
                hoverMetaTextColor={palette.meta}
                hoverOverlayColor={palette.overlay}
                cursor={
                  <div className="h-24 w-24 rounded-full border border-background/40 bg-background/90 text-foreground flex items-center justify-center text-xs font-medium tracking-wide shadow-lg text-center leading-tight px-2">
                    Send mail til {member.name.split(" ")[0]}
                  </div>
                }
              />
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
