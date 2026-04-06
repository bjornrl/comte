"use client";

import { useState } from "react";
import Image from "next/image";
import BlobNav from "../../components/BlobNav";
import Footer from "../../components/Footer";
import FittingTextarea from "../../components/FittingTextarea";
import {
    Map,
    MapControls,
    MapMarker,
    MarkerContent,
    MarkerPopup,
    MarkerTooltip,
} from "@/components/ui/map";

const PLACEHOLDER_IMAGE =
    "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

type ContactInfo = {
    heading: string;
    email: string;
    phone: string;
    address: string;
};

export default function ContactPageClient({ contact }: { contact: ContactInfo }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    return (
        <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
            <BlobNav />
            <div className="w-full h-[50vh] flex flex-col items-start justify-end pt-12 bg-background">
                <h1 className="text-5xl font-light text-foreground">{contact.heading}</h1>
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
                        {contact.email} <br />
                        {contact.phone} <br />
                        {contact.address?.split("\n")[0]} <br />
                        Mon–Fri 09:00–17:00 <br />
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
                <div className="flex min-h-[10vh] w-full flex-col items-start justify-end bg-background pb-4 pt-8 md:min-h-0 md:pb-6 md:pt-12">
                    <h1 className="text-5xl font-light text-foreground">Si hei!</h1>
                </div>

                <div className="relative z-20 min-h-[220px] w-full border-y border-foreground/10 bg-background h-[42vh] max-h-[520px] md:h-[48vh] md:max-h-[600px]">
                    <FittingTextarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message…"
                        containerClassName="h-full min-h-0"
                    />
                </div>

                <div className="w-full flex flex-col md:flex-row gap-2 px-0 py-2">
                    <div className="w-full md:w-1/2">
                        <label className="sr-only" htmlFor="contact-name">
                            Name
                        </label>
                        <input
                            id="contact-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Name"
                            className="w-full h-fit rounded-full border border-foreground/15 bg-background px-6 py-5 text-lg font-light text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20"
                            autoComplete="name"
                        />
                    </div>
                    <div className="w-full md:w-1/2">
                        <label className="sr-only" htmlFor="contact-email">
                            Email
                        </label>
                        <input
                            id="contact-email"
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
            <Footer />
        </div>
    );
}
