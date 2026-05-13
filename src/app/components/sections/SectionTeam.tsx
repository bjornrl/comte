"use client";

import SectionShell, { CONTENT_TOP, PANEL_PADDING } from "./SectionShell";
import PersonCard from "../PersonCard";
import { comteColors } from "@/lib/comte-colors";
import { urlFor } from "@/sanity/lib/image";

const BG = "#5F7C8B";
const FG = "#F5F5E9";
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
  heading?: string;
  teamMembers: any[];
};

/**
 * Width the Team panel must take so all cards fit inline as one wide block,
 * including the same left/right insets as every other section
 * (2 × PANEL_PADDING).
 * Used by HomePageClient to set the panel wrapper's width in HorizontalScroll.
 *
 *   cols  = ceil(N / 2)       (2 rows)
 *   width = max(100vw, cols * (100vw / 4.5) + (cols - 1) * 0.5rem
 *                       + 2 * PANEL_PADDING)
 */
export function getTeamSectionWidth(memberCount: number): string {
  const cols = Math.max(1, Math.ceil(Math.max(memberCount, 1) / 2));
  return `max(100vw, calc(${cols} * (100vw / 4.5) + ${Math.max(0, cols - 1)} * 0.5rem + 2 * ${PANEL_PADDING}))`;
}

/**
 * Team section as a single wide panel: 2 rows of cards laid out column-major
 * so all photos fit inline. The panel itself grows wider than the viewport
 * (no inner scroller), so the outer horizontal scroll is what moves the
 * cards left/right. This avoids the "parallax over cards but plain scroll
 * over the background" inconsistency that comes with nested scrollers.
 *
 * One snap point at the panel's left edge (the SectionShell). The user can
 * rest mid-team in the "free zone" between team-start and the next section's
 * snap zone (see HorizontalScroll's SNAP_THRESHOLD).
 */
export default function SectionTeam({ heading: _heading, teamMembers }: Props) {
  return (
    <SectionShell id="team" bgColor={BG} style={{ padding: 0, color: FG }}>
      <div
        className="flex h-full flex-col"
        style={{
          paddingTop: CONTENT_TOP,
          paddingLeft: PANEL_PADDING,
          paddingRight: PANEL_PADDING,
        }}
      >
        <div
          className="grid h-full w-full gap-2 pb-6"
          style={{
            gridTemplateRows: "1fr 1fr",
            gridAutoFlow: "column",
            gridAutoColumns: "calc(100vw / 4.5)",
          }}
        >
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
                // Override PersonCard's default h-[60vh] min-h-[45vh] so it
                // fits exactly one of the two grid rows.
                className="!h-full !min-h-0"
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
