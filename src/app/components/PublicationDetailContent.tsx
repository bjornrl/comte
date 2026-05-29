import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";
import {
  formatPriceNOK,
  resolvePublicationPricing,
} from "@/lib/publicationPricing";
import BuyButton from "@/app/(pages)/publications/[slug]/BuyButton";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop";

function sanityImageUrl(imageField: any, width = 1600): string | null {
  if (!imageField?.asset) return null;
  return urlFor(imageField).width(width).auto("format").quality(80).url();
}

type Props = {
  publication: any;
  canceled?: boolean;
  /** When true, hide the in-content close (the sheet has its own) and the
   *  "back to all publications" link, since the sheet itself handles
   *  dismissal. */
  variant?: "page" | "sheet";
};

export default function PublicationDetailContent({
  publication,
  canceled,
  variant = "page",
}: Props) {
  const { pricing, price } = resolvePublicationPricing({
    _id: publication._id,
    pricing: publication.pricing,
    price: publication.price,
  });

  const heroUrl = sanityImageUrl(publication.image, 1600) ?? PLACEHOLDER_IMAGE;
  const heroAlt = publication.image?.alt ?? publication.title ?? "";
  const isFree = pricing === "free";
  const pdfUrl: string | undefined = publication.pdfUrl ?? undefined;
  const isSheet = variant === "sheet";

  return (
    <>
      {/* Hero — page variant clears the fixed nav; sheet variant skips the
          title here because the sheet header already shows it. */}
      <div
        className={`w-full flex flex-col items-center justify-start bg-background px-4 ${
          isSheet ? "pt-4 pb-4" : "pt-20 pb-8 sm:px-6 lg:min-h-[60vh] lg:pt-12"
        }`}
      >
        {!isSheet && (
          <h1
            className="font-[family-name:var(--font-manrope)] font-bold leading-tight text-center"
            style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}
          >
            {publication.title}
          </h1>
        )}
        <p
          className="text-xs font-medium uppercase tracking-[0.15em] sm:text-sm"
          style={{
            color: isFree ? "#1F3A32" : "#FF5252",
            marginTop: isSheet ? 0 : 12,
          }}
        >
          {isFree ? "Free publication" : `${formatPriceNOK(price)} · Publication`}
        </p>
      </div>

      {/* Cover image */}
      <div className="w-full bg-background px-4 sm:px-6 md:px-12 lg:px-24 py-4 md:py-8">
        <div className="relative w-full aspect-square md:aspect-[16/9] overflow-hidden bg-gray-100">
          <Image
            src={heroUrl}
            alt={heroAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 70vw"
            priority
          />
        </div>
      </div>

      {/* Short description */}
      {publication.description && (
        <div className="mx-auto w-full max-w-3xl bg-background px-4 py-8 sm:px-6 md:px-12 md:py-12">
          <p className="text-foreground/85 text-base sm:text-lg font-light leading-relaxed whitespace-pre-line">
            {publication.description}
          </p>
        </div>
      )}

      {/* Long-form body */}
      {Array.isArray(publication.body) && publication.body.length > 0 && (
        <div className="mx-auto w-full max-w-3xl bg-background px-4 pb-8 sm:px-6 md:px-12 md:pb-12">
          <div className="prose prose-neutral max-w-none text-foreground/85 font-light leading-relaxed">
            <PortableText value={publication.body} />
          </div>
        </div>
      )}

      {/* Purchase / download CTA */}
      <div
        className="w-full px-4 py-10 sm:px-6 md:px-12 lg:px-24 md:py-16 flex flex-col items-start gap-6"
        style={{ background: "#FFD2D2", color: "#1F3A32" }}
      >
        {(isFree || canceled) && (
          <div className="flex flex-col gap-2">
            {isFree && (
              <>
                <span className="text-xs font-medium uppercase tracking-[0.15em] opacity-70 sm:text-sm">
                  Download
                </span>
                <h2
                  className="font-[family-name:var(--font-manrope)] font-bold leading-tight"
                  style={{ fontSize: "clamp(1.5rem, 6vw, 3rem)" }}
                >
                  This publication is free to download.
                </h2>
              </>
            )}
            {canceled && (
              <p
                className="font-[family-name:var(--font-manrope)] text-sm font-medium"
                style={{ color: "#FF5252" }}
              >
                Checkout was canceled — no payment was taken.
              </p>
            )}
          </div>
        )}

        {isFree ? (
          pdfUrl ? (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-4 font-[family-name:var(--font-manrope)] text-base font-bold tracking-wide transition-colors duration-200"
              style={{
                background: "#1F3A32",
                color: "#FFD2D2",
                minHeight: 48,
              }}
            >
              Download PDF
            </a>
          ) : (
            <div
              className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-4 font-[family-name:var(--font-manrope)] text-base font-bold tracking-wide"
              style={{
                background: "#1F3A32",
                color: "#FFD2D2",
                opacity: 0.5,
                minHeight: 48,
              }}
              aria-disabled="true"
            >
              PDF coming soon
            </div>
          )
        ) : (
          <BuyButton
            slug={publication.slug}
            priceLabel={formatPriceNOK(price)}
          />
        )}
      </div>

      {!isSheet && (
        <div className="w-full bg-background px-4 py-8 sm:px-6 md:px-12 lg:px-24 md:py-12">
          <Link
            href="/#publications"
            className="text-foreground/70 underline-offset-4 hover:underline"
          >
            ← Back to all publications
          </Link>
        </div>
      )}
    </>
  );
}
