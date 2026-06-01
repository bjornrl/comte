import type { Metadata } from "next";
import { Manrope, Abhaya_Libre, Work_Sans, Roboto } from "next/font/google";
import "./globals.css";
import { client } from "@/sanity/lib/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import { FALLBACK_SITE_SETTINGS } from "@/lib/fallbacks";
import { getServerLocale } from "@/lib/locale-server";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const abhayaLibre = Abhaya_Libre({
  variable: "--font-abhaya-libre",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://comte.no";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  let settings = null;
  try {
    settings = await client.fetch(SITE_SETTINGS_QUERY, { locale });
  } catch {}
  const title = settings?.siteName ?? FALLBACK_SITE_SETTINGS.siteName;
  const description =
    settings?.siteDescription ?? FALLBACK_SITE_SETTINGS.siteDescription;
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    openGraph: {
      type: "website",
      siteName: title,
      title,
      description,
      url: SITE_URL,
      locale: locale === "no" ? "nb_NO" : "en_US",
      images: [
        {
          url: "/social-images/comte-social-1.jpg",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/social-images/comte-social-1.jpg"],
    },
  };
}

export const revalidate = 60;

export default async function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  /** Parallel-route slot used by intercepting routes (publications + project
   *  detail overlays). Optional so the generated LayoutProps type remains
   *  satisfiable even before Next regenerates after adding @modal. */
  modal?: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  return (
    <html lang={locale}>
      <body
        className={`${manrope.variable} ${abhayaLibre.variable} ${workSans.variable} ${roboto.variable} antialiased`}
      >
        <a href="#main-content" className="skip-to-content">
          {locale === "no" ? "Hopp til innhold" : "Skip to content"}
        </a>
        {children}
        {modal}
      </body>
    </html>
  );
}
