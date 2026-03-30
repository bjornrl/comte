export const revalidate = 60;

import Image from "next/image";
import { notFound } from "next/navigation";
import BlobNav from "@/app/components/BlobNav";
import Footer from "@/app/components/Footer";
import FittingHeadline from "@/app/components/FittingHeadline";
import { client } from "@/sanity/lib/client";
import { ARTICLE_DETAIL_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function sanityImageUrl(imageField: any, width = 1200): string | null {
  if (!imageField?.asset) return null;
  return urlFor(imageField).width(width).auto("format").quality(80).url();
}

const portableTextComponents = {
  types: {
    image: ({ value }: { value: any }) => {
      const imgUrl = sanityImageUrl(value, 1200);
      if (!imgUrl) return null;
      return (
        <figure className="my-8">
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={imgUrl}
              alt={value.alt ?? ""}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-foreground/50">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let article = null;
  try {
    article = await client.fetch(ARTICLE_DETAIL_QUERY, { slug });
  } catch {}

  if (!article) return notFound();

  const heroUrl = sanityImageUrl(article.image) ?? PLACEHOLDER_IMAGE;
  const hasBody = article.body && article.body.length > 0;

  return (
    <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
      <BlobNav />

      {/* Hero */}
      <div className="w-full h-[80vh] flex flex-col items-center justify-start pt-12 bg-background">
        <FittingHeadline>{article.title}</FittingHeadline>
        <p className="text-xl text-gray-500">
          {article.forum && <span>{article.forum} · </span>}
          {article.year}
        </p>
      </div>

      {/* Hero image */}
      <div className="w-full bg-background px-6 md:px-12 lg:px-24 py-8">
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={heroUrl}
            alt={article.image?.alt ?? article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 70vw"
            priority
          />
        </div>
      </div>

      {/* Article body */}
      {hasBody ? (
        <div className="w-full bg-background px-6 py-12 md:px-12 lg:px-24 max-w-3xl mx-auto">
          <div className="text-foreground font-light space-y-6 text-lg leading-relaxed [&>p]:mb-0">
            <PortableText value={article.body} components={portableTextComponents} />
          </div>
        </div>
      ) : (
        <div className="w-full bg-background px-6 py-12 md:px-12 lg:px-24 max-w-3xl mx-auto">
          <p className="text-center text-foreground/40 text-lg font-light py-24">
            This article is coming soon.
          </p>
        </div>
      )}

      <Footer />
    </div>
  );
}
