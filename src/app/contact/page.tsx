"use client";

import { useState } from "react";
import Image from "next/image";
import BlobNav from "../components/BlobNav";
import FittingTextarea from "../components/FittingTextarea";
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

export default function ContactPage() {
    const [message, setMessage] = useState("");

    return (
        <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
            <BlobNav />
            <div className="w-full h-[50vh] flex flex-col items-start justify-end pt-12 bg-white">
                <h1 className="text-5xl font-light text-black">Contact</h1>
            </div>
            <div
                className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 bg-white pt-2 pb-2"
                style={{ height: "calc(100vh - 5rem)" }}
            >

                <div className="relative overflow-hidden min-h-0 rounded-lg">
                    <Image
                        src={PLACEHOLDER_IMAGE}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                </div>
                <div className="relative overflow-hidden min-h-0 rounded-lg bg-gray-100">
                    <span className="p-6 flex items-start justify-start text-2xl font-light text-black/50">
                        Comte Bureau
                        Org. nr. 917 584 678
                        Mail: hello@comtebureau.com
                        Phone: +47 123 45 678
                        Address: Example Street 1, Oslo, Norway
                        Hours: Mon–Fri 09:00–17:00
                    </span>
                </div>
                <div className="relative overflow-hidden min-h-0 rounded-lg">
                    <Image
                        src={PLACEHOLDER_IMAGE}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                </div>
                <div className="relative overflow-hidden min-h-0 rounded-lg h-full w-full">
                    <Map center={[10.736009, 59.9201993]} zoom={12} className="rounded-lg">
                        <MapControls />
                        <MapMarker longitude={10.736009} latitude={59.9201993}>
                            <MarkerContent>
                                <div className="size-4 rounded-full bg-[#1a1a1a] border-2 border-white shadow-lg" />
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

            <section className="w-full bg-white">
                <div
                    className="w-full border-y border-[#1a1a1a]/10"
                    style={{ height: "90vh" }}
                >
                    <FittingTextarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message…"
                        containerClassName="flex-1 min-h-0"
                    />
                </div>

                <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-6 px-6 py-8 md:px-12 lg:px-24 border-b border-[#1a1a1a]/10">
                    <button
                        type="button"
                        className="px-8 py-4 bg-[#1a1a1a] text-white font-light text-lg tracking-wide hover:bg-[#1a1a1a]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:ring-offset-2"
                        aria-label="Send message"
                    >
                        Send
                    </button>
                    <div className="flex flex-col gap-1 text-[#1a1a1a]/70 font-light text-lg">
                        <a href="mailto:hello@example.com" className="hover:text-[#1a1a1a] transition-colors">
                            hello@example.com
                        </a>
                        <a href="tel:+4712345678" className="hover:text-[#1a1a1a] transition-colors">
                            +47 123 45 678
                        </a>
                        <span>Oslo, Norway</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
