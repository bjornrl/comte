import { project } from "./project";
import { teamMember } from "./teamMember";
import { homeSection } from "./homeSection";
import { mottoSection } from "./mottoSection";
import { aboutIntro } from "./aboutIntro";
import { aboutOffice } from "./aboutOffice";
import { whatWeDo } from "./whatWeDo";
import { projectsSection } from "./projectsSection";
import { teamSection } from "./teamSection";
import { publicationsSection } from "./publicationsSection";
import { venturesSection } from "./venturesSection";
import { publication } from "./publication";
import { venture } from "./venture";
import { siteSettings } from "./siteSettings";
import { serviceCategory } from "./serviceCategory";
import { interstitial } from "./interstitial";

export const schemaTypes = [
  // Page-section singletons
  homeSection,
  mottoSection,
  aboutIntro,
  aboutOffice,
  whatWeDo,
  projectsSection,
  teamSection,
  publicationsSection,
  venturesSection,
  siteSettings,

  // Document lists
  project,
  teamMember,
  publication,
  venture,

  // Internal
  serviceCategory,

  // Inline object types
  interstitial,
];
