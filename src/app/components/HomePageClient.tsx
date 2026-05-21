"use client";

import { useCallback, useRef, useState } from "react";
import HorizontalScroll, { type HorizontalScrollNavApi } from "./HorizontalScroll";
import BlobNav from "./BlobNav";
import LandingStage from "./LandingStage";
import LandingSpacer from "./LandingSpacer";
import SectionAboutIntro from "./sections/SectionAboutIntro";
import SectionAboutOffice, { type OfficeLocation } from "./sections/SectionAboutOffice";
import SectionWhatWeDo from "./sections/SectionWhatWeDo";
import SectionProjects from "./sections/SectionProjects";
import SectionTeam, { getTeamSectionWidth } from "./sections/SectionTeam";
import SectionCardGrid, { type CardItem } from "./sections/SectionCardGrid";
import SectionContact from "./sections/SectionContact";
import Interstitial, { type InterstitialData } from "./sections/Interstitial";
import { type Project, type Connection, setProjectData } from "./projectNetworkData";
import { HOME_PANEL_VW, MOTTO_DEFAULT_BG, MOTTO_PANEL_VW } from "./homeLayout";
import { comteColors } from "@/lib/comte-colors";

type WithInterstitial = { interstitial?: InterstitialData };

export type HomeData = {
  home: WithInterstitial & {
    showInteractiveNetwork?: boolean;
  };
  motto: WithInterstitial & {
    heroText?: string;
    backgroundColor?: string;
    backgroundVideoUrl?: string;
  };
  aboutIntro: WithInterstitial & {
    imageUrl?: string;
    imageAlt?: string;
    whoIsComteTitle?: string;
    whoIsComte?: string;
    whoAreWeTitle?: string;
    whoAreWe?: string;
  };
  aboutOffice: WithInterstitial & {
    locations: OfficeLocation[];
    mediaImageUrl?: string;
    mediaImageAlt?: string;
    mediaVideoUrl?: string;
  };
  whatWeDo: WithInterstitial & {
    textbox?: string;
    datapoint1?: { value?: string; label?: string };
    datapoint2?: { value?: string; label?: string };
    datapoint3?: { value?: string; label?: string };
  };
  projects: WithInterstitial & { backgroundColor?: string; heading?: string };
  team: WithInterstitial & { heading?: string; members: any[] };
  publications: WithInterstitial & { heading?: string; items: CardItem[] };
  ventures: WithInterstitial & { heading?: string; items: CardItem[] };
  contact: WithInterstitial & {
    block1Title?: string;
    block1Body?: string;
    block2Title?: string;
    block2Body?: string;
  };
};

type Props = {
  data: HomeData;
  projects: Project[];
  connections: Connection[];
};

function maybeInterstitial(data: InterstitialData | undefined) {
  if (!data) return undefined;
  if (!data.text && !data.image && !data.videoUrl) return undefined;
  return <Interstitial data={data} />;
}

export default function HomePageClient({ data, projects, connections }: Props) {
  const scrollNavRef = useRef<HorizontalScrollNavApi | null>(null);
  const [activeSection, setActiveSection] = useState<string>("home");
  const [isScrolling, setIsScrolling] = useState(false);
  const [landingEpoch, setLandingEpoch] = useState(1);
  const bumpLandingEpoch = useCallback(() => {
    setLandingEpoch((n) => n + 1);
  }, []);

  const initialized = useRef(false);
  if (!initialized.current) {
    setProjectData(projects, connections);
    initialized.current = true;
  }

  const sections = [
    {
      id: "home",
      content: <LandingSpacer bgColor={comteColors.darkGreen} />,
      interstitial: maybeInterstitial(data.home.interstitial),
      // Wider home pushes the motto / lights panel toward the right edge at
      // the landing snap (~32vw of motto visible).
      width: `${HOME_PANEL_VW}vw`,
    },
    {
      id: "motto",
      content: (
        <LandingSpacer bgColor={data.motto.backgroundColor ?? MOTTO_DEFAULT_BG} />
      ),
      interstitial: maybeInterstitial(data.motto.interstitial),
      width: `${MOTTO_PANEL_VW}vw`,
    },
    {
      id: "about-intro",
      content: <SectionAboutIntro {...data.aboutIntro} />,
      interstitial: maybeInterstitial(data.aboutIntro.interstitial),
    },
    {
      id: "about-office",
      content: (
        <SectionAboutOffice
          locations={data.aboutOffice.locations}
          mediaImageUrl={data.aboutOffice.mediaImageUrl}
          mediaImageAlt={data.aboutOffice.mediaImageAlt}
          mediaVideoUrl={data.aboutOffice.mediaVideoUrl}
        />
      ),
      interstitial: maybeInterstitial(data.aboutOffice.interstitial),
      // Office panel is slightly narrower than the viewport so its right
      // edge (where what-we-do begins, and where the tilted heading is
      // anchored) lands close to the viewport's right edge at snap. With
      // the parallax slide, the heading's line-break visually rests at the
      // viewport edge: "What do" is in view, "we do" is just off-screen.
      width: "82vw",
    },
    {
      id: "what-we-do",
      content: <SectionWhatWeDo {...data.whatWeDo} />,
      interstitial: maybeInterstitial(data.whatWeDo.interstitial),
      // Narrower than full viewport so ~15vw on the right reveals the start
      // of the projects panel at this snap.
      width: "85vw",
    },
    {
      id: "projects",
      content: <SectionProjects {...data.projects} projects={projects} />,
      interstitial: maybeInterstitial(data.projects.interstitial),
    },
    {
      id: "team",
      content: (
        <SectionTeam
          heading={data.team.heading}
          teamMembers={data.team.members}
        />
      ),
      interstitial: maybeInterstitial(data.team.interstitial),
      width: getTeamSectionWidth(data.team.members.length),
    },
    {
      id: "publications",
      content: (
        <SectionCardGrid
          id="publications"
          backgroundColor="#FFD2D2"
          foregroundColor="#1F3A32"
          heading={data.publications.heading}
          items={data.publications.items}
        />
      ),
      interstitial: maybeInterstitial(data.publications.interstitial),
    },
    {
      id: "ventures",
      content: (
        <SectionCardGrid
          id="ventures"
          backgroundColor="#1F3A32"
          foregroundColor="#FFD2D2"
          heading={data.ventures.heading}
          items={data.ventures.items}
        />
      ),
      interstitial: maybeInterstitial(data.ventures.interstitial),
    },
    {
      id: "contact",
      content: <SectionContact {...data.contact} />,
      interstitial: maybeInterstitial(data.contact.interstitial),
      width: "50vw",
    },
  ];

  return (
    <div className="h-svh overflow-hidden">
      <LandingStage
        landingEpoch={landingEpoch}
        onLandingReturn={bumpLandingEpoch}
        showInteractiveNetwork={data.home.showInteractiveNetwork}
        motto={{
          heroText: data.motto.heroText,
          backgroundColor: data.motto.backgroundColor,
          backgroundVideoUrl: data.motto.backgroundVideoUrl,
        }}
      />
      <BlobNav
        onNavigate={(id) => scrollNavRef.current?.scrollToSection(id)}
        activeSection={activeSection}
        isScrolling={isScrolling}
      />
      <HorizontalScroll
        sections={sections}
        navRef={scrollNavRef}
        onActiveSectionChange={setActiveSection}
        onScrollingChange={setIsScrolling}
      />
    </div>
  );
}
