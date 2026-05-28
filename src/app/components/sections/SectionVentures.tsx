"use client";

import Image from "next/image";
import SectionShell, { CONTENT_TOP, PANEL_PADDING } from "./SectionShell";
import { urlFor } from "@/sanity/lib/image";
import type { CardItem } from "./SectionCardGrid";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop";

function sanityImageUrl(imageField: any, width = 1200): string | null {
  if (!imageField?.asset) return null;
  return urlFor(imageField).width(width).auto("format").quality(80).url();
}

type Props = {
  backgroundColor: string;
  foregroundColor: string;
  heading?: string;
  body?: string;
  featuredVideoUrl?: string;
  featuredImage?: any;
  items: CardItem[];
};

const TILE_GAP_PX = 4;
const MARQUEE_TILE_HEIGHT = "40vh";
const MARQUEE_DURATION_S = 80;

function MediaFrame({
  videoUrl,
  imageField,
}: {
  videoUrl?: string;
  imageField?: any;
}) {
  const imageUrl = sanityImageUrl(imageField, 1400) ?? PLACEHOLDER_IMAGE;
  const alt = imageField?.alt ?? "";

  return (
    <div className="relative h-full w-full overflow-hidden bg-black/20">
      {videoUrl ? (
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          aria-label={alt || "Ventures feature video"}
        />
      ) : (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
          sizes="30vw"
          priority
        />
      )}
    </div>
  );
}

function MarqueeTile({ item }: { item: CardItem }) {
  const imageUrl = sanityImageUrl(item.image, 800) ?? PLACEHOLDER_IMAGE;

  return (
    <div
      aria-hidden
      className="relative block w-full overflow-hidden bg-gray-900/40"
      style={{ height: MARQUEE_TILE_HEIGHT, flexShrink: 0 }}
    >
      <Image
        src={imageUrl}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 40vw, 18vw"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0))",
        }}
      />
      {item.title && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4">
          <h3
            className="font-[family-name:var(--font-manrope)] text-base font-bold leading-tight"
            style={{ color: "rgba(255,255,255,0.98)" }}
          >
            {item.title}
          </h3>
        </div>
      )}
    </div>
  );
}

function MarqueeColumn({ items }: { items: CardItem[] }) {
  if (items.length === 0) return <div aria-hidden />;

  const stack = [...items, ...items];

  return (
    <div className="relative h-full w-full overflow-hidden" aria-hidden>
      <div
        className="pointer-events-none"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: TILE_GAP_PX,
          animationName: "venturesMarqueeUp",
          animationDuration: `${MARQUEE_DURATION_S}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          willChange: "transform",
        }}
      >
        {stack.map((item, i) => (
          <MarqueeTile key={`${item._id}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function SectionVentures({
  backgroundColor,
  foregroundColor,
  heading,
  body,
  featuredVideoUrl,
  featuredImage,
  items,
}: Props) {
  return (
    <SectionShell
      id="ventures"
      bgColor={backgroundColor}
      style={{ color: foregroundColor, padding: 0 }}
    >
      <style>{`
        @keyframes venturesMarqueeUp {
          from { transform: translateY(0%); }
          to { transform: translateY(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes venturesMarqueeUp {
            from, to { transform: translateY(0%); }
          }
        }
      `}</style>

      <div className="flex h-full w-full flex-col lg:grid lg:grid-cols-[minmax(0,30%)_minmax(0,1fr)_minmax(0,18%)]">
        {/* Left — full-height video or image frame */}
        <div className="relative h-[40vh] w-full shrink-0 lg:h-full">
          <MediaFrame videoUrl={featuredVideoUrl} imageField={featuredImage} />
        </div>

        {/* Centre — heading + body text */}
        <div
          className="flex min-h-0 min-w-0 flex-1 flex-col justify-start lg:h-full"
          style={{
            paddingTop: CONTENT_TOP,
            paddingRight: PANEL_PADDING,
            paddingBottom: "2rem",
            paddingLeft: PANEL_PADDING,
            maxWidth: "44ch",
          }}
        >
          {body && (
            <p
              className="font-[family-name:var(--font-manrope)] font-normal whitespace-pre-line"
              style={{
                fontSize: "clamp(1.25rem, 1.8vw, 1.6rem)",
                lineHeight: 1.2,
              }}
            >
              {body}
            </p>
          )}
          {heading && (
            <h2
              className="font-[family-name:var(--font-manrope)] font-bold leading-tight"
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                marginTop: body ? "1.5rem" : 0,
              }}
            >
              {heading}
            </h2>
          )}
        </div>

        {/* Right — continuous upward marquee (non-interactive) */}
        <div className="relative hidden h-full min-w-0 lg:block">
          <MarqueeColumn items={items} />
        </div>
      </div>
    </SectionShell>
  );
}
