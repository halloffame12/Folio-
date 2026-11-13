import Link from "next/link";
import { ArrowDown, ArrowRight, Library, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";
import { library, papersById } from "@/mocks/data";
import { cn } from "@/lib/utils";

const specimenIds = ["p1", "p4", "p2"];

const statusLabel: Record<string, string> = {
  unread: "Unread",
  reading: "Reading",
  completed: "Read",
};

export function Hero() {
  return (
    <section id="top" className="relative border-b border-border">
      <div className="border-b border-border">
        <div className="marketing-container flex items-center justify-between gap-4 py-2.5">
          <p className="marketing-eyebrow flex items-center gap-2.5">
            <span className="inline-block size-1.5 bg-accent" aria-hidden />
            Research workspace
            <span className="text-border">/</span>
            <span className="text-muted-foreground">Vol. 01</span>
          </p>
          <p className="marketing-eyebrow hidden text-muted-foreground sm:block">
            Discover · Organise · Review
          </p>
        </div>
      </div>

      <div className="marketing-container">
        <div className="grid lg:grid-cols-12">
          <div className="min-w-0 border-border pb-12 pt-10 sm:pt-14 lg:col-span-7 lg:border-r lg:py-20 lg:pr-12 xl:py-24 xl:pr-16">
            <Reveal>
              <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="h-px w-8 bg-accent" aria-hidden />
                A research workspace
              </p>
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="hero-title mt-7 text-foreground">
                Research
                <br />
                deserves
                <br />
                <span className="font-serif font-normal italic tracking-[-0.03em] text-accent">
                  a better
                </span>
                <br />
                system.
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-7 max-w-[46ch] text-[14.5px] leading-[1.75] text-muted-foreground sm:text-[15px]">
                Discover scholarly work, organise your literature, manage research projects, and
                build a clearer path from reading to original ideas.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6">
                <Button
                  asChild
                  size="lg"
                  className="h-11 w-full rounded-none px-6 text-[13px] tracking-[-0.01em] sm:w-auto"
                >
                  <Link href="/signup">
                    Start researching <ArrowRight />
                  </Link>
                </Button>
                <Link
                  href="#product"
                  className="group inline-flex h-11 items-center gap-2 border-b border-foreground/25 text-[13px] font-medium tracking-[-0.01em] text-foreground transition-colors hover:border-foreground"
                >
                  Explore the platform
                  <ArrowDown className="size-3.5 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="mt-10 max-w-[420px] border-t border-border pt-4 text-[12px] leading-relaxed text-muted-foreground">
                Built for students, researchers, and academic teams.
              </p>
            </Reveal>
          </div>

          <div className="relative min-w-0 border-border bg-surface/40 pb-14 pt-8 lg:col-span-5 lg:py-20 lg:pl-10 xl:pl-14">
            <div className="flex items-center justify-between gap-3">
              <span className="marketing-eyebrow flex items-center gap-2 text-foreground/80">
                <span className="size-1.5 rounded-full bg-success" aria-hidden />
                Library
              </span>
              <span className="marketing-eyebrow text-muted-foreground">Specimen</span>
            </div>

            <Reveal delay={0.12} y={22}>
              <div className="relative mt-3">
                <article className="border border-border bg-card">
                  <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5 sm:px-4">
                    <div className="flex items-center gap-2">
                      <span className="grid size-6 place-items-center border border-border bg-surface/70 text-primary">
                        <Library className="size-3" aria-hidden />
                      </span>
                      <span className="text-[11.5px] font-medium tracking-[-0.01em]">
                        Research library
                      </span>
                    </div>
                    <span className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground">
                      24 records
                    </span>
                  </div>

                  <div className="flex items-center gap-2 border-b border-border bg-surface/40 px-3 py-2">
                    <Search className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
                      verification labour
                    </span>
                    <span className="shrink-0 border border-border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.08em] text-muted-foreground">
                      All fields
                    </span>
                  </div>

                  <ul className="divide-y divide-border/70">
                    {specimenIds.map((id) => {
                      const paper = papersById[id];
                      if (!paper) return null;
                      const entry = library.find((item) => item.paperId === id);
                      const status = entry?.status ?? "unread";
                      const progress = entry?.readingProgress ?? 0;
                      return (
                        <li key={id} className="px-3 py-3 sm:px-4">
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 w-8 shrink-0 font-mono text-[9px] tabular-nums text-muted-foreground">
                              {paper.year}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 font-serif text-[13px] font-medium leading-snug tracking-[-0.01em]">
                                {paper.title}
                              </p>
                              <p className="mt-1 truncate text-[10px] text-muted-foreground">
                                {paper.authors[0]?.name}
                                {paper.authors.length > 1 ? " et al." : ""} · {paper.venueShort}
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="h-1 flex-1 overflow-hidden bg-secondary">
                                  <span
                                    className="block h-full bg-primary"
                                    style={{ width: `${progress}%` }}
                                  />
                                </span>
                                <span className="font-mono text-[8px] tabular-nums text-muted-foreground">
                                  {progress}%
                                </span>
                                <span
                                  className={cn(
                                    "shrink-0 border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.08em]",
                                    status === "completed"
                                      ? "border-success/30 text-success"
                                      : status === "reading"
                                        ? "border-accent/30 text-accent"
                                        : "border-border text-muted-foreground"
                                  )}
                                >
                                  {statusLabel[status] ?? status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2 sm:px-4">
                    <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
                      01 — 03 / 24
                    </span>
                    <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-primary">
                      Open library →
                    </span>
                  </div>
                </article>

                <div className="mt-3 w-full border border-border bg-background p-4 lg:-ml-8 lg:w-[248px]">
                  <p className="flex items-center justify-between gap-2 font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground">
                    Project <span className="text-accent">Active</span>
                  </p>
                  <p className="mt-2 font-display text-[14px] font-semibold leading-snug tracking-[-0.02em]">
                    The provenance of trust in AI-assisted review
                  </p>
                  <div className="mt-3 flex items-baseline justify-between gap-2 font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground">
                    <span>Progress</span>
                    <span className="tabular-nums text-foreground/80">68%</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden bg-secondary">
                    <div className="h-full w-[68%] bg-primary" />
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-2 font-mono text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                    <span>4 members</span>
                    <span>2 milestones</span>
                  </div>
                </div>
              </div>
            </Reveal>

            <p className="mt-4 font-mono text-[8px] uppercase leading-relaxed tracking-[0.12em] text-muted-foreground">
              Interface specimen · illustrative records
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
