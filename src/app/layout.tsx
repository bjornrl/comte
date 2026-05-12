import type { Metadata } from "next";
import { Manrope, Abhaya_Libre, Work_Sans } from "next/font/google";
import "./globals.css";
import { client } from "@/sanity/lib/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import { FALLBACK_SITE_SETTINGS } from "@/lib/fallbacks";

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

export async function generateMetadata(): Promise<Metadata> {
  let settings = null;
  try {
    settings = await client.fetch(SITE_SETTINGS_QUERY);
  } catch {}
  return {
    title: settings?.siteName ?? FALLBACK_SITE_SETTINGS.siteName,
    description: settings?.siteDescription ?? FALLBACK_SITE_SETTINGS.siteDescription,
  };
}

export const revalidate = 60;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${abhayaLibre.variable} ${workSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
