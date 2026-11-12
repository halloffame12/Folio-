"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Minus, Plus } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const faqs = [
  {
    question: "Is Folio a real, launched product?",
    answer:
      "No. Folio is a frontend demonstration built as a capstone project. The interface, authentication states, and workspace are real code, but there is no production backend, no live scholarly index, and no real email delivery. Every paper, author, project, and note is fictional.",
  },
  {
    question: "Do I need an account to explore the workspace?",
    answer:
      "No. The demonstration workspace at /dashboard is open and preloaded with a complete research project. Creating an account walks through the interface states for registration, verification, and sign-in, but it is not required to see the product.",
  },
  {
    question: "Does Folio send email or verify real addresses?",
    answer:
      "No. Registration, password reset, and email verification are simulated in the browser. The verification screen lets you preview pending, verified, and expired-link states. No message leaves the page, and no token is validated by a server.",
  },
  {
    question: "Does Folio use AI to write reviews or discover gaps?",
    answer:
      "No. There is no AI writing or automated literature synthesis in this build. The gap explorer reads a demonstration index and presents topic density as a potential opportunity, with an explicit caution that low output is not proof of a gap. Interpretation remains with the researcher.",
  },
  {
    question: "Which citation styles are supported?",
    answer:
      "The citation generator formats a record in APA 7, MLA 9, IEEE, and Chicago 17th edition. Formatting runs locally from the paper metadata, so the output is deterministic rather than generated.",
  },
  {
    question: "Where is my data stored?",
    answer:
      "Any account you create in the demonstration is kept in this browser's local storage, and the workspace state is also local. Nothing is transmitted to a server. Because this is not a production system, please do not enter sensitive or unpublished material.",
  },
  {
    question: "Can I use Folio with a research team?",
    answer:
      "The demonstration includes collaborators, shared collections, tasks, and milestones so you can see how team coordination is modelled. Those collaborators are fictional. Real multi-user access, permissions, and sync would require a backend that this phase does not include.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="faq" aria-labelledby="faq-heading" className="border-b border-border">
      <div className="marketing-container py-16 sm:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
          <Reveal className="lg:sticky lg:top-24 lg:self-start">
            <p className="flex items-baseline gap-2.5">
              <span className="font-mono text-[9px] tabular-nums tracking-[0.18em] text-accent">08</span>
              <span className="eyebrow">Questions</span>
            </p>
            <h2 id="faq-heading" className="display-lg mt-4 max-w-[420px]">
              Asked plainly,{" "}
              <span className="font-serif font-normal italic text-primary">answered</span> honestly.
            </h2>
            <p className="editorial-lede mt-4 max-w-[380px]">
              This build is deliberately transparent about what it is and what it is not. If
              something is still unclear, the documentation and help pages go further.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/help"
                className="inline-flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.13em] text-foreground/75 transition-colors hover:border-primary/30 hover:text-primary"
              >
                Help center <ArrowUpRight className="size-2.5" aria-hidden />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.13em] text-foreground/75 transition-colors hover:border-primary/30 hover:text-primary"
              >
                Documentation <ArrowUpRight className="size-2.5" aria-hidden />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="border-t border-border">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                const buttonId = `${baseId}-button-${index}`;
                const panelId = `${baseId}-panel-${index}`;
                return (
                  <div key={faq.question} className="border-b border-border">
                    <h3>
                      <button
                        type="button"
                        id={buttonId}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="group flex w-full items-start gap-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:py-5"
                      >
                        <span className="mt-0.5 font-mono text-[8.5px] tabular-nums tracking-[0.14em] text-muted-foreground/60">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 font-display text-[14.5px] font-medium leading-snug tracking-[-0.01em] text-foreground sm:text-[15.5px]">
                          {faq.question}
                        </span>
                        <span
                          aria-hidden
                          className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[3px] border border-border bg-card text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary"
                        >
                          {isOpen ? <Minus className="size-3" /> : <Plus className="size-3" />}
                        </span>
                      </button>
                    </h3>
                    {isOpen ? (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        className="pb-5 pl-[26px] pr-9"
                      >
                        <p className="max-w-[620px] text-[12.5px] leading-[1.75] text-muted-foreground">
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
      </div>
    </section>
  );
}
