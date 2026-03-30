"use client";

import { useRef, useEffect, useState } from "react";

type FittingTextareaProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
};

export default function FittingTextarea({
  value,
  onChange,
  placeholder = "Type your message…",
  className = "",
  containerClassName = "",
}: FittingTextareaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [fontSize, setFontSize] = useState(120);

  useEffect(() => {
    const container = containerRef.current;
    const ta = textareaRef.current;
    if (!container || !ta) return;

    const fit = () => {
      let size = 120;
      ta.style.fontSize = `${size}px`;
      ta.style.height = "100%";
      // Wait for layout, then shrink until content fits
      requestAnimationFrame(() => {
        while (
          size > 14 &&
          (ta.scrollHeight > ta.clientHeight || ta.scrollWidth > ta.clientWidth)
        ) {
          size -= 4;
          ta.style.fontSize = `${size}px`;
        }
        setFontSize(size);
      });
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(container);
    return () => ro.disconnect();
  }, [value]);

  return (
    <div ref={containerRef} className={`w-full overflow-hidden ${containerClassName}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ fontSize: `${fontSize}px` }}
        className={`w-full h-fit min-h-0 resize-none border-none bg-transparent font-light text-foreground placeholder:text-foreground/40 outline-none p-6 md:p-8 lg:p-12 ${className}`}
        aria-label="Message"
      />
    </div>
  );
}
