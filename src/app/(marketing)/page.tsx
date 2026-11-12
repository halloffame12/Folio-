import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { Positioning } from "@/components/marketing/positioning";
import { ProblemSection } from "@/components/marketing/problem-section";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Showcase } from "@/components/marketing/showcase";
import { AudienceSection } from "@/components/marketing/audience-section";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/final-cta";
import { openGraphImage } from "@/lib/metadata";

export const metadata: Metadata = {
  title: {
    absolute: "Folio — Academic Research Workspace",
  },
  description:
    "Discover scholarly papers, organise your library, write connected research notes, build literature reviews, and coordinate projects in one considered academic workspace.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Folio — Academic Research Workspace",
    description:
      "One workspace for the entire research journey, from the first search to the final citation.",
    url: "/",
    type: "website",
    images: [openGraphImage],
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Positioning />
      <ProblemSection />
      <FeatureShowcase />
      <HowItWorks />
      <Showcase />
      <AudienceSection />
      <Faq />
      <FinalCta />
    </>
  );
}
