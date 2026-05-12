export const revalidate = 60;

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlobNav from "@/app/components/BlobNav";
import Footer from "@/app/components/Footer";
import FittingHeadline from "@/app/components/FittingHeadline";
import { client } from "@/sanity/lib/client";
import { PROJECT_DETAIL_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { DOMAIN_LABELS, type Domain } from "@/app/components/projectNetworkData";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function sanityImageUrl(imageField: any, width = 1600): string | null {
  if (!imageField?.asset) return null;
  return urlFor(imageField).width(width).auto("format").quality(80).url();
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let project = null;
  try {
    project = await client.fetch(PROJECT_DETAIL_QUERY, { slug });
  } catch {}

  if (!project) return notFound();

  const gallery: any[] = project.gallery ?? [];
  const heroImage = gallery[0];
  const heroUrl = sanityImageUrl(heroImage) ?? PLACEHOLDER_IMAGE;
  const heroAlt = heroImage?.alt ?? project.title ?? "";

  const tags: string[] = project.tags ?? [];
  const links: { label: string; url: string }[] = project.links ?? [];

  return (
    <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
      <BlobNav />

      {/* Hero */}
      <div className="w-full h-[80vh] flex flex-col items-center justify-start pt-12 bg-background">
        <FittingHeadline>{project.title}</FittingHeadline>
        <p className="italic text-xl text-gray-500">{project.year}</p>
        <p className="text-xl text-gray-500">{project.client}</p>
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
      {project.summary && (
        <div className="mx-auto w-full max-w-3xl bg-background px-6 py-12 md:px-12">
          <p className="text-foreground/85 text-lg font-light leading-relaxed whitespace-pre-line">
            {project.summary}
          </p>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mx-auto w-full max-w-3xl bg-background px-6 pb-8 md:px-12">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-foreground/20 px-3 py-1 text-sm font-light text-foreground/70"
              >
                {DOMAIN_LABELS[tag as Domain] ?? tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {links.length > 0 && (
        <div className="mx-auto w-full max-w-3xl bg-background px-6 pb-12 md:px-12">
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 underline-offset-4 hover:underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Remaining gallery */}
      {gallery.length > 1 && (
        <div className="w-full bg-background px-6 py-8 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {gallery.slice(1).map((img: any, i: number) => {
              const imgUrl = sanityImageUrl(img, 1200) ?? PLACEHOLDER_IMAGE;
              return (
                <div
                  key={img.asset?._id ?? i}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100"
                >
                  <Image src={imgUrl} alt={img.alt ?? ""} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                  {img.caption && (
                    <p className="absolute bottom-0 left-0 right-0 bg-black/40 px-4 py-2 text-sm text-white">
                      {img.caption}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="w-full px-2 h-[50vh] flex flex-col items-start justify-end pt-12 bg-background">
        <h2 className="text-5xl py-12 font-light text-foreground">
          Do you have any questions regarding this project?
        </h2>
      </div>
      <div className="w-full flex flex-col md:flex-row md:items-stretch gap-2 py-2 p-0">
        <Link
          href="/about"
          className="w-full rounded-full md:w-1/2 h-[30vh] md:h-[50vh] flex items-center justify-center border border-foreground text-foreground font-light text-2xl md:text-3xl tracking-wide transition-[box-shadow,background-color,color] duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-inset focus:ring-background/30 shrink-0 hover:[box-shadow:inset_0_0_100px_0_rgba(255,82,82,0.85)]"
          aria-label="Get in touch"
        >
          Get in touch
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
