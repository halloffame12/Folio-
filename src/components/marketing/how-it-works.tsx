import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";
import { SectionIntro } from "@/components/marketing/section-intro";

const steps = [
  {
    index: "01",
    label: "Discover",
    title: "Start with the literature.",
    body: "Search the catalogue, read abstracts, and save the records that belong in the project. Filters keep the search honest rather than merely broad.",
    detail: "Discovery → Library",
  },
  {
    index: "02",
    label: "Organise",
    title: "Give the sources a structure.",
    body: "Group papers into collections, attach reading notes, and mark what is still unread. The library becomes a map of the reading, not a growing pile.",
    detail: "Collections → Notes",
  },
  {
    index: "03",
    label: "Synthesise",
    title: "Draft the review around evidence.",
    body: "Build a review outline, link sections to the papers they depend on, and keep method and findings beside the prose. Claims stay traceable while you write.",
    detail: "Literature → Citations",
  },
  {
    index: "04",
    label: "Coordinate",
    title: "Move the project with your team.",
    body: "Assign tasks, track milestones, and share the same context. Progress is visible in the workspace instead of reconstructed in conversation.",
    detail: "Projects → Milestones",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="relative border-b border-border bg-surface/30"
    >
      <div className="marketing-container py-16 sm:py-20 lg:py-24">
        <Reveal>
          <SectionIntro
            index="05"
            label="How it works"
            title={
              <span id="how-it-works-heading">
                Four movements, one{" "}
                <span className="font-serif font-normal italic text-accent">continuous</span> project.
              </span>
            }
            lede="Folio follows the arc of a research project rather than the shape of a filing system. You can enter at any stage; the workspace keeps the earlier work in view."
          />
        </Reveal>

        <div className="mt-12">
          <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <Reveal key={step.index} delay={index * 0.06} className="h-full">
                <div className="relative flex h-full flex-col bg-background p-6 lg:p-7">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute right-4 top-3 font-serif text-[54px] leading-none tracking-[-0.06em] text-primary/[0.07]"
                  >
                    {step.index}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-[3px] border border-primary/20 bg-primary/[0.06] font-mono text-[8.5px] tabular-nums text-primary">
                      {step.index}
                    </span>
                    <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-muted-foreground">
                      {step.label}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-[17px] font-semibold leading-snug tracking-[-0.02em]">
                    {step.title}
                  </h3>
                  <p className="mt-2 flex-1 text-[12px] leading-[1.7] text-muted-foreground">
                    {step.body}
                  </p>
                  <p className="mt-5 border-t border-border pt-3 font-mono text-[7.5px] uppercase tracking-[0.13em] text-muted-foreground/60">
                    {step.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-8">
            <div className="flex flex-col gap-3 rounded border border-dashed border-border bg-background/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-[620px] text-[12px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground/85">No migration required.</span>{" "}
                The workspace includes sample data so you can see the
                whole arc before entering anything of your own.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-primary transition-colors hover:text-primary/75"
              >
                Walk through the demo <ArrowRight className="size-3" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
