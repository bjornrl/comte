"use client";

import Image from "next/image";
import BlobNav from "../components/BlobNav";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const GRID_ITEMS = [
  { title: "Item one" },
  { title: "Item two" },
  { title: "Item three" },
  { title: "Item four" },
  { title: "Item five" },
  { title: "Item six" },
  { title: "Item seven" },
  { title: "Item eight" },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
      <BlobNav />
      <div className="w-full h-fit min-h-screen bg-white px-24 py-32">
        <div className="rounded-xl border border-black/30 bg-[#EEEEEE] p-6">
          <div className="grid grid-cols-2 grid-rows-4 gap-6">
            {GRID_ITEMS.map((item, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden bg-gray-100"
              >
                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden">
                  <Image
                    src={PLACEHOLDER_IMAGE}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>
                <p className="py-3 text-3xl font-light bg-[#EEEEEE]">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
