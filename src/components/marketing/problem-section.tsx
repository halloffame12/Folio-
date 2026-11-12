import { Reveal } from "@/components/marketing/reveal";
import { SectionIntro } from "@/components/marketing/section-intro";

const problems = [
  {
    index: "01",
    label: "Fragmentation",
    title: "The work lives in six places.",
    body: "A reference manager here, a notes app there, a shared drive for drafts, and a group chat for decisions. Nothing is wrong on its own — but the thread between them is held together by memory.",
  },
  {
    index: "02",
    label: "Lost provenance",
    title: "Notes drift from their sources.",
    body: "A quote loses its page number. A summary loses the caveat that mattered. Months later, the honest answer to “where did this claim come from?” is a folder and a guess.",
  },
  {
    index: "03",
    label: "Invisible coordination",
    title: "Teams rediscover the same context.",
    body: "Who read this paper? Which task is waiting on that review? What did we decide about the exclusion criteria? Coordination lives in people rather than in the workspace.",
  },
  {
    index: "04",
    label: "False confidence",
    title: "A gap is not an absence.",
    body: "Low output on a topic can reflect funding, ethics, method, or deliberate exclusion. Tools that present silence as opportunity encourage a claim the evidence has not earned.",
  },
];

export function ProblemSection() {
  return (
    <section
      id="problem"
      aria-labelledby="problem-heading"
      className="relative overflow-hidden border-b border-border bg-surface/30"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border) / 0.5) 1px, transparent 1px)",
          backgroundSize: "25% 100%",
        }}
      />
      <div className="marketing-container relative py-16 sm:py-20 lg:py-24">
        <Reveal>
          <SectionIntro
            index="03"
            label="The problem"
            title={
              <span id="problem-heading">
                Good research is not a{" "}
                <span className="font-serif font-normal italic text-accent">storage</span> problem.
              </span>
            }
            lede="Most academic tools are built to hold files. Research is built from relationships: this claim to that paper, this note to that method, this question to a body of work. When those relationships are not represented, the work becomes harder to trust."
          />
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-14">
          <Reveal className="lg:sticky lg:top-24 lg:self-start">
            <figure className="m-0 border-l-2 border-accent/70 pl-5">
              <blockquote className="font-serif text-[22px] leading-[1.35] tracking-[-0.015em] text-foreground/90 sm:text-[26px]">
                “The hard part is rarely finding another paper. It is remembering why you kept
                the one you already have.”
              </blockquote>
              <figcaption className="mt-4 font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground">
                A working premise, not a finding
              </figcaption>
            </figure>

            <div className="mt-8 rounded border border-dashed border-border bg-background/70 p-4">
              <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted-foreground">
                What Folio does not claim
              </p>
              <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
                We do not claim that software solves research. Folio is a considered place to hold
                the work: sources, notes, reviews, and coordination. Judgement stays with the
                researcher.
              </p>
            </div>
          </Reveal>

          <div className="divide-y divide-border border-y border-border">
            {problems.map((problem, index) => (
              <Reveal key={problem.index} delay={index * 0.05}>
                <div className="grid gap-3 py-6 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-6">
                  <div className="flex items-baseline gap-2 sm:flex-col sm:gap-1.5">
                    <span className="font-mono text-[9px] tabular-nums tracking-[0.16em] text-accent">
                      {problem.index}
                    </span>
                    <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">
                      {problem.label}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-[17px] font-semibold leading-snug tracking-[-0.02em]">
                      {problem.title}
                    </h3>
                    <p className="mt-1.5 max-w-[560px] text-[12.5px] leading-[1.7] text-muted-foreground">
                      {problem.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
