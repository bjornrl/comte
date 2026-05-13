"use client";

import { useRef, useState } from "react";
import HorizontalScroll, { type HorizontalScrollNavApi } from "./HorizontalScroll";
import BlobNav from "./BlobNav";
import SectionHome from "./sections/SectionHome";
import SectionMotto from "./sections/SectionMotto";
import SectionAboutIntro from "./sections/SectionAboutIntro";
import SectionAboutOffice, { type OfficeLocation } from "./sections/SectionAboutOffice";
import SectionWhatWeDo from "./sections/SectionWhatWeDo";
import SectionProjects from "./sections/SectionProjects";
import SectionTeam from "./sections/SectionTeam";
import SectionCardGrid, { type CardItem } from "./sections/SectionCardGrid";
import Interstitial, { type InterstitialData } from "./sections/Interstitial";
import { type Project, type Connection, setProjectData } from "./projectNetworkData";

type WithInterstitial = { interstitial?: InterstitialData };

export type HomeData = {
  home: WithInterstitial & {
    heroText?: string;
    backgroundColor?: string;
    backgroundVideoUrl?: string;
  };
  motto: WithInterstitial & { heroText?: string };
  aboutIntro: WithInterstitial & {
    imageUrl?: string;
    imageAlt?: string;
    whoIsComteTitle?: string;
    whoIsComte?: string;
    whoAreWeTitle?: string;
    whoAreWe?: string;
  };
  aboutOffice: WithInterstitial & { locations: OfficeLocation[] };
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

  const initialized = useRef(false);
  if (!initialized.current) {
    setProjectData(projects, connections);
    initialized.current = true;
  }

  const sections = [
    {
      id: "home",
      content: <SectionHome {...data.home} />,
      interstitial: maybeInterstitial(data.home.interstitial),
    },
    {
      id: "motto",
      content: <SectionMotto heroText={data.motto.heroText} />,
      interstitial: maybeInterstitial(data.motto.interstitial),
    },
    {
      id: "about-intro",
      content: <SectionAboutIntro {...data.aboutIntro} />,
      interstitial: maybeInterstitial(data.aboutIntro.interstitial),
    },
    {
      id: "about-office",
      content: <SectionAboutOffice locations={data.aboutOffice.locations} />,
      interstitial: maybeInterstitial(data.aboutOffice.interstitial),
    },
    {
      id: "what-we-do",
      content: <SectionWhatWeDo {...data.whatWeDo} />,
      interstitial: maybeInterstitial(data.whatWeDo.interstitial),
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
  ];

  return (
    <div className="h-svh overflow-hidden">
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
