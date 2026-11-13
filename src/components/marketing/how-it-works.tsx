import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

const steps = [
  {
    index: "01",
    label: "Discover",
    title: "Find relevant literature.",
    body: "Search Crossref and OpenAlex, read abstracts, and save the records that belong in the project. Filters keep the search honest rather than merely broad.",
  },
  {
    index: "02",
    label: "Collect",
    title: "Save and organise your library.",
    body: "Group papers into collections, add tags, track reading state, and write notes against the source. The library becomes a map of the reading.",
  },
  {
    index: "03",
    label: "Connect",
    title: "Build the argument.",
    body: "Organise evidence into review sections. Each claim keeps a path back to the paper and note it came from.",
  },
  {
    index: "04",
    label: "Progress",
    title: "Move the project forward.",
    body: "Assign tasks, track milestones, and share the same context with collaborators. Progress is visible in the workspace.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="workflow"
      aria-labelledby="workflow-heading"
      className="relative overflow-hidden border-b border-border"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute right-6 top-2 hidden select-none lg:block xl:right-10 xl:top-3"
      >
        <span className="editorial-number block pt-4">04</span>
      </div>

      <div className="marketing-container relative py-16 sm:py-20 lg:py-24">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
            <div className="flex items-start gap-2.5 lg:col-span-3 lg:flex-col lg:gap-2">
              <span className="font-mono text-[10px] tabular-nums tracking-[0.18em] text-accent">
                07
              </span>
              <span className="marketing-eyebrow">Workflow</span>
            </div>
            <div className="lg:col-span-9">
              <h2 id="workflow-heading" className="section-display max-w-[820px]">
                Four movements.{" "}
                <span className="font-serif font-normal italic text-primary">
                  One continuous project.
                </span>
              </h2>
              <p className="mt-5 max-w-[560px] text-[14px] leading-[1.75] text-muted-foreground">
                Folio follows the arc of a research project rather than the shape of a filing
                system. Enter at any stage; the earlier work stays in view.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <ol className="mt-12 grid border-t-2 border-foreground/80 sm:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <li
                key={step.index}
                className={cn(
                  "relative border-b border-border py-7 xl:border-b-0 xl:border-r xl:px-6 xl:py-8",
                  index % 2 === 1 && "xl:pt-14",
                  index === steps.length - 1 && "xl:border-r-0 xl:pr-0"
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-[clamp(3.5rem,5vw,5.25rem)] leading-none tracking-[-0.06em] text-foreground">
                    {step.index}
                  </span>
                  <span className="h-px flex-1 bg-border" aria-hidden />
                </div>
                <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.18em] text-accent">
                  {step.label}
                </p>
                <h3 className="mt-2 font-display text-[16px] font-semibold leading-snug tracking-[-0.02em]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[12px] leading-[1.7] text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-8 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[620px] text-[12px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground/85">No migration required.</span> Start
              with an empty workspace, or add papers as your reading develops.
            </p>
            <Link href="/signup" className="href-arrow shrink-0 text-primary hover:text-primary/75">
              Create your workspace <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
