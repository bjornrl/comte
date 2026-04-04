export const revalidate = 60;

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlobNav from "@/app/components/BlobNav";
import Footer from "@/app/components/Footer";
import FittingHeadline from "@/app/components/FittingHeadline";
import { client } from "@/sanity/lib/client";
import { RESOURCE_DETAIL_QUERY, ARTICLE_DETAIL_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function sanityImageUrl(imageField: any, width = 1600): string | null {
  if (!imageField?.asset) return null;
  return urlFor(imageField).width(width).auto("format").quality(80).url();
}

function hasPortableTextContent(blocks: any): boolean {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return false;
  return blocks.some(
    (block: any) =>
      block.children?.some((child: any) => child.text && child.text.trim().length > 0)
  );
}

export default async function InsightDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Try resource first, then article
  let resource = null;
  let article = null;
  try {
    [resource, article] = await Promise.all([
      client.fetch(RESOURCE_DETAIL_QUERY, { slug }),
      client.fetch(ARTICLE_DETAIL_QUERY, { slug }),
    ]);
  } catch {}

  // Resource detail page
  if (resource) {
    const heroUrl = sanityImageUrl(resource.image) ?? PLACEHOLDER_IMAGE;
    const heroAlt = resource.image?.alt ?? resource.title ?? "";
    const isInquiry = resource.actionType === "inquiry";
    const ctaLabel = isInquiry ? "Ta kontakt" : "Last ned";
    const ctaHref = isInquiry
      ? `mailto:${resource.inquiryEmail || "contact@comte.no"}?subject=Inquiry: ${encodeURIComponent(resource.title)}`
      : resource.fileUrl
        ? `${resource.fileUrl}?dl=`
        : "#";

    return (
      <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
        <BlobNav />

        {/* Hero */}
        <div className="w-full h-[80vh] flex flex-col items-center justify-start pt-12 bg-background">
          <FittingHeadline>{resource.title}</FittingHeadline>
          {resource.meta && (
            <p className="text-sm uppercase tracking-[0.08em] text-foreground/50 mt-2">
              {resource.meta}
            </p>
          )}
          {resource.subtitle && (
            <p className="text-xl text-gray-500 max-w-2xl text-center mt-4 px-6">
              {resource.subtitle}
            </p>
          )}
        </div>

        {/* Hero image */}
        <div className="w-full bg-background px-6 md:px-12 lg:px-24 py-8">
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
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

        {/* Description */}
        {hasPortableTextContent(resource.description) && (
          <div className="w-full bg-background px-6 py-12 md:px-12 lg:px-24 max-w-3xl mx-auto">
            <div className="text-foreground font-light space-y-6 text-lg leading-relaxed [&>p]:mb-0">
              <PortableText value={resource.description} />
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="w-full px-2 h-fit flex flex-col items-start justify-end pt-12 bg-background">
          <h2 className="text-5xl py-12 font-light text-black">
            {isInquiry ? "Interessert i denne ressursen?" : "Klar til å laste ned?"}
          </h2>
        </div>
        <div className="w-full flex flex-col md:flex-row md:items-stretch gap-2 py-2 p-0">
          <Link
            href={ctaHref}
            className="w-full rounded-full md:w-1/2 h-[30vh] md:h-[50vh] flex items-center justify-center border border-foreground text-foreground font-light text-2xl md:text-3xl tracking-wide transition-[box-shadow,background-color,color] duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-inset focus:ring-background/30 shrink-0 hover:[box-shadow:inset_0_0_100px_0_rgba(255,82,82,0.85)]"
            aria-label={ctaLabel}
          >
            {ctaLabel}
          </Link>
          <div className="flex flex-col gap-1 justify-center text-foreground/70 font-light text-lg px-6 py-8 md:px-0 md:py-0 md:w-1/2">
            <div className="relative overflow-hidden rounded-lg h-full w-full">
              <Image
                src={heroUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Article detail page
  if (article) {
    const heroUrl = sanityImageUrl(article.image) ?? PLACEHOLDER_IMAGE;
    const heroAlt = article.image?.alt ?? article.title ?? "";

    return (
      <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
        <BlobNav />

        {/* Hero */}
        <div className="w-full h-[80vh] flex flex-col items-center justify-start pt-12 bg-background">
          <FittingHeadline>{article.title}</FittingHeadline>
          <div className="flex items-center gap-4 mt-4 text-xl text-gray-500">
            {article.year && <p className="italic">{article.year}</p>}
            {article.forum && <p>{article.forum}</p>}
          </div>
        </div>

        {/* Hero image */}
        <div className="w-full bg-background px-6 md:px-12 lg:px-24 py-8">
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
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

        {/* Body */}
        {hasPortableTextContent(article.body) && (
          <div className="w-full bg-background px-6 py-12 md:px-12 lg:px-24 max-w-3xl mx-auto">
            <div className="text-foreground font-light space-y-6 text-lg leading-relaxed [&>p]:mb-0">
              <PortableText value={article.body} />
            </div>
          </div>
        )}

        <Footer />
      </div>
    );
  }

  return notFound();
}
