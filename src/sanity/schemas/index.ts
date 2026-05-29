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
import { purchase } from "./purchase";
import { venture } from "./venture";
import { siteSettings } from "./siteSettings";
import { projectTaxonomy } from "./projectTaxonomy";
import { serviceCategory } from "./serviceCategory";
import { interstitial } from "./interstitial";
import { aboutOffice } from "./aboutOffice";
import { localeString, localeText, localeBlockContent } from "./locale";

export const schemaTypes = [
  // Localization helpers (used by string/text/portable-text fields).
  localeString,
  localeText,
  localeBlockContent,

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
  projectTaxonomy,

  aboutOffice,

  // Document lists
  project,
  teamMember,
  publication,
  venture,

  // Sales records (read-only, written by the Stripe webhook)
  purchase,

  // Internal
  serviceCategory,

  // Inline object types
  interstitial,
];
