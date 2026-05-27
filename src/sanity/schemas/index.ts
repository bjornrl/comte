import { project } from "./project";
import { teamMember } from "./teamMember";
import { homeSection } from "./homeSection";
import { mottoSection } from "./mottoSection";
import { aboutIntro } from "./aboutIntro";
import { whatWeDo } from "./whatWeDo";
import { projectsSection } from "./projectsSection";
import { teamSection } from "./teamSection";
import { publicationsSection } from "./publicationsSection";
import { venturesSection } from "./venturesSection";
import { contactSection } from "./contactSection";
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
  whatWeDo,
  projectsSection,
  teamSection,
  publicationsSection,
  venturesSection,
  contactSection,
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
