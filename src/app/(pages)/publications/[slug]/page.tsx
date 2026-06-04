import { redirect } from "next/navigation";

/**
 * Standalone publication route — redirects to the homepage so the
 * `(.)publications/[slug]` intercept can take over and render the
 * bottom-sheet modal. Used by:
 *   - shared / bookmarked links to /publications/<slug>
 *   - browser-back from Stripe checkout
 *   - Stripe's cancel_url
 *
 * The `openpub` query is read by `useReopenPublicationModal` in
 * `ResponsiveHome` to fire the soft-nav that triggers the intercept.
 */
export default async function PublicationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ canceled?: string }>;
}) {
  const { slug } = await params;
  const { canceled } = await searchParams;
  const qs = new URLSearchParams({ openpub: slug });
  if (canceled) qs.set("canceled", "1");
  redirect(`/?${qs.toString()}`);
}
