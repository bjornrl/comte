"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import HorizontalScroll, { type HorizontalScrollNavApi } from "./HorizontalScroll";
import BlobNav from "./BlobNav";
import LandingStage from "./LandingStage";
import LandingSpacer from "./LandingSpacer";
import SectionAboutIntro from "./sections/SectionAboutIntro";
import SectionWhatWeDo from "./sections/SectionWhatWeDo";
import SectionProjects from "./sections/SectionProjects";
import SectionTeam, {
  getTeamSectionWidth,
  type TeamCarouselVideo,
} from "./sections/SectionTeam";
import SectionVentures from "./sections/SectionVentures";
import SectionPublications from "./sections/SectionPublications";
import SectionContact from "./sections/SectionContact";
import { type CardItem } from "./sections/SectionCardGrid";
import Interstitial, { type InterstitialData } from "./sections/Interstitial";
import { type Project, type Connection, setProjectData } from "./projectNetworkData";
import { HOME_PANEL_VW, LANDING_HOME_BG, MOTTO_DEFAULT_BG, MOTTO_PANEL_VW } from "./homeLayout";

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
  whatWeDo: WithInterstitial & {
    textbox?: string;
    datapoint1?: { value?: string; label?: string };
    datapoint2?: { value?: string; label?: string };
    datapoint3?: { value?: string; label?: string };
  };
  projects: WithInterstitial & { backgroundColor?: string; heading?: string };
  team: WithInterstitial & {
    heading?: string;
    members: any[];
    carouselVideos?: TeamCarouselVideo[];
  };
  publications: WithInterstitial & { heading?: string; body?: string; items: CardItem[] };
  ventures: WithInterstitial & {
    heading?: string;
    body?: string;
    featuredVideoUrl?: string;
    featuredImage?: any;
    items: CardItem[];
  };
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

  // Track whether the publications section is currently in item-view mode
  // and (if so) the currently viewed item's title. BlobNav uses these to
  // render a pink-filled nav-row button beside the publications item.
  const [pubItemTitle, setPubItemTitle] = useState<string | null>(null);
  const pubBackHandlerRef = useRef<(() => void) | null>(null);
  const registerPubBackHandler = useCallback((fn: (() => void) | null) => {
    pubBackHandlerRef.current = fn;
  }, []);
  const publicationsItemView = useMemo(
    () =>
      pubItemTitle !== null
        ? {
            itemTitle: pubItemTitle,
            onClick: () => pubBackHandlerRef.current?.(),
          }
        : null,
    [pubItemTitle],
  );

  const initialized = useRef(false);
  if (!initialized.current) {
    setProjectData(projects, connections);
    initialized.current = true;
  }

  const sections = [
    {
      id: "home",
      content: <LandingSpacer bgColor={LANDING_HOME_BG} />,
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
          carouselVideos={data.team.carouselVideos ?? []}
        />
      ),
      interstitial: maybeInterstitial(data.team.interstitial),
      width: getTeamSectionWidth(
        data.team.members.length,
        data.team.carouselVideos?.length ?? 0,
      ),
    },
    {
      id: "publications",
      content: (
        <SectionPublications
          backgroundColor="#F5F5E9"
          foregroundColor="#5A7482"
          heading={data.publications.heading}
          body={data.publications.body}
          items={data.publications.items}
          onItemViewChange={setPubItemTitle}
          registerBackHandler={registerPubBackHandler}
        />
      ),
      interstitial: maybeInterstitial(data.publications.interstitial),
    },
    {
      id: "ventures",
      content: (
        <SectionVentures
          backgroundColor="#1F3A32"
          foregroundColor="#FFD2D2"
          heading={data.ventures.heading}
          body={data.ventures.body}
          featuredVideoUrl={data.ventures.featuredVideoUrl}
          featuredImage={data.ventures.featuredImage}
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
          backgroundColor: data.motto.backgroundColor ?? MOTTO_DEFAULT_BG,
          backgroundVideoUrl: data.motto.backgroundVideoUrl,
        }}
      />
      <BlobNav
        onNavigate={(id) => scrollNavRef.current?.scrollToSection(id)}
        activeSection={activeSection}
        isScrolling={isScrolling}
        publicationsItemView={publicationsItemView}
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
