import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

const surfaces = [
  {
    index: "01",
    surface: "PDF folder",
    detail: "Downloads, versions, reprints",
    state: "No link",
    offset: "",
  },
  {
    index: "02",
    surface: "Reference manager",
    detail: "BibTeX without context",
    state: "No link",
    offset: "sm:ml-6",
  },
  {
    index: "03",
    surface: "Notes app",
    detail: "Quotes without page numbers",
    state: "Out of date",
    offset: "sm:ml-2",
  },
  {
    index: "04",
    surface: "Draft document",
    detail: "Claims without provenance",
    state: "Unverified",
    offset: "sm:ml-8",
  },
];

export function ProblemSection() {
  return (
    <section id="product" aria-labelledby="problem-heading" className="border-b border-border">
      <div className="marketing-container py-16 sm:py-20 lg:py-24">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="flex items-start gap-2.5 lg:col-span-3 lg:flex-col lg:gap-2">
              <span className="font-mono text-[10px] tabular-nums tracking-[0.18em] text-accent">
                01
              </span>
              <span className="marketing-eyebrow">The problem</span>
            </div>
            <div className="lg:col-span-9">
              <h2 id="problem-heading" className="section-display max-w-[920px]">
                Research gets complicated.{" "}
                <span className="font-serif font-normal italic text-accent">
                  Your workflow doesn&apos;t have to.
                </span>
              </h2>
              <p className="mt-6 max-w-[600px] text-[14.5px] leading-[1.75] text-muted-foreground">
                A search result, a saved PDF, a quote in a notebook, a claim in a draft, and a task
                for a co-author are all part of one argument. Most tools hold one piece and lose the
                thread between them.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-10 border-t border-border pt-10 lg:mt-16 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-5">
            <div className="max-w-[480px] space-y-4 text-[13.5px] leading-[1.8] text-muted-foreground">
              <p>
                Discovery happens in one index. References live in a manager. Reading notes live in
                a document. Tasks live in a chat thread. Each tool is reasonable on its own, but the
                relationships — this claim to that paper, this note to that method — are held
                together by memory.
              </p>
              <p>
                Folio treats those relationships as the structure of the work. A paper, its reading
                state, the notes written against it, the review section that cites it, and the task
                that depends on it remain part of the same record.
              </p>
            </div>

            <figure className="mt-8 border-l-2 border-accent pl-5">
              <blockquote className="font-serif text-[21px] leading-[1.35] tracking-[-0.015em] text-foreground/90 sm:text-[24px]">
                “The hard part is rarely finding another paper. It is remembering why you kept the
                one you already have.”
              </blockquote>
              <figcaption className="mt-3 font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground">
                A working premise, not a finding
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.06} className="lg:col-span-7">
            <figure className="border border-border bg-card">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-5 py-3">
                <p className="marketing-eyebrow text-foreground/75">Fig. 01 — Where the thread breaks</p>
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">
                  Four surfaces · four states
                </p>
              </div>

              <ol className="space-y-2.5 p-4 sm:p-6">
                {surfaces.map((row) => (
                  <li
                    key={row.index}
                    className={cn(
                      "flex items-center gap-3 border border-border bg-background px-3 py-3 sm:px-4",
                      row.offset
                    )}
                  >
                    <span className="font-mono text-[9px] tabular-nums tracking-[0.14em] text-accent">
                      {row.index}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-medium leading-snug tracking-[-0.01em]">
                        {row.surface}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                        {row.detail}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.1em] text-accent">
                      {row.state}
                    </span>
                  </li>
                ))}
              </ol>

              <figcaption className="border-t border-border bg-surface/40 px-5 py-4">
                <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground/85">One record instead of four.</span>{" "}
                  Folio keeps the source, the reading note, the claim, and the citation inside the
                  same account-backed workspace.
                </p>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
