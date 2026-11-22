import Link from "next/link";
import { ArrowRight, Bookmark, Library, PenLine } from "lucide-react";
import { LibraryVisual } from "@/components/marketing/product-visuals";
import { Reveal } from "@/components/marketing/reveal";

const features = [
  {
    icon: Bookmark,
    title: "Search two indexes",
    body: "Results from Crossref and OpenAlex appear in one list, with the authors, venue, and DOI already attached.",
  },
  {
    icon: Library,
    title: "Keep a real library",
    body: "Save a paper once, sort it into a collection, and mark whether you have read it.",
  },
  {
    icon: PenLine,
    title: "Write next to the source",
    body: "Notes and literature reviews stay linked to the papers they came from.",
  },
];

export function Product() {
  return (
    <section id="product" className="border-b border-border py-16 sm:py-20">
      <div className="marketing-container">
        <Reveal>
          <div className="max-w-[620px]">
            <h2 className="section-display text-foreground">
              From the first search to the final draft.
            </h2>
            <p className="editorial-lede mt-4">
              Folio follows the work through finding, reading, and writing, so you
              do not have to move between four different tools to finish one
              section.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.05} className="mt-10">
          <LibraryVisual />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-8 border-t border-border pt-8 sm:grid-cols-3 sm:gap-10">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title}>
                <Icon className="size-5 text-muted-foreground" aria-hidden />
                <h3 className="mt-3 text-[15px] font-medium text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                  {feature.body}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <Link
            href="/features"
            className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            See all features <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
