"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const faqs = [
  {
    question: "What is Folio?",
    answer:
      "A workspace for research: finding papers, keeping a library, writing notes and literature reviews, and running projects.",
  },
  {
    question: "Where do the search results come from?",
    answer:
      "Folio queries Crossref and OpenAlex directly. Each result includes the authors, venue, year, and DOI needed for a citation.",
  },
  {
    question: "Do I need an account?",
    answer:
      "Yes. An account keeps your papers, notes, and projects separate from everyone else's.",
  },
  {
    question: "Does Folio write anything for me?",
    answer:
      "No. You write the notes and reviews. Folio formats citations from each paper's metadata.",
  },
  {
    question: "Can I work with other people?",
    answer:
      "Yes. Projects have Owner, Admin, and Member roles, with shared tasks, milestones, and activity.",
  },
  {
    question: "Which citation styles are supported?",
    answer: "APA, MLA, IEEE, and Chicago.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section className="border-b border-border py-16 sm:py-20">
      <div className="marketing-container grid grid-cols-1 gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
        <Reveal>
          <h2 className="section-display text-foreground">Questions</h2>
          <p className="mt-3 max-w-[260px] text-[14px] leading-relaxed text-muted-foreground">
            If something here is still unclear, the documentation covers the
            details.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="border-t border-border">
            {faqs.map((faq, index) => {
              const isOpen = open === index;
              const buttonId = `${baseId}-b-${index}`;
              const panelId = `${baseId}-p-${index}`;
              return (
                <div key={faq.question} className="border-b border-border">
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                  >
                    <span className="text-[15px] font-medium text-foreground">
                      {faq.question}
                    </span>
                    <Plus
                      className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                        isOpen ? "rotate-45" : ""
                      }`}
                      aria-hidden
                    />
                  </button>
                  {isOpen ? (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="pb-4 pr-8"
                    >
                      <p className="text-[14px] leading-[1.7] text-muted-foreground">
                        {faq.answer}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
