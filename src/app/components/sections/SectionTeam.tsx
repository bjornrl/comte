"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Linkedin } from "lucide-react";
import SectionShell, { CONTENT_TOP, PANEL_PADDING } from "./SectionShell";
import TiltedHeading from "../TiltedHeading";
import { urlFor } from "@/sanity/lib/image";

const BG = "#5F7C8B";
const FG = "#F5F5E9";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop";

const TEAM_CARD_VW_DIVISOR = 6.5;
/** Left band reserved for the tilted section heading. */
export const TEAM_HEADING_RESERVE = "clamp(14rem, 22vw, 18rem)";
const TEAM_HEADING_TEXT = "Our team";
/** Gap between the team grid and the video carousel column. */
const GRID_TO_CAROUSEL_GAP = "clamp(2rem, 4vw, 3rem)";
/** Fixed-width rolling video column — matches ventures marquee column (18%). */
export const VIDEO_CAROUSEL_COL_WIDTH = "18vw";
/** Tile height — matches ventures/publications marquee frames. */
const VIDEO_MARQUEE_TILE_HEIGHT = "40vh";
/** Extra section width + carousel inset — background continues past the video column. */
const VIDEO_CAROUSEL_TRAILING_BLEED = "clamp(6rem, 12vw, 10rem)";
const VIDEO_TILE_GAP_PX = 4;
/** Minimum time each tile is on screen during one full loop. */
const VIDEO_SECONDS_PER_TILE = 4.5;
const VIDEO_MARQUEE_MIN_DURATION_S = 42;

function sanityImageUrl(imageField: any, width = 800): string | null {
  if (!imageField?.asset) return null;
  return urlFor(imageField).width(width).auto("format").quality(80).url();
}

export type TeamCarouselVideo = {
  _key?: string;
  url: string;
  mimeType?: string;
  label?: string;
  /** Original index in the Sanity array — preserves CMS drag order. */
  cmsOrder?: number;
};

type TeamMember = {
  _id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  photo?: any;
};

type Props = {
  heading?: string;
  teamMembers: TeamMember[];
  carouselVideos?: TeamCarouselVideo[];
};

export function getTeamSectionWidth(memberCount: number, videoCount = 0): string {
  const cols = Math.max(1, Math.ceil(Math.max(memberCount, 1) / 2));
  const teamPart = `calc(${TEAM_HEADING_RESERVE} + ${cols} * (100vw / ${TEAM_CARD_VW_DIVISOR}) + ${Math.max(0, cols - 1)} * 0.5rem + ${PANEL_PADDING})`;
  if (videoCount <= 0) {
    return `max(100vw, ${teamPart})`;
  }
  return `max(100vw, calc(${teamPart} + ${GRID_TO_CAROUSEL_GAP} + ${VIDEO_CAROUSEL_COL_WIDTH} + ${VIDEO_TILE_GAP_PX}px + ${VIDEO_CAROUSEL_TRAILING_BLEED}))`;
}

