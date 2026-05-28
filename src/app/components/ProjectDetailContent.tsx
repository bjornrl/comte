import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { DOMAIN_LABELS, type Domain } from "@/app/components/projectNetworkData";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop";

function sanityImageUrl(imageField: any, width = 1600): string | null {
  if (!imageField?.asset) return null;
  return urlFor(imageField).width(width).auto("format").quality(80).url();
}

type Props = {
  project: any;
  variant?: "page" | "sheet";
};

export default function ProjectDetailContent({ project, variant = "page" }: Props) {
  const gallery: any[] = project.gallery ?? [];
  const heroImage = gallery[0];
  const heroUrl = sanityImageUrl(heroImage) ?? PLACEHOLDER_IMAGE;
  const heroAlt = heroImage?.alt ?? project.title ?? "";

  const tags: string[] = project.tags ?? [];
  const links: { label: string; url: string }[] = project.links ?? [];
  const responsible: {
    name?: string;
    role?: string;
    email?: string;
    phone?: string;
    photoUrl?: string;
  } | null = project.responsible ?? null;
  const isSheet = variant === "sheet";

  return (
    <>
      <div
        className={`w-full flex flex-col items-center justify-start bg-background px-4 ${
          isSheet ? "pt-4 pb-4" : "pt-20 pb-8 sm:px-6 lg:h-[80vh] lg:pt-12"
        }`}
      >
        {!isSheet && (
          <h1
            className="font-[family-name:var(--font-manrope)] font-bold leading-tight text-center"
            style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}
          >
            {project.title}
          </h1>
        )}
        <p
          className="italic text-base sm:text-xl text-gray-500"
          style={{ marginTop: isSheet ? 0 : 8 }}
        >
          {project.year}
        </p>
        <p className="text-base sm:text-xl text-gray-500">{project.client}</p>
      </div>

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

      {project.summary && (
        <div className="mx-auto w-full max-w-3xl bg-background px-4 py-8 sm:px-6 md:px-12 md:py-12">
          <p className="text-foreground/85 text-base sm:text-lg font-light leading-relaxed whitespace-pre-line">
            {project.summary}
          </p>
        </div>
      )}

      {tags.length > 0 && (
        <div className="mx-auto w-full max-w-3xl bg-background px-4 pb-6 sm:px-6 md:px-12 md:pb-8">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="border border-foreground/20 px-3 py-1 text-sm font-light text-foreground/70"
              >
                {DOMAIN_LABELS[tag as Domain] ?? tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {links.length > 0 && (
        <div className="mx-auto w-full max-w-3xl bg-background px-4 pb-8 sm:px-6 md:px-12 md:pb-12">
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

      {gallery.length > 1 && (
        <div className="w-full bg-background px-4 py-6 sm:px-6 md:px-12 md:py-8 lg:px-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {gallery.slice(1).map((img: any, i: number) => {
              const imgUrl = sanityImageUrl(img, 1200) ?? PLACEHOLDER_IMAGE;
              return (
                <div
                  key={img.asset?._id ?? i}
                  className="relative aspect-[4/3] overflow-hidden bg-gray-100"
                >
                  <Image
                    src={imgUrl}
                    alt={img.alt ?? ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
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

      {responsible && (responsible.name || responsible.photoUrl) && (
        <div
          className="w-full px-4 py-10 sm:px-6 md:px-12 lg:px-24 md:py-16"
          style={{ background: "#5F7C8B", color: "#F5F5E9" }}
        >
          <h2
            className="font-[family-name:var(--font-manrope)] font-bold leading-tight"
            style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)", marginBottom: 24 }}
          >
            Want to know more about the project?
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {responsible.photoUrl && (
              <div
                className="relative shrink-0 overflow-hidden bg-black/10"
                style={{ width: 112, height: 112 }}
              >
                <Image
                  src={responsible.photoUrl}
                  alt={responsible.name ?? ""}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex flex-col gap-1 font-[family-name:var(--font-manrope)]">
              {responsible.name && (
                <p className="text-lg font-semibold leading-tight">
                  {responsible.name}
                </p>
              )}
              {responsible.role && (
                <p className="text-sm opacity-80">{responsible.role}</p>
              )}
              {responsible.email && (
                <a
                  href={`mailto:${responsible.email}`}
                  className="mt-2 text-sm underline-offset-4 hover:underline"
                  style={{ color: "#FFF8F2" }}
                >
                  {responsible.email}
                </a>
              )}
              {responsible.phone && (
                <a
                  href={`tel:${responsible.phone.replace(/\s+/g, "")}`}
                  className="text-sm underline-offset-4 hover:underline"
                  style={{ color: "#FFF8F2" }}
                >
                  {responsible.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {!isSheet && (
        <>
          <div className="w-full bg-background px-4 sm:px-6 md:px-2 pt-12 pb-6 md:pb-0 md:h-[50vh] flex flex-col items-start justify-end">
            <h2 className="text-3xl sm:text-4xl md:text-5xl py-6 md:py-12 font-light text-foreground leading-tight">
              Do you have any questions regarding this project?
            </h2>
          </div>
          <div className="w-full flex flex-col md:flex-row md:items-stretch gap-2 py-2 p-0">
            <Link
              href="/about"
              className="w-full md:w-1/2 h-[30vh] md:h-[50vh] flex items-center justify-center border border-foreground text-foreground font-light text-2xl md:text-3xl tracking-wide transition-[box-shadow,background-color,color] duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-inset focus:ring-background/30 shrink-0 hover:[box-shadow:inset_0_0_100px_0_rgba(255,82,82,0.85)]"
              aria-label="Get in touch"
            >
              Get in touch
            </Link>
            <div className="relative h-[30vh] w-full md:h-[50vh] md:w-1/2 overflow-hidden">
              <Image
                src={heroUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
