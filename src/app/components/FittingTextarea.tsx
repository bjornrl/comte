"use client";

import { useRef, useLayoutEffect } from "react";

type FittingTextareaProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
};

const MAX_FONT_PX = 120;
const MIN_FONT_PX = 14;

function fitFontToContainer(ta: HTMLTextAreaElement) {
  ta.style.height = "100%";

  const clientH = ta.clientHeight;
  const clientW = ta.clientWidth;
  if (clientH < 8 || clientW < 8) {
    ta.style.fontSize = `${MIN_FONT_PX}px`;
    return;
  }

  let low = MIN_FONT_PX;
  let high = MAX_FONT_PX;
  let best = MIN_FONT_PX;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    ta.style.fontSize = `${mid}px`;
    void ta.offsetHeight;

    const overflowY = ta.scrollHeight > ta.clientHeight + 1;
    const overflowX = ta.scrollWidth > ta.clientWidth + 1;

    if (!overflowY && !overflowX) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  ta.style.fontSize = `${best}px`;
}

export default function FittingTextarea({
  value,
  onChange,
  placeholder = "Type your message…",
  className = "",
  containerClassName = "",
}: FittingTextareaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rafRef = useRef<number>(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const ta = textareaRef.current;
    if (!container || !ta) return;

    const runFit = () => {
      fitFontToContainer(ta);
    };

    const scheduleFit = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(runFit);
    };

    // Measure before paint on mount / value change
    runFit();

    const ro = new ResizeObserver(scheduleFit);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [value]);

  return (
    <div ref={containerRef} className={`w-full overflow-hidden ${containerClassName}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full h-full min-h-0 resize-none border-none bg-transparent font-light text-foreground placeholder:text-foreground/40 outline-none p-4 md:p-6 lg:p-8 ${className}`}
        aria-label="Message"
      />
    </div>
  );
}
