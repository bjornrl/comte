import type Stripe from "stripe";
import { writeClient, assertWriteClientConfigured } from "@/sanity/lib/writeClient";

/**
 * Sanity doc _ids may only contain a-z, A-Z, 0-9, '.', '-', '_'. Stripe session
 * ids (cs_live_… / cs_test_…) already fit, but be defensive against anything
 * unexpected so a bad id can't make createIfNotExists throw.
 */
function purchaseDocId(sessionId: string): string {
  const safe = sessionId.replace(/[^a-zA-Z0-9._-]/g, "");
  return `purchase.${safe}`;
}

/**
 * Record a completed Checkout Session as a `purchase` document in Sanity.
 *
 * Idempotent: keyed by the session id, so Stripe re-delivering the same event
 * (which it can and does) won't create duplicates. Returns the doc id, or null
 * if the session isn't a usable paid purchase.
 */
export async function recordPurchase(
  session: Stripe.Checkout.Session,
  purchasedAtISO: string,
): Promise<string | null> {
  if (session.payment_status !== "paid") return null;

  const publicationId = session.metadata?.publicationId ?? null;
  const publicationSlug = session.metadata?.publicationSlug ?? null;

  assertWriteClientConfigured();

  const _id = purchaseDocId(session.id);

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  const doc = {
    _id,
    _type: "purchase",
    publicationSlug,
    publicationTitle: session.metadata?.publicationTitle ?? null,
    ...(publicationId
      ? {
          publication: {
            _type: "reference",
            _ref: publicationId,
            _weak: true,
          },
        }
      : {}),
    email: session.customer_details?.email ?? null,
    amount:
      typeof session.amount_total === "number"
        ? session.amount_total / 100
        : null,
    currency: session.currency ?? null,
    status: "paid",
    stripeSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
    purchasedAt: purchasedAtISO,
  };

  // createIfNotExists is a no-op if the doc already exists → idempotent.
  await writeClient.createIfNotExists(doc);
  return _id;
}
