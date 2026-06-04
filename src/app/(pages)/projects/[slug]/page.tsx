export const revalidate = 60;

import { notFound } from "next/navigation";
import ResponsiveNav from "@/app/components/ResponsiveNav";
import Footer from "@/app/components/Footer";
import ProjectDetailContent from "@/app/components/ProjectDetailContent";
import { client } from "@/sanity/lib/client";
import { PROJECT_DETAIL_QUERY } from "@/sanity/lib/queries";
import { getServerLocale } from "@/lib/locale-server";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getServerLocale();
  let project = null;
  try {
    project = await client.fetch(PROJECT_DETAIL_QUERY, { slug, locale });
  } catch {}

  if (!project) return notFound();

  return (
    <div className="min-h-svh">
      <ResponsiveNav activeSection="projects" />
      <ProjectDetailContent project={project} variant="page" locale={locale} />
      <Footer locale={locale} />
    </div>
  );
}
