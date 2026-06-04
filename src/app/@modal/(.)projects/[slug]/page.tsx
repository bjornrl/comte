export const revalidate = 60;

import { notFound } from "next/navigation";
import BottomSheet from "@/app/components/BottomSheet";
import ProjectDetailContent from "@/app/components/ProjectDetailContent";
import { client } from "@/sanity/lib/client";
import { PROJECT_DETAIL_QUERY } from "@/sanity/lib/queries";
import { getServerLocale } from "@/lib/locale-server";

export default async function ProjectModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getServerLocale();
  let project: any = null;
  try {
    project = await client.fetch(PROJECT_DETAIL_QUERY, { slug, locale });
  } catch {}

  if (!project) return notFound();

  return (
    <BottomSheet
      ariaLabel={project.title ?? "Project"}
      title={project.title ?? "Project"}
    >
      <ProjectDetailContent project={project} variant="sheet" locale={locale} />
    </BottomSheet>
  );
}
