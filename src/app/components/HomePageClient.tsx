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
import { type Project, type Connection, setProjectData } from "./projectNetworkData";

export type HomeData = {
  home: {
    heroText?: string;
    backgroundColor?: string;
    backgroundVideoUrl?: string;
  };
  motto: { heroText?: string; backgroundColor?: string };
  aboutIntro: {
    backgroundColor?: string;
    imageUrl?: string;
    imageAlt?: string;
    whoIsComteTitle?: string;
    whoIsComte?: string;
    whoAreWeTitle?: string;
    whoAreWe?: string;
  };
  aboutOffice: { backgroundColor?: string; locations: OfficeLocation[] };
  whatWeDo: {
    backgroundColor?: string;
    textbox?: string;
    datapoint1?: { value?: string; label?: string };
    datapoint2?: { value?: string; label?: string };
    datapoint3?: { value?: string; label?: string };
  };
  projects: { backgroundColor?: string; heading?: string };
  team: { backgroundColor?: string; heading?: string; members: any[] };
  publications: { backgroundColor?: string; heading?: string; items: CardItem[] };
  ventures: { backgroundColor?: string; heading?: string; items: CardItem[] };
};

type Props = {
  data: HomeData;
  projects: Project[];
  connections: Connection[];
};

export default function HomePageClient({ data, projects, connections }: Props) {
  const scrollNavRef = useRef<HorizontalScrollNavApi | null>(null);
  const [activeSection, setActiveSection] = useState<string>("home");

  const initialized = useRef(false);
  if (!initialized.current) {
    setProjectData(projects, connections);
    initialized.current = true;
  }

  const sections = [
    { id: "home", content: <SectionHome {...data.home} /> },
    { id: "motto", content: <SectionMotto {...data.motto} /> },
    { id: "about-intro", content: <SectionAboutIntro {...data.aboutIntro} /> },
    { id: "about-office", content: <SectionAboutOffice {...data.aboutOffice} /> },
    { id: "what-we-do", content: <SectionWhatWeDo {...data.whatWeDo} /> },
    { id: "projects", content: <SectionProjects {...data.projects} /> },
    {
      id: "team",
      content: (
        <SectionTeam
          backgroundColor={data.team.backgroundColor}
          heading={data.team.heading}
          teamMembers={data.team.members}
        />
      ),
    },
    {
      id: "publications",
      content: (
        <SectionCardGrid
          id="publications"
          defaultBg="#F9F9ED"
          backgroundColor={data.publications.backgroundColor}
          heading={data.publications.heading}
          items={data.publications.items}
        />
      ),
    },
    {
      id: "ventures",
      content: (
        <SectionCardGrid
          id="ventures"
          defaultBg="#F9F9ED"
          backgroundColor={data.ventures.backgroundColor}
          heading={data.ventures.heading}
          items={data.ventures.items}
        />
      ),
    },
  ];

  // Pick nav text colour: white on dark Home, otherwise dark.
  const navTextColor = activeSection === "home" ? "#FFFFFF" : "#212121";

  return (
    <div className="h-svh overflow-hidden">
      <BlobNav
        onNavigate={(id) => scrollNavRef.current?.scrollToSection(id)}
        activeSection={activeSection}
        textColor={navTextColor}
      />
      <HorizontalScroll
        sections={sections}
        navRef={scrollNavRef}
        onActiveSectionChange={setActiveSection}
      />
    </div>
  );
}
