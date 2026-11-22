import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
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
    "Paper discovery, library and collections, research notes, projects, literature reviews, research signals, and citation formatting.",
  alternates: { canonical: "/features" },
  openGraph: {
    title: "Folio features",
    description: "The parts of Folio and what each one does.",
    url: "/features",
    type: "website",
    images: [openGraphImage],
  },
};

const features = [
  {
    icon: Compass,
    title: "Paper discovery",
    body: "Search Crossref and OpenAlex by title, author, abstract, venue, and keyword. Filter by publication type, year, and open access, then save a result to a collection.",
    points: ["Search across both indexes", "Filter by type, year, and access", "Save straight to your library"],
    href: "/discover",
  },
  {
    icon: Library,
    title: "Library and collections",
    body: "Your saved papers, with reading status, progress, tags, and collection membership. Filter by unread, reading, or completed.",
    points: ["Reading status and progress", "Tags and collections", "Sortable paper list"],
    href: "/library",
  },
  {
    icon: NotebookPen,
    title: "Research notes",
    body: "Write reading memos, quotes, and open questions next to the sources they came from. A note can stay linked to one or more papers.",
    points: ["Notes linked to papers", "Quotes and headings", "Search across your notes"],
    href: "/notes",
  },
  {
    icon: FolderKanban,
    title: "Projects and tasks",
    body: "Keep the people, tasks, and milestones around a research question in one place. Tasks can point to the papers they depend on.",
    points: ["Tasks with owners and priority", "Milestones and progress", "Paper-linked tasks"],
    href: "/projects",
  },
  {
    icon: BookOpenCheck,
    title: "Literature reviews",
    body: "Build a review around a section outline. Each section keeps the papers that support it, so a claim stays traceable while you write.",
    points: ["Section outline", "Linked evidence per section", "Drafting progress"],
    href: "/literature",
  },
  {
    icon: ScanSearch,
    title: "Research signals",
    body: "See how much you have saved on a topic and how recent it is. These readings are meant as prompts, not proof that a gap exists.",
    points: ["Topic output and recency", "Momentum indicators", "Supporting paper lists"],
    href: "/research-gaps",
  },
  {
    icon: Quote,
    title: "Citation formatting",
    body: "Format a paper in APA 7, MLA 9, IEEE, or Chicago 17th edition. The output is generated from the stored metadata and ready to copy.",
    points: ["Four citation styles", "Generated from metadata", "Copy-ready output"],
    href: "/citations",
  },
];

const absent = [
  {
    title: "No AI writing",
    body: "No generated prose, summaries, or automatic synthesis. You write the argument.",
  },
  {
    title: "No private index",
    body: "Discovery queries Crossref and OpenAlex. Coverage depends on those services.",
  },
  {
    title: "No PDF storage",
    body: "Folio keeps metadata, links, and your notes. It does not accept uploaded PDFs.",
  },
  {
    title: "No institutional tie-ins",
    body: "No university partnerships, single sign-on, or publisher agreements.",
  },
];

export default function FeaturesPage() {
  return (
    <MarketingPage
      label="Features"
      title="What Folio does"
      lede="Seven parts of the workspace that share the same papers, notes, and project context."
      aside={
        <div className="space-y-3">
          <p className="text-[13px] font-medium text-foreground">Start here</p>
          <div className="flex flex-col gap-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Create an account <ArrowRight className="size-3.5" aria-hidden />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Read the documentation <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Reveal key={feature.title} delay={index * 0.03} className="h-full">
              <article className="flex h-full flex-col rounded-lg border border-border bg-card p-5">
                <Icon className="size-5 text-muted-foreground" aria-hidden />
                <h2 className="mt-3 text-[15px] font-medium text-foreground">
                  {feature.title}
                </h2>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                  {feature.body}
                </p>
                <ul className="mt-4 space-y-1.5 border-t border-border pt-3">
                  {feature.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-[12.5px] leading-snug text-muted-foreground"
                    >
                      <span className="mt-1.5 block size-1 shrink-0 rounded-full bg-border" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
                <Link
                  href={feature.href}
                  className="mt-auto inline-flex items-center gap-1 pt-4 text-[13px] text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  Open workspace <ArrowRight className="size-3" aria-hidden />
                </Link>
              </article>
            </Reveal>
          );
        })}
      </div>

      <ProseSection title="What the build leaves out">
        <p>These are not part of the application, and nothing on the site suggests otherwise.</p>
        <div className="not-prose mt-4 grid gap-3 sm:grid-cols-2">
          {absent.map((item) => (
            <div key={item.title} className="rounded-md border border-border p-4">
              <p className="!mb-0 flex items-center gap-2 text-[13px] font-medium text-foreground">
                <ShieldCheck className="size-4 text-muted-foreground" aria-hidden />
                {item.title}
              </p>
              <p className="!mb-0 mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </ProseSection>

      <ProseSection title="How the parts connect">
        <p>
          A paper saved in discovery appears in your library. A note taken on that paper can be
          linked from a literature review. A task in a project can name the same paper as evidence.
          The citation generator reads the same record.
        </p>
        <p>
          You do not copy the same information between separate tools. Every part of the workspace
          reads from the same set of saved papers.
        </p>
      </ProseSection>
    </MarketingPage>
  );
}
