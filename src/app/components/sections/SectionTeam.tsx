"use client";

import SectionShell, { CONTENT_TOP, PANEL_PADDING } from "./SectionShell";
import { urlFor } from "@/sanity/lib/image";

const BG = "#5F7C8B";
const FG = "#F5F5E9";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop";

function sanityImageUrl(imageField: any, width = 800): string | null {
  if (!imageField?.asset) return null;
  return urlFor(imageField).width(width).auto("format").quality(80).url();
}

type TeamMember = {
  _id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  photo?: any;
};

type Props = {
  heading?: string;
  teamMembers: TeamMember[];
};

const TEAM_CARD_VW_DIVISOR = 6;

export function getTeamSectionWidth(memberCount: number): string {
  const cols = Math.max(1, Math.ceil(Math.max(memberCount, 1) / 2));
  return `max(100vw, calc(${cols} * (100vw / ${TEAM_CARD_VW_DIVISOR}) + ${Math.max(0, cols - 1)} * 0.5rem + 2 * ${PANEL_PADDING}))`;
}

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
            gridAutoColumns: `calc(100vw / ${TEAM_CARD_VW_DIVISOR})`,
          }}
        >
          {teamMembers.map((member) => {
            const photoUrl = sanityImageUrl(member.photo, 800) ?? PLACEHOLDER_IMAGE;

            return (
              <article
                key={member._id}
                className="relative h-full min-h-0 overflow-hidden bg-gray-100"
                style={{ color: FG }}
              >
                <img
                  src={photoUrl}
                  alt=""
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />

                {/* Bottom scrim for legibility. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
                  style={{
                    backgroundImage:
                      "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0))",
                  }}
                />

                <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 p-6">
                  <div>
                    <p
                      className="font-[family-name:var(--font-work-sans)] text-xs font-medium tracking-wider"
                      style={{
                        color: "rgba(255,255,255,0.78)",
                        textTransform: "lowercase",
                        fontVariant: "small-caps",
                      }}
                    >
                      {member.role}
                    </p>
                    <h3
                      className="font-[family-name:var(--font-manrope)] text-lg font-medium leading-tight md:text-xl"
                      style={{ color: "rgba(255,255,255,0.98)" }}
                    >
                      {member.name}
                    </h3>
                  </div>
                  {(member.email || member.phone) && (
                    <div className="flex flex-col gap-1 font-[family-name:var(--font-work-sans)] text-sm">
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="hover:underline"
                          style={{ color: "rgba(255,255,255,0.92)" }}
                        >
                          {member.email}
                        </a>
                      )}
                      {member.phone && (
                        <a
                          href={`tel:${member.phone.replace(/\s+/g, "")}`}
                          className="hover:underline"
                          style={{ color: "rgba(255,255,255,0.92)" }}
                        >
                          {member.phone}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
