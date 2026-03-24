"use client";

import Image from "next/image";
import BlobNav from "../../components/BlobNav";
import Footer from "../../components/Footer";
import PersonCard from "../../components/PersonCard";
import { comteColors } from "@/lib/comte-colors";

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

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
      <BlobNav />
      <div className="w-full h-[50vh] flex flex-col items-start justify-end pt-12 bg-background">
        <h1 className="text-5xl font-light text-foreground">We are a multidisciplinary innovation agency that designs the human-centered services, products, organizations, physical environments and experiences of the future. </h1>
      </div>
      <div className="w-full bg-background px-6 md:px-12 lg:px-24 py-8">
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={PLACEHOLDER_IMAGE}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 70vw"
            priority
          />
        </div>
      </div>
      <section id="aboutAugustComte" className="w-full min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-screen">
            <Image
              src={PLACEHOLDER_IMAGE}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-16 lg:px-16 lg:py-24 xl:px-24">
            <h2
              className="text-3xl md:text-4xl font-light text-foreground tracking-tight mb-6"
              style={{ fontFamily: "var(--font-neue-haas)" }}
            >
              Auguste Comte
            </h2>
            <p className="text-foreground/80 font-light text-lg leading-relaxed mb-6">
              Auguste Comte (1798–1857) was a French philosopher and writer who founded the discipline of sociology and the doctrine of positivism. He believed that society, like the physical world, operates according to general laws that can be studied scientifically.
            </p>
            <p className="text-foreground/80 font-light text-lg leading-relaxed mb-6">
              Comte introduced the idea of the “law of three stages”—theological, metaphysical, and positive—to describe how human thought and society evolve. In the positive stage, explanation is based on observation and scientific method rather than speculation or superstition.
            </p>
            <p className="text-foreground/80 font-light text-lg leading-relaxed">
              His work influenced later thinkers across sociology, philosophy, and political theory, and his emphasis on order, progress, and scientific knowledge still shapes how we think about modern society.
            </p>
          </div>
        </div>
      </section>
      <div className="w-full h-[50vh] flex flex-col items-start justify-end pt-12 bg-background">
        <h1 className="text-5xl font-light text-foreground">Our team consists of designers, architects, doctors, psycologists, developers, thinkers and innovators.</h1>
      </div>
      <div
        className="w-full grid grid-cols-1 h-fit md:grid-cols-2 lg:grid-cols-4 gap-2 bg-background pt-2 pb-2"

      >
        <PersonCard
          title="Daglig leder"
          name="Øystein Evensen"
          description="We design human-centered services and experiences—connecting strategy, design, and delivery to create innovation with societal impact."
          imageUrl={PLACEHOLDER_IMAGE}
          email="hello@comtebureau.com"
          hoverTextColor={HOVER_PALETTE[0].text}
          hoverMetaTextColor={HOVER_PALETTE[0].meta}
          hoverOverlayColor={HOVER_PALETTE[0].overlay}
          cursor={
            <div className="h-20 w-20 rounded-full border border-background/40 bg-background/90 text-foreground flex items-center justify-center text-sm font-medium tracking-wide shadow-lg">
              Les mer
            </div>
          }
        />
        <PersonCard
          title="Designer"
          name="Herman Billett"
          description="We design human-centered services and experiences—connecting strategy, design, and delivery to create innovation with societal impact."
          imageUrl={PLACEHOLDER_IMAGE}
          email="hello@comtebureau.com"
          hoverTextColor={HOVER_PALETTE[1].text}
          hoverMetaTextColor={HOVER_PALETTE[1].meta}
          hoverOverlayColor={HOVER_PALETTE[1].overlay}
          cursor={
            <div className="h-20 w-20 rounded-full border border-background/40 bg-background/90 text-foreground flex items-center justify-center text-sm font-medium tracking-wide shadow-lg">
              Les mer
            </div>
          }
        />
        <PersonCard
          title="Arkitekt & styremedlem"
          name="Joana Sa Lima"
          description="We design human-centered services and experiences—connecting strategy, design, and delivery to create innovation with societal impact."
          imageUrl={PLACEHOLDER_IMAGE}
          email="hello@comtebureau.com"
          hoverTextColor={HOVER_PALETTE[2].text}
          hoverMetaTextColor={HOVER_PALETTE[2].meta}
          hoverOverlayColor={HOVER_PALETTE[2].overlay}
          cursor={
            <div className="h-20 w-20 rounded-full border border-background/40 bg-background/90 text-foreground flex items-center justify-center text-sm font-medium tracking-wide shadow-lg">
              Les mer
            </div>
          }
        />
        <PersonCard
          title="Tjenestedeisgner"
          name="Bjørn Ravlo-Leira"
          description="We design human-centered services and experiences—connecting strategy, design, and delivery to create innovation with societal impact."
          imageUrl={PLACEHOLDER_IMAGE}
          email="hello@comtebureau.com"
          hoverTextColor={HOVER_PALETTE[3].text}
          hoverMetaTextColor={HOVER_PALETTE[3].meta}
          hoverOverlayColor={HOVER_PALETTE[3].overlay}
          cursor={
            <div className="h-20 w-20 rounded-full border border-background/40 bg-background/90 text-foreground flex items-center justify-center text-sm font-medium tracking-wide shadow-lg">
              Les mer
            </div>
          }
        />

      </div>

      <Footer />
    </div>
  );
}

