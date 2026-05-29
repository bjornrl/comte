import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { PUBLICATION_DETAIL_QUERY } from "@/sanity/lib/queries";
import { resolvePublicationPricing } from "@/lib/publicationPricing";
import { getStripe, getSiteUrl } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { slug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug : null;
  if (!slug) {
    return NextResponse.json({ error: "Missing publication slug." }, { status: 400 });
  }

  let publication: any;
  try {
    publication = await client.fetch(PUBLICATION_DETAIL_QUERY, { slug, locale: "en" });
  } catch {
    return NextResponse.json({ error: "Could not load publication." }, { status: 500 });
  }
  if (!publication) {
    return NextResponse.json({ error: "Publication not found." }, { status: 404 });
  }

  const { pricing, price } = resolvePublicationPricing({
    _id: publication._id,
    pricing: publication.pricing,
    price: publication.price,
  });
  if (pricing !== "paid" || price <= 0) {
    return NextResponse.json(
      { error: "This publication is free and does not require checkout." },
      { status: 400 },
    );
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Stripe is not configured." },
      { status: 500 },
    );
  }

  const siteUrl = getSiteUrl();
  const successUrl = `${siteUrl}/publications/${slug}/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${siteUrl}/publications/${slug}?canceled=1`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "nok",
            unit_amount: price * 100,
            product_data: {
              name: publication.title ?? "Publication",
              description: publication.description?.slice(0, 500) ?? undefined,
            },
          },
        },
      ],
      metadata: {
        publicationId: publication._id,
        publicationSlug: slug,
        publicationTitle: publication.title ?? "Publication",
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 },
      );
    }
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not create checkout session." },
      { status: 500 },
    );
  }
}
