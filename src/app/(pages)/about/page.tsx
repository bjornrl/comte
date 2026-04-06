export const revalidate = 60;

import Image from "next/image";
import BlobNav from "../../components/BlobNav";
import Footer from "../../components/Footer";
import PersonCard from "../../components/PersonCard";
import ContactForm from "../../components/ContactForm";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from "@/components/ui/map";
import { comteColors } from "@/lib/comte-colors";
import { client } from "@/sanity/lib/client";
import { ABOUT_QUERY, TEAM_QUERY, CONTACT_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const HOVER_PALETTE = [
  {
    overlay: comteColors.nearBlack,
    text: comteColors.cream,
    meta: "rgba(251, 246, 239, 0.82)",
  },
  {
    overlay: comteColors.darkGreen,
    text: comteColors.lightBase,
    meta: "rgba(249, 249, 237, 0.78)",
  },
  {
    overlay: comteColors.deepRed,
    text: comteColors.cream,
    meta: "rgba(251, 246, 239, 0.84)",
  },
  {
    overlay: comteColors.coolBlue,
    text: comteColors.cream,
    meta: "rgba(251, 246, 239, 0.8)",
  },
] as const;

function sanityImageUrl(imageField: any, width = 1600): string | null {
  if (!imageField?.asset) return null;
  return urlFor(imageField).width(width).auto("format").quality(80).url();
}

export default async function AboutPage() {
  let aboutData = null;
  let teamMembers = null;
  let contactData = null;
  try {
    [aboutData, teamMembers, contactData] = await Promise.all([
      client.fetch(ABOUT_QUERY),
      client.fetch(TEAM_QUERY),
      client.fetch(CONTACT_QUERY),
    ]);
  } catch {}

  const introText =
    aboutData?.intro
      ?.map((block: any) => block.children?.map((child: any) => child.text).join(""))
      .join(" ") ??
    "We are a multidisciplinary innovation agency that designs the human-centered services, products, organizations, physical environments and experiences of the future.";

  const sections = aboutData?.sections ?? [];
  const heroImageUrl = sanityImageUrl(aboutData?.heroImage) ?? PLACEHOLDER_IMAGE;
  const heroAlt = aboutData?.heroImage?.alt ?? "";
  const teamHeading =
    aboutData?.teamHeading ??
    "Our team consists of designers, architects, doctors, psychologists, developers, thinkers and innovators.";
  const contact = contactData ?? {
    email: "hello@comtebureau.com",
    phone: "+47 123 45 678",
    address: "Pilestredet Park 31\nOslo, Norway",
  };

  return (
    <div
      style={{ minHeight: "100svh", overflowY: "auto", height: "100vh", scrollBehavior: "smooth" }}
    >
      <BlobNav />
      <div className="w-full px-2 h-[70svh] md:h-[50vh] flex flex-col items-start justify-end py-8 md:py-12 bg-background">
        <h1 className="max-w-[75ch] font-light text-foreground leading-[1.15] text-[clamp(2rem,8vw,3rem)]">
          {introText}
        </h1>
      </div>
      <div className="w-full bg-background px-2 pb-8">
        <div className="flex w-full flex-col justify-center items-center gap-2 md:flex-row">
          <a
            href="#aboutContact"
            className="w-30 rounded-full h-8 flex items-center justify-center border border-foreground bg-background text-foreground font-light hover:cursor-pointer text-xl tracking-wide hover:bg-foreground/10 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-background/30"
            aria-label="Go to contact section"
          >
            Contact
          </a>
          <a
            href="#employees"
            className="w-30 rounded-full h-8 flex items-center justify-center border border-foreground bg-background text-foreground font-light hover:cursor-pointer text-xl tracking-wide hover:bg-foreground/10 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-background/30"
            aria-label="Go to employees section"
          >
            Employees
          </a>
        </div>
      </div>

      {/* Hero image from Sanity */}
      <div className="w-full bg-background px-6 md:px-12 lg:px-24 py-8">
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={heroImageUrl}
            alt={heroAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 70vw"
            priority
          />
        </div>
      </div>

      {/* Content sections from Sanity (e.g. Auguste Comte) */}
      {sections.map((section: any, idx: number) => {
        const sectionImageUrl = sanityImageUrl(section.image) ?? PLACEHOLDER_IMAGE;
        const sectionAlt = section.image?.alt ?? "";

        return (
          <section key={section._key ?? idx} className="w-full min-h-screen px-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
              <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-screen">
                <Image
                  src={sectionImageUrl}
                  alt={sectionAlt}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="flex flex-col justify-center px-6 py-16 lg:px-16 lg:py-24 xl:px-24">
                <h2
                  className="text-3xl md:text-4xl font-light text-foreground tracking-tight mb-6"
                  style={{ fontFamily: "var(--font-neue-haas)" }}
                >
                  {section.heading}
                </h2>
                {section.body && (
                  <div className="text-foreground/80 font-light text-lg leading-relaxed [&>p]:mb-6 [&>p:last-child]:mb-0">
                    <PortableText value={section.body} />
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}

      {/* Team section */}
      <div
        id="employees"
        className="w-full px-2 h-[70svh] md:h-[50vh] flex flex-col items-start justify-end py-8 md:py-12 bg-background"
      >
        <h1 className="max-w-[75ch] font-light text-foreground leading-[1.15] text-[clamp(2rem,8vw,3rem)] pb-8">
          {teamHeading}
        </h1>
      </div>
      <div className="w-full py-8 px-2 grid grid-cols-1 h-fit md:grid-cols-2 lg:grid-cols-4 gap-2 bg-background pt-2 pb-2">
        {(teamMembers ?? []).map((member: any, i: number) => {
          const palette = HOVER_PALETTE[i % HOVER_PALETTE.length];
          const bio =
            member.bio
              ?.map((block: any) => block.children?.map((child: any) => child.text).join(""))
              .join(" ") ?? "";
          const photoUrl = sanityImageUrl(member.photo, 800) ?? PLACEHOLDER_IMAGE;

          return (
            <PersonCard
              key={member._id}
              title={member.role}
              name={member.name}
              description={bio}
              imageUrl={photoUrl}
              email={member.email}
              hoverTextColor={palette.text}
              hoverMetaTextColor={palette.meta}
              hoverOverlayColor={palette.overlay}
              cursor={
                <div className="h-24 w-24 rounded-full border border-background/40 bg-background/90 text-foreground flex items-center justify-center text-xs font-medium tracking-wide shadow-lg text-center leading-tight px-2">
                  Send mail til {member.name.split(" ")[0]}
                </div>
              }
            />
          );
        })}
      </div>

      {/* Contact section */}
      <section id="aboutContact" className="relative z-20 w-full bg-background px-2">
        <div className="w-full h-[40vh] flex flex-col items-start justify-end pt-12 bg-background">
          <h1 className="text-5xl font-light text-foreground">Contact</h1>
        </div>
        <div className="relative z-0 grid h-auto w-full grid-cols-1 gap-2 pt-2 pb-2 md:h-[50vh] md:grid-cols-2 lg:grid-cols-4">
          <div className="relative min-h-[45vh] overflow-hidden rounded-lg md:min-h-0">
            <Image
              src={PLACEHOLDER_IMAGE}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
          <div className="relative min-h-[45vh] overflow-hidden rounded-lg bg-comte-coral md:min-h-0">
            <span className="p-6 flex items-start justify-start text-2xl font-light text-comte-cream">
              Comte Bureau <br />
              Org. nr. 917 584 678 <br />
              {contact.email} <br />
              {contact.phone} <br />
              {contact.address?.split("\n")[0]} <br />
              Mon-Fri 09:00-17:00 <br />
            </span>
          </div>
          <div className="relative min-h-[45vh] overflow-hidden rounded-lg md:min-h-0">
            <Image
              src={PLACEHOLDER_IMAGE}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
          <div className="relative isolate z-0 min-h-[45vh] w-full overflow-hidden rounded-lg md:min-h-0 md:h-full">
            <Map center={[10.736009, 59.9201993]} zoom={12} className="rounded-lg comte-map">
              <MapControls />
              <MapMarker longitude={10.736009} latitude={59.9201993}>
                <MarkerContent>
                  <div className="size-4 rounded-full bg-foreground border-2 border-background shadow-lg" />
                </MarkerContent>
                <MarkerTooltip>Comte Bureau</MarkerTooltip>
                <MarkerPopup>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Comte Bureau</p>
                    <p className="text-xs text-muted-foreground">
                      {(59.9201993).toFixed(4)}, {(10.736009).toFixed(4)}
                    </p>
                  </div>
                </MarkerPopup>
              </MapMarker>
            </Map>
          </div>
        </div>

        <ContactForm />
      </section>

      <Footer />
    </div>
  );
}
