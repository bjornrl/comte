"use client";

import { useState } from "react";
import Image from "next/image";
import BlobNav from "../../components/BlobNav";
import Footer from "../../components/Footer";
import PersonCard from "../../components/PersonCard";
import FittingTextarea from "../../components/FittingTextarea";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from "@/components/ui/map";
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh", scrollBehavior: "smooth" }}>
      <BlobNav />
      <div className="w-full px-2 h-[50vh] flex flex-col items-start justify-end pt-12 bg-background">
        <h1 className="text-5xl font-light text-foreground">We are a multidisciplinary innovation agency that designs the human-centered services, products, organizations, physical environments and experiences of the future. </h1>
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
      <section id="aboutAugustComte" className="w-full min-h-screen px-2">
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

      <div id="employees" className="w-full px-2 h-[50vh] flex flex-col items-end justify-end pt-12 bg-background">
        <h1 className="text-5xl font-light text-foreground pb-8">Our team consists of designers, architects, doctors, psycologists, developers, thinkers and innovators.</h1>
      </div>
      <div

        className="w-full py-8 px-2 grid grid-cols-1 h-fit md:grid-cols-2 lg:grid-cols-4 gap-2 bg-background pt-2 pb-2"

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

      </div>
      <section id="aboutContact" className="relative z-20 w-full bg-background px-2">
        <div className="w-full h-[50vh] flex flex-col items-start justify-end pt-12 bg-background">
          <h1 className="text-5xl font-light text-foreground">Contact</h1>
        </div>
        <div className="relative z-0 grid h-auto w-full grid-cols-1 gap-2 pt-2 pb-2 md:h-[calc(100vh-5rem)] md:grid-cols-2 lg:grid-cols-4">

          <div className="relative min-h-[45vh] overflow-hidden rounded-lg md:min-h-0">
            <Image
              src={PLACEHOLDER_IMAGE}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
          <div className="relative min-h-[45vh] overflow-hidden rounded-lg bg-gray-100 md:min-h-0">
            <span className="p-6 flex items-start justify-start text-2xl font-light text-foreground/50">
              Comte Bureau <br />
              Org. nr. 917 584 678 <br />
              hello@comtebureau.com <br />
              +47 123 45 678 <br />
              Pilestredet Park 31 <br />
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
            <Map center={[10.736009, 59.9201993]} zoom={12} className="rounded-lg">
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
                      {59.9201993.toFixed(4)}, {10.736009.toFixed(4)}
                    </p>
                  </div>
                </MarkerPopup>
              </MapMarker>
            </Map>
          </div>
        </div>

        <section className="relative z-20 w-full bg-background">
          <div className="flex h-[30vh] w-full flex-col items-start justify-end bg-background pt-12">
            <h1 className="text-5xl font-light text-foreground">Si hei!</h1>
          </div>

          <div className="relative z-20 h-[65vh] min-h-[320px] w-full border-y border-foreground/10 bg-background md:h-[85vh] md:max-h-[800px]">
            <FittingTextarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              containerClassName="h-full min-h-0"
            />
          </div>

          <div className="w-full flex flex-col md:flex-row gap-2 px-0 py-2">
            <div className="w-full md:w-1/2">
              <label className="sr-only" htmlFor="about-contact-name">
                Name
              </label>
              <input
                id="about-contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full h-fit rounded-full border border-foreground/15 bg-background px-6 py-5 text-lg font-light text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20"
                autoComplete="name"
              />
            </div>
            <div className="w-full md:w-1/2">
              <label className="sr-only" htmlFor="about-contact-email">
                Email
              </label>
              <input
                id="about-contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full h-fit rounded-full border border-foreground/15 bg-background px-6 py-5 text-lg font-light text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="w-full flex flex-col md:flex-row md:items-stretch gap-2 py-2 p-0 border-b border-foreground/10">
            <button
              type="button"
              className="w-full rounded-full md:w-1/2 h-[30vh] md:h-[50vh] flex items-center justify-center bg-foreground text-background font-light hover:cursor-pointer text-2xl md:text-3xl tracking-wide hover:bg-foreground/90 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-background/30 shrink-0"
              aria-label="Send message"
            >
              Send
            </button>
            <div className="flex flex-col gap-1 justify-center text-foreground/70 font-light text-lg px-6 py-8 md:px-0 md:py-0 md:w-1/2">
              <div className="relative overflow-hidden rounded-lg h-full w-full">
                <Image
                  src={PLACEHOLDER_IMAGE}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
            </div>
          </div>
        </section>
      </section>

      <Footer />
    </div>
  );
}

