"use client";

import { useRef } from "react";
import HorizontalScroll, {
  type HorizontalScrollNavApi,
} from "./components/HorizontalScroll";
import BlobNav from "./components/BlobNav";
import ArrowBlob from "./components/ArrowBlob";

export default function Home() {
  const scrollNavRef = useRef<HorizontalScrollNavApi | null>(null);

  return (
    <div className="h-screen overflow-hidden">
      <BlobNav />
      <ArrowBlob navRef={scrollNavRef} />
      <HorizontalScroll navRef={scrollNavRef} />
    </div>
  );
}
