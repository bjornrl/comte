import { groq } from "next-sanity";

// All projects
export const PROJECTS_QUERY = groq`
  *[_type == "project"] | order(order asc, year desc) {
    _id,
    title,
    "slug": slug.current,
    client,
    summary,
    year,
    tags,
    "heroImageUrl": gallery[0].asset->url,
    order
  }
`;

// Single project (overlay/detail)
export const PROJECT_DETAIL_QUERY = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    client,
    summary,
    year,
    tags,
    gallery[] {
      asset-> { _id, url },
      alt,
      caption,
      hotspot,
      crop
    },
    links[] { label, url }
  }
`;

// Page-section singletons
export const HOME_SECTION_QUERY = groq`
  *[_type == "homeSection"][0] {
    heroText,
    backgroundColor,
    "backgroundVideoUrl": backgroundVideo.asset->url
  }
`;

export const MOTTO_SECTION_QUERY = groq`
  *[_type == "mottoSection"][0] { heroText, backgroundColor }
`;

export const ABOUT_INTRO_QUERY = groq`
  *[_type == "aboutIntro"][0] {
    backgroundColor,
    whoIsComteTitle,
    whoIsComte,
    whoAreWeTitle,
    whoAreWe,
    image {
      asset-> { _id, url },
      alt,
      hotspot,
      crop
    }
  }
`;

export const ABOUT_OFFICE_QUERY = groq`
  *[_type == "aboutOffice"][0] {
    backgroundColor,
    locations[] {
      title,
      description,
      longitude,
      latitude,
      zoom
    }
  }
`;

export const WHAT_WE_DO_QUERY = groq`
  *[_type == "whatWeDo"][0] {
    backgroundColor,
    textbox,
    datapoint1,
    datapoint2,
    datapoint3
  }
`;

export const PROJECTS_SECTION_QUERY = groq`
  *[_type == "projectsSection"][0] { backgroundColor, heading }
`;

export const TEAM_SECTION_QUERY = groq`
  *[_type == "teamSection"][0] { backgroundColor, heading }
`;

export const PUBLICATIONS_SECTION_QUERY = groq`
  *[_type == "publicationsSection"][0] { backgroundColor, heading }
`;

export const VENTURES_SECTION_QUERY = groq`
  *[_type == "venturesSection"][0] { backgroundColor, heading }
`;

// Team members
export const TEAM_QUERY = groq`
  *[_type == "teamMember"] | order(order asc) {
    _id,
    name,
    role,
    bio,
    photo {
      asset-> { _id, url },
      hotspot,
      crop
    },
    email
  }
`;

// Publications
export const PUBLICATIONS_QUERY = groq`
  *[_type == "publication"] | order(order asc) {
    _id,
    title,
    description,
    image {
      asset-> { _id, url },
      alt,
      hotspot,
      crop
    }
  }
`;

// Ventures
export const VENTURES_QUERY = groq`
  *[_type == "venture"] | order(order asc) {
    _id,
    title,
    description,
    image {
      asset-> { _id, url },
      alt,
      hotspot,
      crop
    }
  }
`;

// Site settings
export const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0] {
    siteName,
    siteDescription,
    email,
    location,
    copyright
  }
`;

// Presentation tool (internal)
export const PRESENTATION_PROJECTS_QUERY = groq`
  *[_type == "project"] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    client,
    summary,
    year,
    gallery,
    tags,
    "presentationData": presentationData {
      stat1, stat2, bulletPoints, location, industry
    }
  }
`;

export const SERVICE_CATEGORIES_QUERY = groq`
  *[_type == "serviceCategory"] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    blurb,
    expertise,
    stats,
    statsTitle,
    statsDescription,
    heroImage {
      asset-> { _id, url },
      alt,
      hotspot,
      crop
    },
    order
  }
`;
