import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { client } from "@/sanity/lib/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import { FALLBACK_SITE_SETTINGS } from "@/lib/fallbacks";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        {children}
      </body>
    </html>
  );
}
