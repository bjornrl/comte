"use client";

import { useRef, useEffect, useState } from "react";

export default function FittingHeadline({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [fontSize, setFontSize] = useState(120);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const fit = () => {
      let size = 200;
      text.style.fontSize = `${size}px`;
      while (
        size > 12 &&
        (text.scrollWidth > container.clientWidth || text.scrollHeight > container.clientHeight)
      ) {
        size -= 4;
        text.style.fontSize = `${size}px`;
      }
      setFontSize(size);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(container);
    return () => ro.disconnect();
  }, [children]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 flex items-center justify-center overflow-hidden w-full px-4"
    >
      <h1
        ref={textRef}
        style={{ fontSize: `${fontSize}px` }}
        className="font-light text-foreground text-center leading-[0.92]"
      >
        {children}
      </h1>
    </div>
  );
}
