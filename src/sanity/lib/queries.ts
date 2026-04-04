import { groq } from "next-sanity";

// All projects (for network map and grid)
export const PROJECTS_QUERY = groq`
  *[_type == "project"] | order(order asc, year desc) {
    _id,
    title,
    "slug": slug.current,
    client,
    domain,
    summary,
    year,
    featured,
    scale,
    methods,
    innovationLevel,
    "heroImageUrl": heroImage.asset->url,
    "relatedProjectIds": relatedProjects[]->_id,
    order
  }
`;

// Single project (for detail page)
export const PROJECT_DETAIL_QUERY = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    client,
    domain,
    summary,
    year,
    featured,
    scale,
    methods,
    innovationLevel,
    heroImage {
      asset-> { _id, url },
      alt,
      hotspot,
      crop
    },
    gallery[] {
      asset-> { _id, url },
      alt,
      caption,
      hotspot,
      crop
    },
    // New 6-section structure
    societalIssue,
    solution,
    whyItWorked,
    impact,
    scalability,
    valueCreation,
    // Legacy fields (fallback)
    challenge,
    approach,
    outcome,
    // Other
    clientQuote,
    collaborators,
    "relatedProjects": relatedProjects[]-> {
      _id, title, "slug": slug.current, client, domain, summary,
      heroImage { asset-> { _id, url }, alt }
    }
  }
`;

// Home page
export const HOME_QUERY = groq`
  *[_type == "homePage"][0] {
    heroText,
    "featuredProjects": featuredProjects[]-> {
      _id, title, slug, client, domain, summary, year, heroImage
    }
  }
`;

// About page
export const ABOUT_QUERY = groq`
  *[_type == "aboutPage"][0] {
    heading,
    intro,
    heroImage {
      asset-> { _id, url },
      alt,
      hotspot,
      crop
    },
    sections[] {
      _key,
      heading,
      body,
      image {
        asset-> { _id, url },
        alt,
        hotspot,
        crop
      }
    },
    teamHeading
  }
`;

// How we work page
export const HOW_WE_WORK_QUERY = groq`
  *[_type == "howWeWorkPage"][0] {
    heading,
    intro,
    capabilities,
    processSteps
  }
`;

// Contact page
export const CONTACT_QUERY = groq`
  *[_type == "contactPage"][0] {
    heading,
    email,
    phone,
    address,
    content
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
    email
  }
`;

// Insights views
export const INSIGHTS_VIEWS_QUERY = groq`
  *[_type == "insightsView"] | order(order asc) {
    _id,
    title,
    key,
    description
  }
`;

// Insights page (singleton)
export const INSIGHTS_PAGE_QUERY = groq`
  *[_type == "insightsPage"][0] {
    heading,
    subtitle,
    articlesHeading
  }
`;

// Resources
export const RESOURCES_QUERY = groq`
  *[_type == "resource"] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    subtitle,
    meta,
    image {
      asset-> { _id, url },
      alt
    },
    actionType,
    "fileUrl": file.asset->url,
    inquiryEmail
  }
`;

// Single resource (for detail page)
export const RESOURCE_DETAIL_QUERY = groq`
  *[_type == "resource" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    subtitle,
    description,
    meta,
    image {
      asset-> { _id, url },
      alt,
      hotspot,
      crop
    },
    actionType,
    "fileUrl": file.asset->url,
    inquiryEmail
  }
`;

// Articles
export const ARTICLES_QUERY = groq`
  *[_type == "article"] | order(year desc, order asc) {
    _id,
    title,
    year,
    forum,
    image {
      asset-> { _id, url },
      alt
    },
    linkType,
    externalUrl,
    slug
  }
`;

// Single article (for internal blog posts)
export const ARTICLE_DETAIL_QUERY = groq`
  *[_type == "article" && slug.current == $slug][0] {
    _id,
    title,
    year,
    forum,
    image {
      asset-> { _id, url },
      alt
    },
    body[] {
      ...,
      _type == "image" => {
        asset-> { _id, url },
        alt,
        caption
      }
    }
  }
`;

// Footer tags
export const FOOTER_TAGS_QUERY = groq`
  *[_type == "footerTag"] | order(order asc) {
    _id,
    label,
    category,
    color
  }
`;

// Presentation tool: projects with presentation-specific fields
export const PRESENTATION_PROJECTS_QUERY = groq`
  *[_type == "project"] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    client,
    domain,
    summary,
    year,
    heroImage,
    gallery,
    methods,
    "presentationData": presentationData {
      stat1, stat2, bulletPoints, location, industry
    }
  }
`;

// Presentation tool: service categories
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
