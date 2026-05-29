import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import { recordPurchase } from "@/lib/purchases";

// Webhook signature verification needs the raw, unparsed body and Node crypto.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  let stripe;
  let secret;
  try {
    stripe = getStripe();
    secret = getStripeWebhookSecret();
  } catch (e) {
    // Misconfiguration: return 500 so Stripe retries once we've set the env.
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Stripe is not configured." },
      { status: 500 },
    );
  }

  // Raw body is required — do NOT use request.json() here.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, secret);
  } catch (e) {
    // Bad signature → 400 so Stripe doesn't keep retrying a forged/garbled event.
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${e instanceof Error ? e.message : "unknown"}` },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await recordPurchase(session, new Date(event.created * 1000).toISOString());
        break;
      }
      default:
        // Other event types are acknowledged but ignored.
        break;
    }
  } catch (e) {
    // Returning 500 tells Stripe to retry, so a transient Sanity write failure
    // doesn't silently drop a sale.
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to process event." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
