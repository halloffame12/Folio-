import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { Product } from "@/components/marketing/product";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/final-cta";
import { openGraphImage } from "@/lib/metadata";

export const metadata: Metadata = {
  title: {
    absolute: "Folio | Academic Research Workspace",
  },
  description:
    "Search scholarly papers through Crossref and OpenAlex, keep a library, write notes and literature reviews, and run research projects in one workspace.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Folio | Academic Research Workspace",
    description:
      "One workspace for the papers you find, the notes you take, and the projects you run.",
    url: "/",
    type: "website",
    images: [openGraphImage],
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Product />
      <FeatureShowcase />
      <HowItWorks />
      <Faq />
      <FinalCta />
    </>
  );
}
