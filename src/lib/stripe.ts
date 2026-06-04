import Stripe from "stripe";

let cached: Stripe | null = null;

/**
 * Lazily instantiate the Stripe SDK. We don't read the key at module-load
 * time so the rest of the app keeps building/rendering even before the
 * editor has set STRIPE_SECRET_KEY — only the checkout route fails.
 */
export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local (and the Netlify env) to enable paid checkout.",
    );
  }
  cached = new Stripe(key, {
    appInfo: { name: "comte-bureau-web" },
  });
  return cached;
}

/**
 * The signing secret for the Stripe webhook endpoint (whsec_…). Required to
 * verify that incoming webhook events genuinely came from Stripe. Find it in
 * the Stripe dashboard under Developers → Webhooks → your endpoint, or from
 * `stripe listen` when testing locally.
 */
export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not set. Add it to the environment so webhook events can be verified.",
    );
  }
  return secret;
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.URL ??
    "http://localhost:3000"
  );
}
