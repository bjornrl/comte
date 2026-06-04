"use client";

import { useEffect, useState } from "react";

export const SECTION_PRIME_EVENT = "comte:section-prime";

type SectionPrimeDetail = { sectionId: string };

/** Dispatch when navbar navigation targets a section — sections restart
 *  entry animations on this event so motion begins during the scroll, not
 *  after the snap lands. */
export function dispatchSectionPrime(sectionId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<SectionPrimeDetail>(SECTION_PRIME_EVENT, {
      detail: { sectionId },
    }),
  );
}

/**
 * Returns a monotonically increasing epoch for the given section. Increments
 * when that section is the target of navbar navigation. Use as a React `key`
 * or effect dependency to restart entry animations.
 *
 * @param primeOnMount — when true, epoch starts at 1 so the landing section
 *   animates on first paint without waiting for a nav event.
 */
export function useSectionPrime(
  sectionId: string,
  options?: { primeOnMount?: boolean },
): number {
  const [epoch, setEpoch] = useState(options?.primeOnMount ? 1 : 0);

  useEffect(() => {
    const onPrime = (e: Event) => {
      const detail = (e as CustomEvent<SectionPrimeDetail>).detail;
      if (detail?.sectionId === sectionId) {
        setEpoch((n) => n + 1);
      }
    };
    window.addEventListener(SECTION_PRIME_EVENT, onPrime);
    return () => window.removeEventListener(SECTION_PRIME_EVENT, onPrime);
  }, [sectionId]);

  return epoch;
}
