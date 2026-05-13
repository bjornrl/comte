import Image from "next/image";
import SectionShell from "./SectionShell";
import { urlFor } from "@/sanity/lib/image";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop";

function sanityImageUrl(imageField: any, width = 800): string | null {
  if (!imageField?.asset) return null;
  return urlFor(imageField).width(width).auto("format").quality(80).url();
}

export type CardItem = {
  _id: string;
  title?: string;
  description?: string;
  image?: any;
};

type Props = {
  id: string;
  /** Background colour for this section. */
  backgroundColor: string;
  /** Foreground (text) colour for headings + card titles + descriptions. */
  foregroundColor: string;
  heading?: string;
  items: CardItem[];
};

export default function SectionCardGrid({
  id,
  backgroundColor,
  foregroundColor,
  heading,
  items,
}: Props) {
  return (
    <SectionShell id={id} bgColor={backgroundColor} style={{ color: foregroundColor }}>
      <div className="flex h-full flex-col gap-6 overflow-hidden">
        {heading && (
          <h2
            className="font-[family-name:var(--font-manrope)] font-bold"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
          >
            {heading}
          </h2>
        )}
        <div className="flex-1 grid min-h-0 grid-cols-1 gap-6 overflow-y-auto md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const imageUrl = sanityImageUrl(item.image, 800) ?? PLACEHOLDER_IMAGE;
            return (
              <article key={item._id} className="flex flex-col gap-3">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={item.image?.alt ?? item.title ?? ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-manrope)] text-xl font-bold">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p
                      className="mt-1 font-[family-name:var(--font-manrope)] text-base font-light leading-relaxed whitespace-pre-line"
                      style={{ color: foregroundColor, opacity: 0.78 }}
                    >
                      {item.description}
                    </p>
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
