import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionIntro } from "@/components/marketing/section-intro";
import { Reveal } from "@/components/marketing/reveal";

const audiences = [
  {
    index: "01",
    label: "Doctoral & early-career",
    title: "Keep a long project legible.",
    body: "Reading lists grow faster than memory. Folio keeps sources, annotations, and the argument you are building in the same place, so a three-year project stays readable.",
    needs: ["Reading notes tied to sources", "A library that survives semesters", "A review outline that grows with you"],
    href: "/signup",
    cta: "Start a workspace",
  },
  {
    index: "02",
    label: "Research teams & labs",
    title: "Share the work, not just the folder.",
    body: "Co-authors need to see which paper supports which claim, who is reading what, and what is due next. Folio makes that visible without another status meeting.",
    needs: ["Shared collections and notes", "Tasks linked to papers", "Milestones with real progress"],
    href: "/features",
    cta: "See the workspace",
  },
  {
    index: "03",
    label: "Departments & libraries",
    title: "Support research as it happens.",
    body: "Reading groups, systematic reviews, and supervisor reading lists all need somewhere to live. Folio gives research support a shared, legible surface.",
    needs: ["Structured literature reviews", "Reusable reading lists", "Transparent research signals"],
    href: "/about",
    cta: "Read the approach",
  },
];

const stages = [
  { index: "01", label: "Find", detail: "Search a scholarly catalogue and save what matters." },
  { index: "02", label: "Hold", detail: "Organise sources into collections, notes, and reviews." },
  { index: "03", label: "Move", detail: "Coordinate tasks, milestones, and co-authors." },
  { index: "04", label: "Argue", detail: "Trace claims back to evidence and cite cleanly." },
];

export function Positioning() {
  return (
    <section id="positioning" aria-labelledby="positioning-heading" className="border-b border-border">
      <div className="marketing-container py-16 sm:py-20 lg:py-24">
        <Reveal>
          <SectionIntro
            index="02"
            label="Who it is for"
            title={
              <span id="positioning-heading">
                Built for the shape of{" "}
                <span className="font-serif font-normal italic text-primary">academic work</span>.
              </span>
            }
            lede="Folio is not a generic notes app with a citation button. Its structure follows how research is actually conducted — reading widely, holding a question, and building an argument that can be defended."
          />
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((audience, index) => (
            <Reveal key={audience.index} delay={index * 0.06} className="h-full">
              <article className="flex h-full flex-col bg-card p-6 lg:p-7">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[9px] tabular-nums tracking-[0.18em] text-accent">
                    {audience.index}
                  </span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground/70">
                    {audience.label}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-[19px] font-semibold leading-tight tracking-[-0.025em]">
                  {audience.title}
                </h3>
                <p className="mt-2.5 text-[12.5px] leading-[1.7] text-muted-foreground">
                  {audience.body}
                </p>
                <ul className="mt-5 space-y-2 border-t border-border pt-4">
                  {audience.needs.map((need) => (
                    <li key={need} className="flex items-start gap-2 text-[11.5px] leading-snug text-foreground/75">
                      <span className="mt-[7px] block size-1 shrink-0 bg-accent" aria-hidden />
                      {need}
                    </li>
                  ))}
                </ul>
                <Link
                  href={audience.href}
                  className="mt-6 inline-flex items-center gap-1.5 self-start font-mono text-[8.5px] uppercase tracking-[0.14em] text-primary transition-colors hover:text-primary/75"
                >
                  {audience.cta} <ArrowUpRight className="size-3" aria-hidden />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10">
          <div className="rounded-md border border-border bg-surface/40 p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-muted-foreground">
                One workspace · four movements
              </p>
              <p className="text-[11.5px] text-muted-foreground/80">
                A research project is not a file tree. It is a line of thought.
              </p>
            </div>
            <ol className="mt-4 grid gap-px overflow-hidden rounded border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {stages.map((stage) => (
                <li key={stage.index} className="bg-background p-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[8.5px] tabular-nums text-accent">{stage.index}</span>
                    <span className="font-display text-[13px] font-semibold tracking-[-0.01em]">
                      {stage.label}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{stage.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
