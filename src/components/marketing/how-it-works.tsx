import { Reveal } from "@/components/marketing/reveal";

const steps = [
  {
    title: "Search",
    body: "Enter a topic and filter by year, access, or publication type.",
  },
  {
    title: "Save",
    body: "Add papers to your library and group them into collections.",
  },
  {
    title: "Write",
    body: "Take notes and draft reviews with your sources beside you.",
  },
  {
    title: "Share",
    body: "Invite co-authors and assign tasks and milestones.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-b border-border py-16 sm:py-20">
      <div className="marketing-container">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="section-display text-foreground">How Folio works</h2>
            <p className="max-w-[360px] text-[14px] leading-relaxed text-muted-foreground">
              Four steps, one record. Each one keeps the context from the step
              before it.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <ol className="mt-10 grid grid-cols-1 gap-8 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="text-[12.5px] text-muted-foreground">
                  Step {index + 1}
                </span>
                <h3 className="mt-2 font-serif text-[22px] leading-none text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
