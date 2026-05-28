import { groq } from "next-sanity";

// Re-usable interstitial projection. Each section singleton query spreads
// this so the editor can attach a narrow parallax panel to any section.
const INTERSTITIAL_FIELDS = groq`
  interstitial {
    text,
    image { asset-> { _id, url }, alt, hotspot, crop },
    "videoUrl": video.asset->url,
    backgroundColor
  }
`;

// All projects
export const PROJECTS_QUERY = groq`
  *[_type == "project"] | order(order asc, year desc) {
    _id,
    title,
    "slug": slug.current,
    customers,
    client, // legacy fallback
    summary,
    year,
    mainCategory,
    allCategories,
    tags, // legacy fallback
    scale,
    methods,
    responsible-> {
      _id,
      name,
      role,
      email,
      phone,
      "photoUrl": photo.asset->url
    },
    "heroImageUrl": gallery[0].asset->url,
    "galleryUrls": gallery[].asset->url,
    links[] { label, url },
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
    showInteractiveNetwork,
    ${INTERSTITIAL_FIELDS}
  }
`;

export const MOTTO_SECTION_QUERY = groq`
  *[_type == "mottoSection"][0] {
    heroText,
    backgroundColor,
    "backgroundVideoUrl": backgroundVideo.asset->url,
    ${INTERSTITIAL_FIELDS}
  }
`;

export const ABOUT_INTRO_QUERY = groq`
  *[_type == "aboutIntro"][0] {
    whoIsComteTitle,
    whoIsComte,
    whoAreWeTitle,
    whoAreWe,
    image {
      asset-> { _id, url },
      alt,
      hotspot,
      crop
    },
    ${INTERSTITIAL_FIELDS}
  }
`;

export const WHAT_WE_DO_QUERY = groq`
  *[_type == "whatWeDo"][0] {
    textbox,
    datapoint1,
    datapoint2,
    datapoint3,
    ${INTERSTITIAL_FIELDS}
  }
`;

export const PROJECTS_SECTION_QUERY = groq`
  *[_type == "projectsSection"][0] {
    backgroundColor,
    heading,
    ${INTERSTITIAL_FIELDS}
  }
`;

export const TEAM_SECTION_QUERY = groq`
  *[_type == "teamSection"][0] {
    heading,
    carouselVideos[] {
      _key,
      label,
      "url": video.asset->url,
      "mimeType": video.asset->mimeType
    },
    ${INTERSTITIAL_FIELDS}
  }
`;

export const PUBLICATIONS_SECTION_QUERY = groq`
  *[_type == "publicationsSection"][0] {
    heading,
    body,
    ${INTERSTITIAL_FIELDS}
  }
`;

export const VENTURES_SECTION_QUERY = groq`
  *[_type == "venturesSection"][0] {
    heading,
    body,
    "featuredVideoUrl": featuredVideo.asset->url,
    featuredImage {
      asset-> { _id, url },
      alt,
      hotspot,
      crop
    },
    ${INTERSTITIAL_FIELDS}
  }
`;

export const CONTACT_SECTION_QUERY = groq`
  *[_type == "contactSection"][0] {
    block1Title,
    block1Body,
    block2Title,
    block2Body,
    ${INTERSTITIAL_FIELDS}
  }
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
    email,
    phone
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
