import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { CredibilityStrip } from "@/components/marketing/credibility-strip";
import { ProblemSection } from "@/components/marketing/problem-section";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { AudienceSection } from "@/components/marketing/audience-section";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/final-cta";
import { openGraphImage } from "@/lib/metadata";

export const metadata: Metadata = {
  title: {
    absolute: "Folio — Academic Research Workspace",
  },
  description:
    "Discover scholarly papers through Crossref and OpenAlex, organise your library, write connected research notes, build literature reviews, and coordinate projects in one academic workspace.",
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
      <CredibilityStrip />
      <ProblemSection />
      <FeatureShowcase />
      <HowItWorks />
      <AudienceSection />
      <Faq />
      <FinalCta />
    </>
  );
}
