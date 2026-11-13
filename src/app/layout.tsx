import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, Manrope, Newsreader } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { openGraphImage } from "@/lib/metadata";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
);

const siteDescription =
  "Discover scholarly papers, organise your library, write connected research notes, build literature reviews, and coordinate projects in one considered academic workspace.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Folio — Academic Research Workspace",
    template: "%s · Folio",
  },
  description: siteDescription,
  applicationName: "Folio",
  keywords: [
    "academic research workspace",
    "research paper management",
    "literature review",
    "citation management",
    "research notes",
    "academic collaboration",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Folio",
    title: "Folio — Academic Research Workspace",
    description: siteDescription,
    images: [openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Folio — Academic Research Workspace",
    description: siteDescription,
    images: [openGraphImage.url],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F3EE" },
    { media: "(prefers-color-scheme: dark)", color: "#131715" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${manrope.variable} ${newsreader.variable} ${plexMono.variable} font-sans`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
