"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HomePageClient, { type HomeData } from "./HomePageClient";
import { useIsMobile } from "../hooks/useIsMobile";
import { type Connection, type Project } from "./projectNetworkData";

// MobilePageClient is mobile-only; lazy-load it so its bundle doesn't
// ship to desktop visitors who will never render it.
const MobilePageClient = dynamic(() => import("./mobile/MobilePageClient"), {
  ssr: false,
});

export type MobileContactLocation = {
  title: string;
  address: string;
  description: string;
  zoom?: number;
};

type Props = {
  data: HomeData;
  projects: Project[];
  connections: Connection[];
  /** Mobile-only: locations rendered as the contact-section blocks. */
  mobileContactLocations?: MobileContactLocation[];
};

/**
 * Picks the desktop horizontal-scroll experience or the mobile vertical-scroll
 * experience based on viewport width. Renders nothing on the first paint
 * (before the matchMedia result is known) to avoid hydration mismatch and
 * to keep the heavy desktop landing layer from mounting on phones.
 */
export default function ResponsiveHome(props: Props) {
  const isMobile = useIsMobile();
  useReopenPublicationModal();

  if (isMobile === null) return null;
  if (isMobile) {
    return (
      <MobilePageClient
        data={props.data}
        projects={props.projects}
        connections={props.connections}
        contactLocations={props.mobileContactLocations}
      />
    );
  }
  // Desktop: drop the mobile-only prop so HomePageClient sees its
  // original prop shape unchanged.
  return (
    <HomePageClient
      data={props.data}
      projects={props.projects}
      connections={props.connections}
    />
  );
}

/**
 * Reopens the publication bottom-sheet modal when the homepage is hit
 * with `?openpub=<slug>`. Used by the standalone publication page when
 * the user returns from Stripe so the experience snaps back to the
 * intercepting modal route rather than leaving them on the full page.
 *
 * `router.replace` (not `push`) so the `?openpub` history entry is
 * overwritten — otherwise the browser back button would loop the user
 * straight back into this hook.
 */
function useReopenPublicationModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openPub = searchParams?.get("openpub") ?? null;
  const canceled = searchParams?.get("canceled") ?? null;

  useEffect(() => {
    if (!openPub) return;
    const target = `/publications/${openPub}${canceled ? "?canceled=1" : ""}`;
    router.replace(target);
  }, [openPub, canceled, router]);
}
