export type PublicationPricing = "free" | "paid";

export type ResolvedPricing = {
  pricing: PublicationPricing;
  price: number;
};

const DEFAULT_PAID_PRICE_NOK = 250;

function hash(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

const STABLE_PRICE_CHOICES_NOK = [150, 200, 250, 260, 350];

/**
 * Resolve a publication's free/paid status and price.
 *
 * Editors can set `pricing` and `price` in Sanity directly. Until they do, we
 * derive both from the document _id so the assignment is stable per
 * publication across renders and visitors. Hashing _id means the same item is
 * always the same — no flicker between "free" and "paid" between visits.
 */
export function resolvePublicationPricing(input: {
  _id: string;
  pricing?: PublicationPricing | null;
  price?: number | null;
}): ResolvedPricing {
  const editorPricing = input.pricing === "free" || input.pricing === "paid"
    ? input.pricing
    : null;

  const h = hash(input._id);
  const fallbackPricing: PublicationPricing = h % 2 === 0 ? "free" : "paid";
  const pricing = editorPricing ?? fallbackPricing;

  if (pricing === "free") return { pricing, price: 0 };

  const editorPrice = typeof input.price === "number" && input.price > 0
    ? Math.round(input.price)
    : null;
  const fallbackPrice =
    STABLE_PRICE_CHOICES_NOK[h % STABLE_PRICE_CHOICES_NOK.length] ?? DEFAULT_PAID_PRICE_NOK;

  return { pricing, price: editorPrice ?? fallbackPrice };
}

export function formatPriceNOK(nok: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(nok);
}
