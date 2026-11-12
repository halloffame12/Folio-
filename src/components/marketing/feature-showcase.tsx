import type { ComponentType } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  CitationPreview,
  DiscoveryPreview,
  GapPreview,
  LibraryPreview,
  LiteraturePreview,
  NotesPreview,
  ProjectsPreview,
} from "@/components/marketing/product-previews";
import { Reveal } from "@/components/marketing/reveal";
import { SectionIntro } from "@/components/marketing/section-intro";

interface Feature {
  index: string;
  label: string;
  title: string;
  body: string;
  points: string[];
  link: { href: string; label: string };
  Preview: ComponentType<{ className?: string }>;
}

const features: Feature[] = [
  {
    index: "01",
    label: "Discovery",
    title: "Search like a scholar, not a shopper.",
    body: "Search a demonstration catalogue of scholarly records with filters that match how literature searching actually works: publication type, year, access, venue, and field.",
    points: [
      "Filters for publication type, year, and open access",
      "Abstracts, authors, venues, DOIs, and keywords in one record",
      "Save a result to a collection without leaving the search",
    ],
    link: { href: "/discover", label: "Open discovery" },
    Preview: DiscoveryPreview,
  },
  {
    index: "02",
    label: "Library",
    title: "A library that remembers the reading.",
    body: "Saved papers are only useful if their context survives. Folio keeps reading status, progress, tags, and the collections a paper belongs to.",
    points: [
      "Reading states from unread to completed",
      "Tags and collections shared across a project",
      "Progress you can see at a glance",
    ],
    link: { href: "/library", label: "Explore the library" },
    Preview: LibraryPreview,
  },
  {
    index: "03",
    label: "Notes",
    title: "Notes that stay attached to the source.",
    body: "Write reading memos beside the paper they came from. Quotes, caveats, and open questions remain linked to the record rather than floating in a separate document.",
    points: [
      "Notes linked to one or more papers",
      "Quotes and summaries held side by side",
      "Tags that connect notes across projects",
    ],
    link: { href: "/notes", label: "See research notes" },
    Preview: NotesPreview,
  },
  {
    index: "04",
    label: "Projects",
    title: "Coordination without another status meeting.",
    body: "A project holds the people, tasks, and milestones around a research question. Each task can point back to the papers it depends on.",
    points: [
      "Tasks with owners, priority, and due dates",
      "Milestones with visible progress",
      "Collaborators and shared context in one view",
    ],
    link: { href: "/projects", label: "View a project" },
    Preview: ProjectsPreview,
  },
  {
    index: "05",
    label: "Literature review",
    title: "Build the argument, section by section.",
    body: "A review workspace keeps an outline, linked evidence, and drafting progress together. Move from a pile of papers to a structure you can defend.",
    points: [
      "Sections linked to the evidence they rely on",
      "Method and findings kept next to the draft",
      "Progress that reflects drafting, not optimism",
    ],
    link: { href: "/literature", label: "Open a review" },
    Preview: LiteraturePreview,
  },
  {
    index: "06",
    label: "Research signals",
    title: "Read absence carefully.",
    body: "The gap explorer shows topic density and recent momentum from the demonstration index. It surfaces potential opportunities — and states plainly that low output is not proof of a gap.",
    points: [
      "Topic output and recent activity side by side",
      "Evidence lists for each potential opportunity",
      "An explicit caution against over-reading silence",
    ],
    link: { href: "/research-gaps", label: "Explore research gaps" },
    Preview: GapPreview,
  },
  {
    index: "07",
    label: "Citations",
    title: "References that match the style guide.",
    body: "Generate the same record in APA, MLA, IEEE, and Chicago. Formatting is deterministic, so what you copy is what the style requires.",
    points: [
      "Four citation styles from one record",
      "Author, venue, year, volume, and DOI handled",
      "Copy-ready output for your manuscript",
    ],
    link: { href: "/citations", label: "Try the generator" },
    Preview: CitationPreview,
  },
];

export function FeatureShowcase() {
  return (
    <section id="features" aria-labelledby="features-heading" className="border-b border-border">
      <div className="marketing-container py-16 sm:py-20 lg:py-24">
        <Reveal>
          <SectionIntro
            index="04"
            label="The workspace"
            title={
              <span id="features-heading">
                Seven parts of one{" "}
                <span className="font-serif font-normal italic text-primary">research practice</span>.
              </span>
            }
            lede="Each surface is useful on its own. Together they keep the thread between a source, a note, a claim, and a citation — the part that usually goes missing."
          />
        </Reveal>

        <div className="mt-14 space-y-14 sm:space-y-16 lg:space-y-20">
          {features.map((feature, index) => {
            const reversed = index % 2 === 1;
            const Preview = feature.Preview;
            return (
              <Reveal key={feature.index}>
                <article className="grid items-center gap-7 lg:grid-cols-2 lg:gap-12">
                  <div className={reversed ? "lg:order-2" : undefined}>
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-mono text-[9px] tabular-nums tracking-[0.18em] text-accent">
                        {feature.index}
                      </span>
                      <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-muted-foreground">
                        {feature.label}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-[24px] font-semibold leading-[1.12] tracking-[-0.03em] sm:text-[28px]">
                      {feature.title}
                    </h3>
                    <p className="mt-3 max-w-[470px] text-[13px] leading-[1.75] text-muted-foreground">
                      {feature.body}
                    </p>
                    <ul className="mt-5 space-y-2 border-t border-border pt-4">
                      {feature.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2.5 text-[11.5px] leading-snug text-foreground/75"
                        >
                          <span className="mt-[6px] block size-1 shrink-0 bg-primary/70" aria-hidden />
                          {point}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={feature.link.href}
                      className="mt-5 inline-flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-primary transition-colors hover:text-primary/75"
                    >
                      {feature.link.label} <ArrowUpRight className="size-3" aria-hidden />
                    </Link>
                  </div>

                  <div
                    className={
                      reversed
                        ? "min-w-0 lg:order-1 lg:-ml-4"
                        : "min-w-0 lg:-mr-4"
                    }
                  >
                    <Preview />
                    <p className="mt-2 text-right font-mono text-[7.5px] uppercase tracking-[0.14em] text-muted-foreground/60">
                      Demonstration data · {feature.label}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
