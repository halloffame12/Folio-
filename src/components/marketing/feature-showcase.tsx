import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  DiscoveryPreview,
  GapPreview,
  LibraryPreview,
  LiteraturePreview,
  ProjectsPreview,
} from "@/components/marketing/product-previews";
import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

function SectionTag({ index, label }: { index: string; label: string }) {
  return (
    <p className="flex items-baseline gap-2.5">
      <span className="font-mono text-[10px] tabular-nums tracking-[0.18em] text-accent">
        {index}
      </span>
      <span className="marketing-eyebrow">{label}</span>
    </p>
  );
}

function PointList({
  points,
  className,
  tone = "default",
}: {
  points: string[];
  className?: string;
  tone?: "default" | "inverse";
}) {
  return (
    <ul className={cn("space-y-2 border-t border-border pt-4", className)}>
      {points.map((point) => (
        <li
          key={point}
          className={cn(
            "flex items-start gap-2.5 text-[12px] leading-snug",
            tone === "inverse" ? "text-inverse-foreground/85" : "text-foreground/75"
          )}
        >
          <span
            className={cn(
              "mt-[7px] block size-1 shrink-0",
              tone === "inverse" ? "bg-inverse-foreground/70" : "bg-accent"
            )}
            aria-hidden
          />
          {point}
        </li>
      ))}
    </ul>
  );
}

function PreviewCaption({ label, tone = "muted" }: { label: string; tone?: "muted" | "inverse" }) {
  return (
    <p
      className={cn(
        "mt-2.5 font-mono text-[8px] uppercase tracking-[0.14em]",
        tone === "inverse" ? "text-inverse-foreground/75" : "text-muted-foreground"
      )}
    >
      Interface specimen · illustrative records · {label}
    </p>
  );
}

function FigureRule({ label, figure }: { label: string; figure: string }) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-t-2 border-foreground/80 pt-2.5">
      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-foreground/75">{label}</p>
      <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">
        {figure}
      </p>
    </div>
  );
}

