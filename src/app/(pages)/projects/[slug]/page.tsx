import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlobNav from "@/app/components/BlobNav";
import Footer from "@/app/components/Footer";
import FittingHeadline from "@/app/components/FittingHeadline";
import { client } from "@/sanity/lib/client";
import { PROJECT_DETAIL_QUERY } from "@/sanity/lib/queries";
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

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await client.fetch(PROJECT_DETAIL_QUERY, { slug });

  if (!project) return notFound();

  const heroUrl = sanityImageUrl(project.heroImage) ?? PLACEHOLDER_IMAGE;
  const heroAlt = project.heroImage?.alt ?? project.title ?? "";

  const hasChallenge = hasPortableTextContent(project.challenge);
  const hasApproach = hasPortableTextContent(project.approach);
  const hasOutcome = hasPortableTextContent(project.outcome);
  const hasQuote = project.clientQuote?.text;
  const hasGallery = project.gallery && project.gallery.length > 0;

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

      {/* Challenge */}
      {hasChallenge && (
        <div className="w-full bg-background px-6 py-12 md:px-12 lg:px-24 max-w-3xl mx-auto">
          <div className="text-foreground font-light space-y-6 text-lg leading-relaxed [&>p]:mb-0">
            <p className="text-2xl font-bold text-center">The challenge</p>
            <PortableText value={project.challenge} />
          </div>
        </div>
      )}

      {/* Client quote */}
      {hasQuote && (
        <div className="w-full bg-background px-6 py-8 md:px-12 lg:px-24 max-w-3xl mx-auto">
          <blockquote className="border-l-4 border-foreground/20 pl-6 py-2">
            <p className="text-xl font-light italic text-foreground/80 leading-relaxed">
              &ldquo;{project.clientQuote.text}&rdquo;
            </p>
            {(project.clientQuote.author || project.clientQuote.role) && (
              <footer className="mt-3 text-sm text-foreground/50">
                {project.clientQuote.author}
                {project.clientQuote.role && `, ${project.clientQuote.role}`}
              </footer>
            )}
          </blockquote>
        </div>
      )}

      {/* Gallery */}
      {hasGallery && (
        <div className="w-full bg-background px-6 py-8 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {project.gallery.map((img: any, i: number) => {
              const imgUrl = sanityImageUrl(img, 1200) ?? PLACEHOLDER_IMAGE;
              return (
                <div key={img.asset?._id ?? i} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={imgUrl}
                    alt={img.alt ?? ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {img.caption && (
                    <p className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-sm px-4 py-2">
                      {img.caption}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Approach */}
      {hasApproach && (
        <div className="w-full bg-background px-6 py-12 md:px-12 lg:px-24 max-w-3xl mx-auto">
          <div className="text-foreground font-light space-y-6 text-lg leading-relaxed [&>p]:mb-0">
            <p className="text-2xl font-bold text-center">The approach</p>
            <PortableText value={project.approach} />
          </div>
        </div>
      )}

      {/* Outcome */}
      {hasOutcome && (
        <div className="w-full bg-background px-6 py-12 md:px-12 lg:px-24 max-w-3xl mx-auto">
          <div className="text-foreground font-light space-y-6 text-lg leading-relaxed [&>p]:mb-0">
            <p className="text-2xl font-bold text-center">What changed</p>
            <PortableText value={project.outcome} />
          </div>
        </div>
      )}

      {/* Related projects */}
      {project.relatedProjects && project.relatedProjects.length > 0 && (
        <div className="w-full bg-background px-6 py-12 md:px-12 lg:px-24">
          <h2 className="text-2xl font-bold text-center mb-8">Related projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {project.relatedProjects.map((rp: any) => {
              const rpImg = sanityImageUrl(rp.heroImage, 800) ?? PLACEHOLDER_IMAGE;
              return (
                <Link
                  key={rp._id}
                  href={`/projects/${rp.slug?.current}`}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100"
                >
                  <Image
                    src={rpImg}
                    alt={rp.heroImage?.alt ?? rp.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-xs uppercase tracking-wider text-white/70">{rp.client}</p>
                    <p className="text-lg font-light text-white">{rp.title}</p>
                  </div>
                </Link>
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
          href="/about#aboutContact"
          className="w-full rounded-full md:w-1/2 h-[30vh] md:h-[50vh] flex items-center justify-center border border-foreground text-foreground font-light text-2xl md:text-3xl tracking-wide transition-[box-shadow,background-color,color] duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-inset focus:ring-background/30 shrink-0 hover:[box-shadow:inset_0_0_100px_0_rgba(255,82,82,0.85)]"
          aria-label="Contact us"
        >
          Contact us
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
