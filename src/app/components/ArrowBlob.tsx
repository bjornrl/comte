"use client";

import { useEffect, type MutableRefObject } from "react";
import { ArrowLeft, ArrowRight } from "griddy-icons";
import type { HorizontalScrollNavApi } from "./HorizontalScroll";

type ArrowBlobProps = {
  navRef: MutableRefObject<HorizontalScrollNavApi | null>;
  activeIndex?: number;
};

const SLIDE_COUNT = 5;

export default function ArrowBlob({ navRef, activeIndex = 0 }: ArrowBlobProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
          return;
        }
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navRef.current?.goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navRef.current?.goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navRef]);

  return (
    <div className="fixed bottom-10 left-1/2 z-50 flex w-max -translate-x-1/2 flex-col items-center justify-center gap-2 bg-background/10 backdrop-blur-sm rounded-lg px-4 py-2">
      <div className="flex flex-row items-center justify-center gap-2">
        <button
          type="button"
          aria-label="Previous section"
          className="rounded hover:cursor-pointer p-1 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
          onClick={() => navRef.current?.goPrev()}
        >
          <ArrowLeft size={32} />
        </button>
        <button
          type="button"
          aria-label="Next section"
          className="rounded p-1 hover:cursor-pointer transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background"
          onClick={() => navRef.current?.goNext()}
        >
          <ArrowRight size={32} />
        </button>
      </div>

      <div
        aria-label="Slide position"
        className="flex flex-row items-center justify-center gap-2 pb-1"
      >
        {Array.from({ length: SLIDE_COUNT }).map((_, idx) => {
          const isActive = idx === activeIndex;
          return (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={idx}
              className={[
                "size-1.5 rounded-full transition-opacity",
                isActive
                  ? "bg-[var(--comte-dark-green)] opacity-100"
                  : "bg-[var(--comte-light-grey)] opacity-60",
              ].join(" ")}
            />
          );
        })}
      </div>
    </div>
  );
}
