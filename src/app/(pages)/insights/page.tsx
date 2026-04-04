export const revalidate = 60;

import BlobNav from "../../components/BlobNav";
import Footer from "../../components/Footer";
import ProductCard from "@/app/components/ProductCard";
import UnitVisualization from "@/app/components/UnitVisualization";
import ArticlesTable from "@/app/components/ArticlesTable";
import { client } from "@/sanity/lib/client";
import {
  INSIGHTS_PAGE_QUERY,
  INSIGHTS_VIEWS_QUERY,
  RESOURCES_QUERY,
  ARTICLES_QUERY,
} from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function sanityImageUrl(imageField: any, width = 800): string | null {
  if (!imageField?.asset) return null;
  return urlFor(imageField).width(width).auto("format").quality(80).url();
}

function getResourceHref(resource: any): string {
  if (resource.slug) return `/ressurser/${resource.slug}`;
  return "#";
}

function getResourceCtaLabel(resource: any): string {
  return "Les mer";
}

export default async function InsightsPage() {
  let pageData = null;
  let insightViews = null;
  let resources = null;
  let articles = null;
  try {
    [pageData, insightViews, resources, articles] = await Promise.all([
      client.fetch(INSIGHTS_PAGE_QUERY),
      client.fetch(INSIGHTS_VIEWS_QUERY),
      client.fetch(RESOURCES_QUERY),
      client.fetch(ARTICLES_QUERY),
    ]);
  } catch {}

  const heading = pageData?.heading ?? "Insights, statistics and resources";
  const subtitle =
    pageData?.subtitle ??
    "The societal challenges we work within. Same people, different lenses.";
  const articlesHeading =
    pageData?.articlesHeading ??
    "Vi både skriver ting og blir noen ganger skrevet om. Vi prøver å samle det meste her.";

  const mappedArticles = (articles ?? []).map((a: any) => ({
    _id: a._id,
    title: a.title,
    year: a.year,
    forum: a.forum,
    imageUrl: sanityImageUrl(a.image, 400) ?? PLACEHOLDER_IMAGE,
    linkType: a.linkType ?? "internal",
    externalUrl: a.externalUrl,
    slug: a.slug?.current,
  }));

  return (
    <div style={{ background: "#F9F9ED", minHeight: "100vh" }}>
      <BlobNav />

      {/* Hero visualization section */}
      <div className="relative px-2 pt-24 pb-8">
        <div className="mx-auto max-w-[1800px] min-h-[50vh] flex flex-col items-start justify-end pb-8">
          <h1 className="text-5xl font-light text-foreground">{heading}</h1>
          <p className="mt-3 max-w-[600px] text-lg font-light text-foreground/50">
            {subtitle}
          </p>
        </div>
        <div className="flex gap-2 w-full justify-center mb-4">
          <a
            href="#unitVisualization"
            className="flex h-8 w-30 items-center justify-center rounded-full border border-foreground bg-background text-xl font-light tracking-wide text-foreground transition-colors hover:cursor-pointer hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-background/30"
            aria-label="Go to stats section"
          >
            Stats
          </a>
          <a
            href="#resources"
            className="flex h-8 w-30 items-center justify-center rounded-full border border-foreground bg-foreground text-xl font-light tracking-wide text-background transition-colors hover:cursor-pointer hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-background/30"
            aria-label="Go to resources section"
          >
            Resources
          </a>
          <a
            href="#insights-table"
            className="flex h-8 w-30 items-center justify-center rounded-full border border-foreground bg-background text-xl font-light tracking-wide text-foreground transition-colors hover:cursor-pointer hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-background/30"
            aria-label="Go to articles section"
          >
            Insights
          </a>
        </div>
        <div id="unitVisualization">
          <UnitVisualization views={insightViews} />
        </div>
      </div>

      {/* Resources grid */}
      <section className="w-full bg-[var(--comte-light-base)] px-2 pb-2">
        <div className="mx-auto max-w-[1800px]">
          <div className="flex w-full flex-col items-start justify-between gap-4 pb-8 md:flex-row md:items-end">
            <h2 className="text-5xl font-light text-foreground">Resources</h2>
          </div>
          <div
            id="resources"
            className="grid w-full grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4"
          >
            {(resources ?? []).map((r: any) => {
              const imageUrl = sanityImageUrl(r.image) ?? PLACEHOLDER_IMAGE;
              return (
                <ProductCard
                  key={r._id}
                  title={r.title}
                  subtitle={r.subtitle}
                  meta={r.meta}
                  imageUrl={imageUrl}
                  href={getResourceHref(r)}
                  ctaLabel={getResourceCtaLabel(r)}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Articles table */}
      <section
        id="insights-table"
        className="flex h-fit w-full flex-shrink-0 flex-col items-center justify-center bg-[var(--comte-light-base)] p-2 md:p-12 lg:p-24"
      >
        <div className="mx-auto w-full max-w-[1800px]">
          <h2 className="pb-8 text-5xl font-light text-foreground">
            {articlesHeading}
          </h2>
          <ArticlesTable articles={mappedArticles} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
