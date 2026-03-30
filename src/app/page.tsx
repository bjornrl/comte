"use client";

import { useRef, useState } from "react";
import HorizontalScroll, { type HorizontalScrollNavApi } from "./components/HorizontalScroll";
import BlobNav from "./components/BlobNav";
import ArrowBlob from "./components/ArrowBlob";

export default function Home() {
  const scrollNavRef = useRef<HorizontalScrollNavApi | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  return (
    <div className="h-screen overflow-hidden">
      <BlobNav />
      <ArrowBlob navRef={scrollNavRef} activeIndex={activeSlideIndex} />
      <HorizontalScroll navRef={scrollNavRef} onActiveIndexChange={setActiveSlideIndex} />
    </div>
  );
}
