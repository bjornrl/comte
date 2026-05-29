import { defineType, defineField } from "sanity";

/**
 * A confirmed Stripe purchase. Created by the `/api/stripe/webhook` handler
 * when a `checkout.session.completed` event arrives. The document _id is
 * derived from the Stripe Checkout Session id (`purchase.<sessionId>`) so
 * re-delivered webhook events are idempotent — Stripe may send the same event
 * more than once.
 *
 * These are records of sales, not editable content. They're read-only in the
 * Studio so an editor can't accidentally alter the audit trail.
 */
export const purchase = defineType({
  name: "purchase",
  title: "Purchase",
  type: "document",
  readOnly: true,
  fields: [
    defineField({
      name: "publication",
      title: "Publication",
      type: "reference",
      to: [{ type: "publication" }],
      weak: true,
    }),
    defineField({
      name: "publicationSlug",
      title: "Publication slug",
      type: "string",
    }),
    defineField({
      name: "publicationTitle",
      title: "Publication title",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Customer email",
      type: "string",
    }),
    defineField({
      name: "amount",
      title: "Amount paid",
      type: "number",
      description: "Major units (e.g. NOK), as charged.",
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Paid", value: "paid" },
          { title: "Refunded", value: "refunded" },
        ],
      },
    }),
    defineField({
      name: "stripeSessionId",
      title: "Stripe Checkout Session ID",
      type: "string",
    }),
    defineField({
      name: "stripePaymentIntentId",
      title: "Stripe PaymentIntent ID",
      type: "string",
    }),
    defineField({
      name: "purchasedAt",
      title: "Purchased at",
      type: "datetime",
    }),
  ],
  orderings: [
    {
      title: "Most recent",
      name: "purchasedAtDesc",
      by: [{ field: "purchasedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "publicationTitle",
      email: "email",
      amount: "amount",
      currency: "currency",
    },
    prepare: ({ title, email, amount, currency }) => ({
      title: title || "Publication",
      subtitle: [
        email,
        amount != null
          ? `${amount} ${(currency || "").toUpperCase()}`.trim()
          : null,
      ]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});
