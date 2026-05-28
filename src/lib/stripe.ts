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
  cached = new Stripe(key);
  return cached;
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.URL ??
    "http://localhost:3000"
  );
}
