import { createClient } from "next-sanity";

/**
 * Server-only Sanity client with write access. Used by API routes (e.g. the
 * Stripe webhook) to record purchases. NEVER import this into a client
 * component — the token must stay on the server.
 *
 * `useCdn: false` so reads are always live (no stale cache when checking
 * idempotency before a write).
 */
export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

export function assertWriteClientConfigured() {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    throw new Error(
      "SANITY_API_WRITE_TOKEN is not set. Purchases can't be recorded without an Editor token.",
    );
  }
}