export function FeatureShowcase() {
  return (
    <div id="features">
      {/* A — Discover ------------------------------------------------------- */}
      <section aria-labelledby="feature-discovery" className="border-b border-border">
        <div className="marketing-container py-16 sm:py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <Reveal className="lg:col-span-4">
              <SectionTag index="02" label="Discovery" />
              <h2 id="feature-discovery" className="feature-display mt-4">
                Find the work worth reading.
              </h2>
              <p className="mt-4 max-w-[420px] text-[13.5px] leading-[1.75] text-muted-foreground">
                Search Crossref and OpenAlex from a single field. Results carry title, authors,
                year, venue, abstract, DOI, and access status, normalised so records from different
                indexes can be compared.
              </p>
              <PointList
                className="mt-6"
                points={[
                  "Live Crossref and OpenAlex search",
                  "Filter by type, year, venue, and open access",
                  "Save a record to your library in place",
                ]}
              />
              <Link
                href="/discover"
                className="href-arrow mt-6 text-primary hover:text-primary/75"
              >
                Open discovery <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </Reveal>

            <Reveal delay={0.06} className="min-w-0 lg:col-span-8">
              <FigureRule label="Discovery / Scholarly search" figure="Fig. A" />
              <DiscoveryPreview />
              <PreviewCaption label="Discovery" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* B — Library ------------------------------------------------------- */}
      <section aria-labelledby="feature-library" className="border-b border-border bg-surface/45">
        <div className="marketing-container py-16 sm:py-20 lg:py-24">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
              <div className="lg:col-span-7">
                <SectionTag index="03" label="Library" />
                <h2 id="feature-library" className="feature-display mt-4 max-w-[620px]">
                  A home for everything you read.
                </h2>
              </div>
              <div className="lg:col-span-5">
                <p className="max-w-[440px] text-[13.5px] leading-[1.75] text-muted-foreground">
                  Saved papers keep their reading state, progress, tags, and collection membership.
                  Notes stay attached to the source they came from, so the context survives the
                  semester.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-8 border-t border-border pt-8 lg:grid-cols-12 lg:gap-10">
            <Reveal className="lg:col-span-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-foreground/70">
                Reading states
              </p>
              <ul className="mt-3 divide-y divide-border border-y border-border">
                {[
                  { state: "Unread", detail: "Saved, not opened" },
                  { state: "Reading", detail: "Notes in progress" },
                  { state: "Completed", detail: "Reviewed and annotated" },
                ].map((row) => (
                  <li key={row.state} className="py-3">
                    <p className="font-display text-[12.5px] font-semibold tracking-[-0.01em]">
                      {row.state}
                    </p>
                    <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                      {row.detail}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[11.5px] leading-relaxed text-muted-foreground">
                Every state belongs to your own record, not to a shared workspace catalogue.
              </p>
              <Link
                href="/library"
                className="href-arrow mt-4 text-primary hover:text-primary/75"
              >
                Explore the library <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </Reveal>

            <Reveal delay={0.06} className="min-w-0 lg:col-span-8 lg:col-start-5">
              <FigureRule label="Library / Saved records" figure="Fig. B" />
              <LibraryPreview />
              <PreviewCaption label="Library" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* C — Projects ------------------------------------------------------ */}
      <section aria-labelledby="feature-projects" className="border-b border-border">
        <div className="marketing-container py-16 sm:py-20 lg:py-24">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-6">
                <SectionTag index="04" label="Projects" />
                <h2 id="feature-projects" className="feature-display mt-4 max-w-[560px]">
                  Turn scattered work into structured progress.
                </h2>
              </div>
              <div className="lg:col-span-5 lg:col-start-8">
                <p className="max-w-[440px] text-[13.5px] leading-[1.75] text-muted-foreground">
                  A project holds the people, tasks, milestones, and papers around a research
                  question. Progress is computed from completed work rather than guessed.
                </p>
                <Link
                  href="/projects"
                  className="href-arrow mt-5 text-primary hover:text-primary/75"
                >
                  View projects <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="mt-8 grid grid-cols-1 border-y border-border sm:grid-cols-3">
              {[
                { label: "Tasks", detail: "Owners, priority, due dates, linked papers" },
                { label: "Milestones", detail: "Progress calculated from completed work" },
                { label: "Membership", detail: "Owner, admin, and member roles" },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={cn(
                    "py-4 sm:px-5 sm:first:pl-0 sm:last:pr-0",
                    index > 0 && "border-t border-border sm:border-l sm:border-t-0"
                  )}
                >
                  <p className="font-display text-[12.5px] font-semibold tracking-[-0.01em]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08} className="mt-8 block lg:pl-[8.333%]">
            <FigureRule label="Projects / Coordination" figure="Fig. C" />
            <ProjectsPreview />
            <PreviewCaption label="Projects" />
          </Reveal>
        </div>
      </section>

      {/* D — Literature reviews -------------------------------------------- */}
      <section aria-labelledby="feature-literature" className="border-b border-border bg-surface/45">
        <div className="marketing-container py-16 sm:py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <Reveal className="lg:col-span-5">
              <SectionTag index="05" label="Literature reviews" />
              <h2 id="feature-literature" className="feature-display mt-4">
                Connect ideas. Build the argument.
              </h2>
              <p className="mt-4 max-w-[420px] text-[13.5px] leading-[1.75] text-muted-foreground">
                Build a section outline, attach the papers each section relies on, and keep method
                and findings beside the prose. The review stays a structured argument rather than a
                growing bibliography.
              </p>
            </Reveal>

            <Reveal delay={0.06} className="lg:col-span-6 lg:col-start-7">
              <div className="border-l-2 border-accent pl-5">
                <p className="font-serif text-[20px] leading-[1.4] tracking-[-0.015em] text-foreground/90 sm:text-[23px]">
                  “A claim without its evidence is only a sentence with a citation-shaped hole.”
                </p>
                <p className="mt-3 font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground">
                  The premise behind linked evidence
                </p>
              </div>
              <PointList
                className="mt-6"
                points={[
                  "Sections linked to the papers they depend on",
                  "Method and findings kept next to the draft",
                  "Progress that reflects drafted sections",
                ]}
              />
              <Link
                href="/literature"
                className="href-arrow mt-6 text-primary hover:text-primary/75"
              >
                Open a literature review <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </Reveal>
          </div>

          <Reveal delay={0.08} className="mt-10 block">
            <FigureRule label="Literature review / Outline and evidence" figure="Fig. D" />
            <LiteraturePreview />
            <PreviewCaption label="Literature review" />
          </Reveal>
        </div>
      </section>

      {/* E — Research gap explorer ----------------------------------------- */}
      <section
        aria-labelledby="feature-gaps"
        className="border-b border-border bg-inverse text-inverse-foreground"
      >
        <div className="marketing-container py-16 sm:py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <Reveal className="lg:col-span-5">
              <p className="flex items-baseline gap-2.5">
                <span className="font-mono text-[10px] tabular-nums tracking-[0.18em] text-inverse-foreground/80">
                  06
                </span>
                <span className="font-mono text-[10px] uppercase leading-none tracking-[0.2em] text-inverse-foreground/80">
                  Research gap explorer
                </span>
              </p>
              <h2 id="feature-gaps" className="feature-display mt-4">
                See what your research corpus is missing.
              </h2>
              <p className="mt-4 max-w-[430px] text-[13.5px] leading-[1.75] text-inverse-foreground/85">
                Analyse the papers you have collected. Folio reports topic distribution, source
                coverage, and the supporting papers behind each theme, so you can explore patterns
                and underrepresented topics inside your own corpus.
              </p>

              <div className="mt-6 border border-inverse-foreground/20 p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-inverse-foreground/80">
                  What this is not
                </p>
                <p className="mt-2 text-[11.5px] leading-relaxed text-inverse-foreground/85">
                  It does not declare a scientifically validated gap. Low output can reflect method,
                  funding, ethics, or deliberate exclusion. Every result is presented as a potential
                  opportunity with its limitations.
                </p>
              </div>

              <PointList
                className="mt-6 border-inverse-foreground/20"
                tone="inverse"
                points={[
                  "Corpus statistics from the papers you saved",
                  "Topic distribution with supporting papers",
                  "Limitations stated beside every result",
                ]}
              />
              <Link
                href="/research-gaps"
                className="href-arrow mt-6 text-inverse-foreground hover:text-inverse-foreground/75"
              >
                Explore research gaps <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </Reveal>

            <Reveal delay={0.06} className="min-w-0 lg:col-span-7">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-t-2 border-inverse-foreground/40 pt-2.5">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-inverse-foreground/85">
                  Gap explorer / Corpus analysis
                </p>
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-inverse-foreground/75">
                  Fig. E
                </p>
              </div>
              <div className="border border-inverse-foreground/15 bg-background p-2 text-foreground sm:p-3">
                <GapPreview />
              </div>
              <PreviewCaption label="Gap explorer" tone="inverse" />
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