function VideoMarqueeTile({
  video,
  scrollRoot,
}: {
  video: TeamCarouselVideo;
  scrollRoot: Element | null;
}) {
  const tileRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const tile = tileRef.current;
    const clip = videoRef.current;
    if (!tile || !clip) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          clip.play().catch(() => {});
        } else {
          clip.pause();
        }
      },
      { root: scrollRoot, threshold: 0.15 },
    );

    observer.observe(tile);
    return () => observer.disconnect();
  }, [scrollRoot]);

  return (
    <div
      ref={tileRef}
      className="relative w-full overflow-hidden bg-black"
      style={{ height: VIDEO_MARQUEE_TILE_HEIGHT, flexShrink: 0 }}
    >
      <video
        ref={videoRef}
        src={video.url}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

function VideoMarqueeColumn({ videos }: { videos: TeamCarouselVideo[] }) {
  const [viewportEl, setViewportEl] = useState<HTMLDivElement | null>(null);
  const firstCopyRef = useRef<HTMLDivElement>(null);
  const [loopTravelPx, setLoopTravelPx] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const orderedVideos = useMemo(
    () =>
      [...videos].sort(
        (a, b) =>
          (a.cmsOrder ?? Number.MAX_SAFE_INTEGER) -
          (b.cmsOrder ?? Number.MAX_SAFE_INTEGER),
      ),
    [videos],
  );

  const marqueeDurationS = useMemo(
    () =>
      Math.max(
        VIDEO_MARQUEE_MIN_DURATION_S,
        orderedVideos.length * VIDEO_SECONDS_PER_TILE,
      ),
    [orderedVideos.length],
  );

  useLayoutEffect(() => {
    const firstCopy = firstCopyRef.current;
    if (!firstCopy || orderedVideos.length === 0) return;

    const measure = () => {
      // One full loop = first copy height + the gap before the duplicate copy.
      setLoopTravelPx(firstCopy.offsetHeight + VIDEO_TILE_GAP_PX);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(firstCopy);
    return () => observer.disconnect();
  }, [orderedVideos]);

  if (orderedVideos.length === 0) return null;

  const travel = loopTravelPx ?? 0;
  const shouldAnimate = travel > 0 && !prefersReducedMotion;
  const marqueeKeyframes = shouldAnimate
    ? `@keyframes teamVideoMarqueeUp { from { transform: translateY(0); } to { transform: translateY(-${travel}px); } }`
    : `@keyframes teamVideoMarqueeUp { from, to { transform: translateY(0); } }`;

  return (
    <>
      <style>{marqueeKeyframes}</style>
      <div ref={setViewportEl} className="relative h-full w-full overflow-hidden">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: VIDEO_TILE_GAP_PX,
            animationName: shouldAnimate ? "teamVideoMarqueeUp" : undefined,
            animationDuration: `${marqueeDurationS}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            willChange: shouldAnimate ? "transform" : undefined,
          }}
        >
          <div
            ref={firstCopyRef}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: VIDEO_TILE_GAP_PX,
            }}
          >
            {orderedVideos.map((video) => (
              <VideoMarqueeTile
                key={video._key ?? video.cmsOrder}
                video={video}
                scrollRoot={viewportEl}
              />
            ))}
          </div>
          <div
            aria-hidden
            style={{
              display: "flex",
              flexDirection: "column",
              gap: VIDEO_TILE_GAP_PX,
            }}
          >
            {orderedVideos.map((video, index) => (
              <VideoMarqueeTile
                key={`${video._key ?? video.cmsOrder}-dup-${index}`}
                video={video}
                scrollRoot={viewportEl}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function SectionTeam({
  heading,
  teamMembers,
  carouselVideos = [],
}: Props) {
  const hasVideoCarousel = carouselVideos.length > 0;
  const headingLines = [heading?.trim() || TEAM_HEADING_TEXT];

  return (
    <SectionShell
      id="team"
      bgColor={BG}
      style={{ padding: 0, color: FG, overflow: "visible" }}
    >
      <TiltedHeading
        lines={headingLines}
        color={FG}
        parallaxFactor={0.18}
        leftOffsetEm={0.2}
      />

      <div className="relative flex h-full w-full">
        <div
          className="flex h-full min-w-0 flex-1 flex-col"
          style={{
            paddingTop: CONTENT_TOP,
            paddingLeft: TEAM_HEADING_RESERVE,
            paddingRight: hasVideoCarousel
              ? `calc(${VIDEO_CAROUSEL_TRAILING_BLEED} + ${VIDEO_CAROUSEL_COL_WIDTH} + ${GRID_TO_CAROUSEL_GAP})`
              : PANEL_PADDING,
            paddingBottom: PANEL_PADDING,
          }}
        >
          <div className="flex h-full min-w-0 flex-1 justify-end">
            <div
              className="grid h-full gap-2"
              style={{
                gridTemplateRows: "1fr 1fr",
                gridAutoFlow: "column",
                gridAutoColumns: `calc(100vw / ${TEAM_CARD_VW_DIVISOR})`,
                width: "max-content",
              }}
            >
            {teamMembers.map((member) => {
              const photoUrl = sanityImageUrl(member.photo, 800) ?? PLACEHOLDER_IMAGE;

              return (
                <article
                  key={member._id}
                  className="relative h-full min-h-0 overflow-hidden bg-gray-100 select-text"
                  style={{ color: FG }}
                >
                  <img
                    src={photoUrl}
                    alt=""
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />

                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
                    style={{
                      backgroundImage:
                        "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0))",
                    }}
                  />

                  <div
                    className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-0.5"
                    style={{
                      paddingTop: "1rem",
                      paddingRight: "2.75rem",
                      paddingBottom: "clamp(0.5rem, 1vw, 0.75rem)",
                      paddingLeft: "clamp(0.75rem, 1.25vw, 1rem)",
                    }}
                  >
                    <div>
                      <p
                        className="font-[family-name:var(--font-work-sans)] font-medium tracking-wider"
                        style={{
                          color: "rgba(255,255,255,0.78)",
                          fontSize: "clamp(0.75rem, 0.95vw, 0.875rem)",
                          textTransform: "lowercase",
                          fontVariant: "small-caps",
                        }}
                      >
                        {member.role}
                      </p>
                      <h3
                        className="font-[family-name:var(--font-manrope)] font-medium leading-tight"
                        style={{
                          color: "rgba(255,255,255,0.98)",
                          fontSize: "clamp(1.0625rem, 1.5vw, 1.375rem)",
                        }}
                      >
                        {member.name}
                      </h3>
                    </div>
                    {(member.email || member.phone) && (
                      <div
                        className="flex flex-col gap-0 font-[family-name:var(--font-work-sans)] leading-tight"
                        style={{ fontSize: "clamp(0.75rem, 0.9vw, 0.875rem)" }}
                      >
                        {member.email && (
                          <span style={{ color: "rgba(255,255,255,0.92)" }}>
                            {member.email}
                          </span>
                        )}
                        {member.phone && (
                          <span style={{ color: "rgba(255,255,255,0.92)" }}>
                            {member.phone}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                      className="absolute z-20 flex items-center justify-center rounded-sm transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      style={{
                        right: "clamp(0.4rem, 0.8vw, 0.6rem)",
                        bottom: "clamp(0.4rem, 0.8vw, 0.6rem)",
                        width: 44,
                        height: 44,
                        color: "#fff",
                      }}
                    >
                      <Linkedin size={22} strokeWidth={2} aria-hidden />
                    </a>
                  )}
                </article>
              );
            })}
            </div>
          </div>
        </div>

        {hasVideoCarousel ? (
          <aside
            className="absolute inset-y-0 z-10 hidden h-full lg:block"
            style={{
              right: VIDEO_CAROUSEL_TRAILING_BLEED,
              width: VIDEO_CAROUSEL_COL_WIDTH,
            }}
            aria-label="Team video carousel"
          >
            <VideoMarqueeColumn videos={carouselVideos} />
          </aside>
        ) : null}
      </div>
    </SectionShell>
  );
}
