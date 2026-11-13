import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenCheck,
  Compass,
  FolderKanban,
  Library,
  NotebookPen,
  Quote,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { MarketingPage, ProseSection } from "@/components/marketing/marketing-page";
import { Reveal } from "@/components/marketing/reveal";
import { openGraphImage } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore Folio's research features: paper discovery, library and collections, research notes, projects, literature reviews, research signals, and citation formatting.",
  alternates: { canonical: "/features" },
  openGraph: {
    title: "Folio features",
    description:
      "Seven connected surfaces for discovery, organisation, synthesis, and coordination.",
    url: "/features",
    type: "website",
    images: [openGraphImage],
  },
};

const features = [
  {
    index: "01",
    icon: Compass,
    title: "Paper discovery",
    body: "Search Crossref and OpenAlex by title, author, abstract, venue, and keyword. Filter by publication type, year, and open access, then save a result directly into a collection.",
    points: ["Full-text style search across records", "Publication type and year filters", "Open-access filter", "Save to library"],
    href: "/discover",
  },
  {
    index: "02",
    icon: Library,
    title: "Research library",
    body: "A personal library that keeps reading status, progress, tags, and collection membership on every record. Filter by unread, reading, or completed.",
    points: ["Reading status and progress", "Tags across projects", "Collection membership", "Sortable paper table"],
    href: "/library",
  },
  {
    index: "03",
    icon: NotebookPen,
    title: "Research notes",
    body: "Write reading memos, quotes, and open questions next to the sources they came from. Notes remain linked to one or more papers and can be tagged for later retrieval.",
    points: ["Notes linked to papers", "Quotes and blockquotes", "Tag-based retrieval", "Autosave to your account"],
    href: "/notes",
  },
  {
    index: "04",
    icon: FolderKanban,
    title: "Projects & coordination",
    body: "Hold the people, tasks, and milestones around a research question. Every task can reference the papers it depends on, and progress is visible to the whole team.",
    points: ["Tasks with owners and priority", "Milestones and progress", "Collaborator context", "Paper-linked tasks"],
    href: "/projects",
  },
  {
    index: "05",
    icon: BookOpenCheck,
    title: "Literature reviews",
    body: "Draft a review around a structured outline. Sections, evidence, method, and findings stay together, so a claim can be traced back to its source while you write.",
    points: ["Section-based outline", "Linked evidence per section", "Method and findings fields", "Drafting progress"],
    href: "/literature",
  },
  {
    index: "06",
    icon: ScanSearch,
    title: "Research signals",
    body: "Inspect topic density and recent momentum across the papers you have saved. Signals are framed as potential opportunities, with the supporting evidence and the limits of the reading made explicit.",
    points: ["Topic output and recency", "Momentum indicators", "Evidence lists", "Explicit caution against over-reading"],
    href: "/research-gaps",
  },
  {
    index: "07",
    icon: Quote,
    title: "Citation formatting",
    body: "Format the same record in APA 7, MLA 9, IEEE, or Chicago 17th edition. Output is generated locally from the paper metadata and is ready to copy into a manuscript.",
    points: ["Four citation styles", "Deterministic formatting", "Copy-ready output", "DOI and venue handling"],
    href: "/citations",
  },
];

const absent = [
  {
    title: "No AI writing",
    body: "There is no generated prose, summarisation, or automated synthesis in this build. The researcher writes the argument.",
  },
  {
    title: "No proprietary index",
    body: "Discovery queries Crossref and OpenAlex rather than an in-house catalogue. Coverage and availability depend on those external services.",
  },
  {
    title: "No file storage",
    body: "Folio keeps bibliographic metadata, links, and your notes. It does not accept uploaded PDFs or store full-text files.",
  },
  {
    title: "No institutional tie-ins",
    body: "There are no university partnerships, SSO connectors, or publisher agreements. Nothing on the site implies endorsement by an institution.",
  },
];

export default function FeaturesPage() {
  return (
    <MarketingPage
      index="01"
      label="Features"
      title={
        <>
          Everything the research needs,{" "}
          <span className="font-serif font-normal italic text-primary">connected</span>.
        </>
      }
      lede="Folio is a set of seven surfaces that share the same sources, notes, and project context. Each one is useful alone; together they preserve the thread between evidence and argument."
      meta="Research workspace · Seven connected surfaces"
      aside={
        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
          <Link
            href="/signup"
            className="inline-flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.13em] text-foreground/75 transition-colors hover:border-primary/30 hover:text-primary"
          >
            Create an account <ArrowUpRight className="size-2.5" aria-hidden />
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.13em] text-foreground/75 transition-colors hover:border-primary/30 hover:text-primary"
          >
            Read documentation <ArrowUpRight className="size-2.5" aria-hidden />
          </Link>
        </div>
      }
    >
      <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Reveal key={feature.index} delay={index * 0.04} className="h-full">
              <article className="flex h-full flex-col bg-card p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex size-8 items-center justify-center rounded-[3px] border border-border bg-background text-primary">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="font-mono text-[8.5px] tabular-nums tracking-[0.16em] text-accent">
                    {feature.index}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-[16px] font-semibold leading-snug tracking-[-0.02em]">
                  {feature.title}
                </h2>
                <p className="mt-2 text-[12px] leading-[1.7] text-muted-foreground">{feature.body}</p>
                <ul className="mt-4 space-y-1.5 border-t border-border pt-3">
                  {feature.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-[10.5px] leading-snug text-foreground/70">
                      <span className="mt-[6px] block size-1 shrink-0 bg-primary/60" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
                <Link
                  href={feature.href}
                  className="mt-auto inline-flex items-center gap-1.5 pt-4 font-mono text-[8px] uppercase tracking-[0.13em] text-primary transition-colors hover:text-primary/75"
                >
                  Open workspace <ArrowUpRight className="size-2.5" aria-hidden />
                </Link>
              </article>
            </Reveal>
          );
        })}
      </div>

      <ProseSection title="What this build deliberately leaves out">
        <p>
          A feature list is only honest if it also states its boundaries. These capabilities are not
          present in this build, and nothing in the interface should be read as a promise that they
          are.
        </p>
        <div className="not-prose mt-4 grid gap-3 sm:grid-cols-2">
          {absent.map((item) => (
            <div key={item.title} className="rounded border border-dashed border-border bg-surface/40 p-3.5">
              <p className="!mb-0 flex items-center gap-2 font-display text-[12.5px] font-semibold">
                <ShieldCheck className="size-3.5 text-muted-foreground" aria-hidden />
                {item.title}
              </p>
              <p className="!mb-0 mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </ProseSection>

      <ProseSection title="How the surfaces connect">
        <p>
          A paper saved in discovery appears in the library. A note taken on that paper can be
          linked from a literature review. A task in a project can name the same paper as its
          evidence. The citation generator reads the same record. Nothing is copied between
          disconnected tools.
        </p>
        <p>
          This shared context is the product&apos;s central argument: research quality depends on
          keeping evidence, interpretation, and coordination in view of one another.
        </p>
      </ProseSection>
    </MarketingPage>
  );
}
