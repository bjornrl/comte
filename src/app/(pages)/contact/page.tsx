import { client } from "@/sanity/lib/client";
import { CONTACT_QUERY } from "@/sanity/lib/queries";
import { FALLBACK_CONTACT } from "@/lib/fallbacks";
import ContactPageClient from "./ContactPageClient";

export const revalidate = 60;

export default async function ContactPage() {
  let contactData = null;
  try {
    contactData = await client.fetch(CONTACT_QUERY);
  } catch {}

  const contact = {
    heading: contactData?.heading ?? FALLBACK_CONTACT.heading,
    email: contactData?.email ?? FALLBACK_CONTACT.email,
    phone: contactData?.phone ?? FALLBACK_CONTACT.phone,
    address: contactData?.address ?? FALLBACK_CONTACT.address,
  };

  return <ContactPageClient contact={contact} />;
}
