import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { PUBLICATION_PDF_QUERY } from "@/sanity/lib/queries";
import { resolvePublicationPricing } from "@/lib/publicationPricing";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Gated PDF download for paid publications.
 *
 * Access is granted only after re-verifying the Stripe Checkout Session
 * server-side (paid + belongs to this publication). The raw Sanity asset URL
 * is fetched here and the file is proxied back to the buyer — it is never sent
 * to the browser, so a paid PDF can't leak via page source or a shared link.
 *
 * Free publications are served directly (no session required).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const sessionId = new URL(request.url).searchParams.get("session_id") ?? undefined;

  let publication: {
    _id: string;
    pricing?: "free" | "paid" | null;
    price?: number | null;
    title?: string | null;
    pdfUrl?: string | null;
    pdfName?: string | null;
  } | null = null;
  try {
    publication = await client.fetch(PUBLICATION_PDF_QUERY, { slug });
  } catch {
    return NextResponse.json({ error: "Could not load publication." }, { status: 500 });
  }
  if (!publication) {
    return NextResponse.json({ error: "Publication not found." }, { status: 404 });
  }
  if (!publication.pdfUrl) {
    return NextResponse.json({ error: "No PDF is available yet." }, { status: 404 });
  }

  const { pricing } = resolvePublicationPricing({
    _id: publication._id,
    pricing: publication.pricing,
    price: publication.price,
  });

  if (pricing === "paid") {
    if (!sessionId) {
      return NextResponse.json(
        { error: "A valid checkout session is required to download this publication." },
        { status: 401 },
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
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== "paid") {
        return NextResponse.json({ error: "Payment is not complete." }, { status: 403 });
      }
      if (session.metadata?.publicationId !== publication._id) {
        return NextResponse.json(
          { error: "This session does not grant access to this publication." },
          { status: 403 },
        );
      }
    } catch {
      return NextResponse.json({ error: "Could not verify your purchase." }, { status: 403 });
    }
  }

  // Proxy the file from Sanity. The asset URL stays server-side.
  let upstream: Response;
  try {
    upstream = await fetch(publication.pdfUrl);
  } catch {
    return NextResponse.json({ error: "Could not fetch the PDF." }, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Could not fetch the PDF." }, { status: 502 });
  }

  const filename = sanitizeFilename(
    publication.pdfName || `${slug}.pdf`,
  );

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

/** Strip anything that could break the header or escape the filename. */
function sanitizeFilename(name: string): string {
  const base = name.replace(/[^\w.\- ]+/g, "_").trim() || "publication.pdf";
  return base.toLowerCase().endsWith(".pdf") ? base : `${base}.pdf`;
}
