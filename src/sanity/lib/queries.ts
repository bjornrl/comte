import { groq } from "next-sanity";

/**
 * GROQ-side locale picker. Returns the active locale's value, falling
 * back to English, then to the raw field — so unmigrated plain-string
 * documents keep rendering until an editor sets their translations.
 *
 *   ${t("title")}     →  "title": coalesce(title[$locale], title.en, title)
 *   ${t("body")}      →  same shape, works for arrays + portable text
 */
const t = (field: string) =>
  `"${field}": coalesce(${field}[$locale], ${field}.en, ${field})`;

// Re-usable interstitial projection. Each section singleton query spreads
// this so the editor can attach a narrow parallax panel to any section.
const INTERSTITIAL_FIELDS = groq`
  interstitial {
    ${t("text")},
    image { asset-> { _id, url }, ${t("alt")}, hotspot, crop },
    "videoUrl": video.asset->url,
    backgroundColor
  }
`;

// All projects
export const PROJECTS_QUERY = groq`
  *[_type == "project"] | order(order asc, year desc) {
    _id,
    ${t("title")},
    "slug": slug.current,
    customers,
    client, // legacy fallback
    ${t("summary")},
    year,
    mainCategory,
    allCategories,
    tags, // legacy fallback
    scale,
    methods,
    responsible-> {
      _id,
      name,
      ${t("role")},
      email,
      phone,
      "photoUrl": photo.asset->url
    },
    "heroImageUrl": gallery[0].asset->url,
    "galleryUrls": gallery[].asset->url,
    links[] { ${t("label")}, url },
    order
  }
`;

// Single project (overlay/detail)
export const PROJECT_DETAIL_QUERY = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    ${t("title")},
    slug,
    client,
    ${t("summary")},
    year,
    tags,
    gallery[] {
      asset-> { _id, url },
      ${t("alt")},
      ${t("caption")},
      hotspot,
      crop
    },
    links[] { ${t("label")}, url },
    responsible-> {
      _id,
      name,
      ${t("role")},
      email,
      phone,
      "photoUrl": photo.asset->url
    }
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
    ${t("heroText")},
    backgroundColor,
    "backgroundVideoUrl": backgroundVideo.asset->url,
    ${INTERSTITIAL_FIELDS}
  }
`;

export const ABOUT_INTRO_QUERY = groq`
  *[_type == "aboutIntro"][0] {
    ${t("whoIsComteTitle")},
    ${t("whoIsComte")},
    ${t("whoAreWeTitle")},
    ${t("whoAreWe")},
    image {
      asset-> { _id, url },
      ${t("alt")},
      hotspot,
      crop
    },
    ${INTERSTITIAL_FIELDS}
  }
`;

export const WHAT_WE_DO_QUERY = groq`
  *[_type == "whatWeDo"][0] {
    ${t("textbox")},
    datapoint1 { ${t("value")}, ${t("label")} },
    datapoint2 { ${t("value")}, ${t("label")} },
    datapoint3 { ${t("value")}, ${t("label")} },
    ${INTERSTITIAL_FIELDS}
  }
`;

export const PROJECTS_SECTION_QUERY = groq`
  *[_type == "projectsSection"][0] {
    backgroundColor,
    ${t("heading")},
    ${INTERSTITIAL_FIELDS}
  }
`;

export const TEAM_SECTION_QUERY = groq`
  *[_type == "teamSection"][0] {
    ${t("heading")},
    carouselVideos[] {
      _key,
      ${t("label")},
      "url": video.asset->url,
      "mimeType": video.asset->mimeType
    },
    ${INTERSTITIAL_FIELDS}
  }
`;

export const PUBLICATIONS_SECTION_QUERY = groq`
  *[_type == "publicationsSection"][0] {
    ${t("heading")},
    ${t("body")},
    ${INTERSTITIAL_FIELDS}
  }
`;

export const VENTURES_SECTION_QUERY = groq`
  *[_type == "venturesSection"][0] {
    ${t("heading")},
    ${t("body")},
    "featuredVideoUrl": featuredVideo.asset->url,
    featuredImage {
      asset-> { _id, url },
      ${t("alt")},
      hotspot,
      crop
    },
    ${INTERSTITIAL_FIELDS}
  }
`;

export const CONTACT_SECTION_QUERY = groq`
  *[_type == "contactSection"][0] {
    ${t("block1Title")},
    ${t("block1Body")},
    ${t("block2Title")},
    ${t("block2Body")},
    ${INTERSTITIAL_FIELDS}
  }
`;

// Team members
export const TEAM_QUERY = groq`
  *[_type == "teamMember"] | order(order asc) {
    _id,
    name,
    ${t("role")},
    ${t("bio")},
    photo {
      asset-> { _id, url },
      hotspot,
      crop
    },
    "photoUrl": photo.asset->url,
    email,
    phone
  }
`;

// Publications
export const PUBLICATIONS_QUERY = groq`
  *[_type == "publication"] | order(order asc) {
    _id,
    ${t("title")},
    "slug": slug.current,
    ${t("description")},
    pricing,
    price,
    image {
      asset-> { _id, url },
      ${t("alt")},
      hotspot,
      crop
    },
    "imageUrl": image.asset->url
  }
`;

// Single publication (detail page)
export const PUBLICATION_DETAIL_QUERY = groq`
  *[_type == "publication" && slug.current == $slug][0] {
    _id,
    ${t("title")},
    "slug": slug.current,
    ${t("description")},
    ${t("body")},
    pricing,
    price,
    image {
      asset-> { _id, url },
      ${t("alt")},
      hotspot,
      crop
    },
    "pdfUrl": pdfFile.asset->url,
    "pdfName": pdfFile.asset->originalFilename
  }
`;

// Ventures
export const VENTURES_QUERY = groq`
  *[_type == "venture"] | order(order asc) {
    _id,
    ${t("title")},
    ${t("description")},
    image {
      asset-> { _id, url },
      ${t("alt")},
      hotspot,
      crop
    }
  }
`;

// About-office singleton — owns the Norway / Portugal location blocks.
// Surfaced on mobile by the contact section; harmless to desktop.
export const ABOUT_OFFICE_QUERY = groq`
  *[_type == "aboutOffice"][0] {
    locations[] {
      _key,
      ${t("title")},
      address,
      ${t("description")},
      zoom
    }
  }
`;

// Site settings
export const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0] {
    ${t("siteName")},
    ${t("siteDescription")},
    email,
    ${t("location")},
    ${t("copyright")}
  }
`;

// Presentation tool (internal)
export const PRESENTATION_PROJECTS_QUERY = groq`
  *[_type == "project"] | order(order asc) {
    _id,
    ${t("title")},
    "slug": slug.current,
    client,
    ${t("summary")},
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
