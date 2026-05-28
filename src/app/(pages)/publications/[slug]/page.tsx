export const revalidate = 60;

import { notFound } from "next/navigation";
import ResponsiveNav from "@/app/components/ResponsiveNav";
import Footer from "@/app/components/Footer";
import PublicationDetailContent from "@/app/components/PublicationDetailContent";
import { client } from "@/sanity/lib/client";
import { PUBLICATION_DETAIL_QUERY } from "@/sanity/lib/queries";
import { getServerLocale } from "@/lib/locale-server";

export default async function PublicationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ canceled?: string }>;
}) {
  const { slug } = await params;
  const { canceled } = await searchParams;
  const locale = await getServerLocale();

  let publication: any = null;
  try {
    publication = await client.fetch(PUBLICATION_DETAIL_QUERY, { slug, locale });
  } catch {}

  if (!publication) return notFound();

  return (
    <div className="min-h-svh">
      <ResponsiveNav activeSection="publications" />
      <PublicationDetailContent
        publication={publication}
        canceled={Boolean(canceled)}
        variant="page"
      />
      <Footer />
    </div>
  );
}
