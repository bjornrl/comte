"use client";

import Image from "next/image";
import BlobNav from "../../components/BlobNav";
import Footer from "../../components/Footer";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100svh", overflowY: "auto", height: "100vh" }}>
      <BlobNav />
      <div className="w-full h-[50vh] flex flex-col items-start justify-end pt-12 bg-white">
        <h1 className="text-5xl font-light text-black">We are a multidisciplinary innovation agency that designs the human-centered services, products, organizations, physical environments and experiences of the future. </h1>
      </div>
      <div
        className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 bg-white pt-2 pb-2"
        style={{ height: "calc(100vh - 5rem)" }}
      >
        <div className="relative overflow-hidden min-h-0 rounded-lg bg-gray-100">
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-light text-black/50">
            1
          </span>
        </div>
        <div className="relative overflow-hidden min-h-0 rounded-lg bg-gray-100">
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-light text-black/50">
            2
          </span>
        </div>
        <div className="relative overflow-hidden min-h-0 rounded-lg bg-gray-100">
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-light text-black/50">
            3
          </span>
        </div>
        <div className="relative overflow-hidden min-h-0 rounded-lg bg-gray-100">
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-light text-black/50">
            4
          </span>
        </div>
      </div>
      <section className="w-full min-h-screen bg-[#fafafa]">
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
              className="text-3xl md:text-4xl font-light text-[#1a1a1a] tracking-tight mb-6"
              style={{ fontFamily: "var(--font-neue-haas)" }}
            >
              Auguste Comte
            </h2>
            <p className="text-[#1a1a1a]/80 font-light text-lg leading-relaxed mb-6">
              Auguste Comte (1798–1857) was a French philosopher and writer who founded the discipline of sociology and the doctrine of positivism. He believed that society, like the physical world, operates according to general laws that can be studied scientifically.
            </p>
            <p className="text-[#1a1a1a]/80 font-light text-lg leading-relaxed mb-6">
              Comte introduced the idea of the “law of three stages”—theological, metaphysical, and positive—to describe how human thought and society evolve. In the positive stage, explanation is based on observation and scientific method rather than speculation or superstition.
            </p>
            <p className="text-[#1a1a1a]/80 font-light text-lg leading-relaxed">
              His work influenced later thinkers across sociology, philosophy, and political theory, and his emphasis on order, progress, and scientific knowledge still shapes how we think about modern society.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

