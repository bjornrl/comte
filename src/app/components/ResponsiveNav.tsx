"use client";

import { useIsMobile } from "../hooks/useIsMobile";
import BlobNav from "./BlobNav";
import MobileNav from "./mobile/MobileNav";

type Props = {
  /** Forwarded to MobileNav for highlighting the current section in the
   *  drawer. Ignored on desktop. */
  activeSection?: string;
};

/**
 * Picks the desktop or mobile nav based on viewport width. Mirrors how
 * ResponsiveHome splits the homepage, so detail pages get the same nav
 * treatment as the landing page.
 */
export default function ResponsiveNav({ activeSection }: Props) {
  const isMobile = useIsMobile();
  if (isMobile === null) return null;
  return isMobile ? <MobileNav activeSection={activeSection} /> : <BlobNav />;
}
