export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ResponsiveNav from "@/app/components/ResponsiveNav";
import Footer from "@/app/components/Footer";
import FittingHeadline from "@/app/components/FittingHeadline";
import { client } from "@/sanity/lib/client";
import { PUBLICATION_DETAIL_QUERY } from "@/sanity/lib/queries";
import { getServerLocale } from "@/lib/locale-server";
import { urlFor } from "@/sanity/lib/image";
import {
  formatPriceNOK,
  resolvePublicationPricing,
} from "@/lib/publicationPricing";
import { getStripe } from "@/lib/stripe";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop";

function sanityImageUrl(imageField: any, width = 1600): string | null {
  if (!imageField?.asset) return null;
  return urlFor(imageField).width(width).auto("format").quality(80).url();
}

type VerifyResult =
  | { ok: true; amountPaid: number | null; email: string | null }
  | { ok: false; reason: string };

async function verifySession(
  sessionId: string | undefined,
  expectedPublicationId: string,
): Promise<VerifyResult> {
  if (!sessionId) return { ok: false, reason: "Missing session id." };
  let stripe;
  try {
    stripe = getStripe();
  } catch (e) {
    return {
      ok: false,
      reason: e instanceof Error ? e.message : "Stripe is not configured.",
    };
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return { ok: false, reason: "Payment is not yet complete." };
    }
    if (session.metadata?.publicationId !== expectedPublicationId) {
      return { ok: false, reason: "Session does not match this publication." };
    }
    return {
      ok: true,
      amountPaid:
        typeof session.amount_total === "number" ? session.amount_total / 100 : null,
      email: session.customer_details?.email ?? null,
    };
  } catch (e) {
    return {
      ok: false,
      reason: e instanceof Error ? e.message : "Could not verify checkout session.",
    };
  }
}

export default async function PublicationSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { slug } = await params;
  const { session_id } = await searchParams;
  const locale = await getServerLocale();

  let publication: any = null;
  try {
    publication = await client.fetch(PUBLICATION_DETAIL_QUERY, { slug, locale });
  } catch {}
  if (!publication) return notFound();

  const { pricing, price } = resolvePublicationPricing({
    _id: publication._id,
    pricing: publication.pricing,
    price: publication.price,
  });

  const heroUrl = sanityImageUrl(publication.image, 1600) ?? PLACEHOLDER_IMAGE;
  const heroAlt = publication.image?.alt ?? publication.title ?? "";
  const pdfUrl: string | undefined = publication.pdfUrl ?? undefined;

  const verification =
    pricing === "paid"
      ? await verifySession(session_id, publication._id)
      : { ok: true as const, amountPaid: 0, email: null };

  return (
    <div className="min-h-svh">
      <ResponsiveNav activeSection="publications" />

      <div className="w-full flex flex-col items-center justify-start bg-background px-4 pt-20 pb-8 sm:px-6 lg:min-h-[50vh] lg:pt-12">
        <FittingHeadline>{publication.title}</FittingHeadline>
        <p
          className="mt-3 text-xs font-medium uppercase tracking-[0.15em] sm:text-sm"
          style={{ color: verification.ok ? "#1F3A32" : "#FF5252" }}
        >
          {verification.ok ? "Thank you · Payment received" : "Payment not confirmed"}
        </p>
      </div>

      <div className="w-full bg-background px-4 sm:px-6 md:px-12 lg:px-24 py-4 md:py-8">
        <div className="relative w-full aspect-square md:aspect-[16/9] overflow-hidden bg-gray-100">
          <Image
            src={heroUrl}
            alt={heroAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 70vw"
            priority
          />
        </div>
      </div>

      <div
        className="w-full px-4 py-10 sm:px-6 md:px-12 lg:px-24 md:py-16 flex flex-col items-start gap-6"
        style={{ background: "#FFD2D2", color: "#1F3A32" }}
      >
        {verification.ok ? (
          <>
            <h2
              className="font-[family-name:var(--font-manrope)] font-bold leading-tight"
              style={{ fontSize: "clamp(1.5rem, 6vw, 3rem)" }}
            >
              Your copy is ready.
            </h2>
            <p className="font-[family-name:var(--font-manrope)] text-base font-light max-w-prose">
              {verification.amountPaid && verification.amountPaid > 0
                ? `We charged ${formatPriceNOK(verification.amountPaid)}`
                : "Payment confirmed"}
              {verification.email ? ` and emailed a receipt to ${verification.email}.` : "."}
              {" "}Click below to download the PDF — you can come back to this page any time.
            </p>

            {pdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-4 font-[family-name:var(--font-manrope)] text-base font-bold tracking-wide"
                style={{
                  background: "#1F3A32",
                  color: "#FFD2D2",
                  minHeight: 48,
                }}
              >
                Download PDF
              </a>
            ) : (
              <p className="font-[family-name:var(--font-manrope)] text-sm font-light italic max-w-prose">
                The PDF hasn't been uploaded yet — we'll email it as soon as it's
                available. If you need it sooner, reply to your Stripe receipt.
              </p>
            )}
          </>
        ) : (
          <>
            <h2
              className="font-[family-name:var(--font-manrope)] font-bold leading-tight"
              style={{ fontSize: "clamp(1.5rem, 6vw, 3rem)" }}
            >
              We couldn't verify the payment.
            </h2>
            <p className="font-[family-name:var(--font-manrope)] text-base font-light max-w-prose">
              {verification.reason} If you were charged, contact us and we'll sort
              it out.
            </p>
            {pricing === "paid" && price > 0 && (
              <Link
                href={`/publications/${slug}`}
                className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-4 font-[family-name:var(--font-manrope)] text-base font-bold tracking-wide"
                style={{
                  background: "#1F3A32",
                  color: "#FFD2D2",
                  minHeight: 48,
                }}
              >
                Try again ({formatPriceNOK(price)})
              </Link>
            )}
          </>
        )}
      </div>

      <div className="w-full bg-background px-4 py-8 sm:px-6 md:px-12 lg:px-24 md:py-12">
        <Link
          href="/#publications"
          className="text-foreground/70 underline-offset-4 hover:underline"
        >
          ← Back to all publications
        </Link>
      </div>

      <Footer />
    </div>
  );
}
