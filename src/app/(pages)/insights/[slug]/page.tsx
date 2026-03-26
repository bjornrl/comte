"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import BlobNav from "@/app/components/BlobNav";
import Footer from "@/app/components/Footer";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

type Insight = {
  title: string;
  year?: string;
  forum?: string;
  imageUrl?: string;
  assetPath?: string;
  paragraphs: string[];
};

const INSIGHTS: Record<string, Insight> = {
  "auguste-comte": {
    title: "Auguste Comte",
    year: "1857",
    forum: "Notes",
    imageUrl: PLACEHOLDER_IMAGE,
    assetPath: "/assets/insights/service-blueprint-template.txt",
    paragraphs: [
      "Auguste Comte (1798–1857) was a French philosopher and writer who founded the discipline of sociology and the doctrine of positivism. He believed that society, like the physical world, operates according to general laws that can be studied scientifically.",
      "Comte introduced the idea of the “law of three stages”—theological, metaphysical, and positive—to describe how human thought and society evolve. In the positive stage, explanation is based on observation and scientific method rather than speculation or superstition.",
      "His work influenced later thinkers across sociology, philosophy, and political theory, and his emphasis on order, progress, and scientific knowledge still shapes how we think about modern society.",
    ],
  },
};

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function InsightPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const insight = INSIGHTS[slug] ?? {
    title: titleFromSlug(slug),
    year: undefined,
    forum: undefined,
    imageUrl: PLACEHOLDER_IMAGE,
    assetPath: `/assets/insights/${slug}.txt`,
    paragraphs: [
      "This insight page is a placeholder. Add real content by mapping the slug to an article in `INSIGHTS`.",
    ],
  };

  return (
    <div className="px-2" style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
      <BlobNav />

      <section className="w-full min-h-screen h-fit pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full min-h-[80vh]">
          <div className="relative aspect-[4/3] lg:aspect-auto h-full overflow-hidden rounded-xl">
            <Image
              src={insight.imageUrl ?? PLACEHOLDER_IMAGE}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          <div className="flex flex-col justify-center px-6 py-16 lg:px-16 lg:py-24 xl:px-24">
            <div className="mb-6 flex items-center gap-3 text-sm font-medium text-foreground/60">
              <Link
                href="/insights"
                className="underline decoration-foreground/20 underline-offset-4 hover:decoration-foreground/40"
              >
                Insights
              </Link>
              <span className="text-foreground/30">/</span>
              <span className="text-foreground/60">{slug}</span>
            </div>

            <h1
              className="text-3xl md:text-4xl font-light text-foreground tracking-tight mb-6"
              style={{ fontFamily: "var(--font-neue-haas)" }}
            >
              {insight.title}
            </h1>

            {(insight.year || insight.forum) && (
              <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-light text-foreground/60">
                {insight.year ? <span>{insight.year}</span> : null}
                {insight.forum ? <span>{insight.forum}</span> : null}
              </div>
            )}

            <div className="space-y-6">
              {insight.paragraphs.map((text, idx) => (
                <p key={idx} className="text-foreground/80 font-light text-lg leading-relaxed">
                  {text}
                </p>
              ))}
            </div>

            <div className="mt-12 flex flex-col gap-3">
              <a
                href={insight.assetPath}
                download
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-foreground bg-foreground px-6 text-background text-base font-light tracking-wide transition-colors hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-background/30"
              >
                Download asset
              </a>
              <p className="text-sm font-light text-foreground/60">
                This downloads a file from{" "}
                <span className="font-medium text-foreground/70">{insight.assetPath}</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
