"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Minus, Plus } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const faqs = [
  {
    question: "Is Folio a real, launched product?",
    answer:
      "Folio is a working academic workspace built as a capstone project. It has secure authentication, a PostgreSQL database, live scholarly search through Crossref and OpenAlex, and real email delivery. Accounts and records are stored in a real database and are isolated per user.",
  },
  {
    question: "Do I need an account to use Folio?",
    answer:
      "Yes. Create an account to access your personal research workspace. Your library, notes, projects, literature reviews, and settings are tied to your account and stored securely.",
  },
  {
    question: "Does Folio send real email?",
    answer:
      "Yes. Registration sends a verification email, and password reset sends a reset link. Email delivery uses Resend.",
  },
  {
    question: "Does Folio use AI to write reviews or discover gaps?",
    answer:
      "No. There is no AI writing or automated literature synthesis. The Research Gap Explorer analyses the corpus you have collected and reports topic distribution, source coverage, and supporting papers. Every result is labelled a potential opportunity, not a verified gap, because low output can reflect method, funding, ethics, or deliberate exclusion.",
  },
  {
    question: "Which citation styles are supported?",
    answer:
      "The citation generator formats a record in APA 7, MLA 9, IEEE, and Chicago 17th edition. Formatting runs from the paper's stored metadata, so the output is deterministic.",
  },
  {
    question: "Where is my data stored?",
    answer:
      "Your data is stored in a PostgreSQL database hosted on Neon. Each user's data is isolated and accessible only through an authenticated session.",
  },
  {
    question: "Can I use Folio with a research team?",
    answer:
      "Yes. Create a project and invite members by email. Members can be assigned Owner, Admin, or Member roles, and tasks and milestones can be assigned to team members.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="faq" aria-labelledby="faq-heading" className="border-b border-border bg-surface/45">
      <div className="marketing-container py-16 sm:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
            <p className="flex items-baseline gap-2.5">
              <span className="font-mono text-[10px] tabular-nums tracking-[0.18em] text-accent">
                09
              </span>
              <span className="marketing-eyebrow">Questions</span>
            </p>
            <h2 id="faq-heading" className="section-display mt-4 max-w-[420px]">
              Asked plainly,{" "}
              <span className="font-serif font-normal italic text-primary">answered</span> honestly.
            </h2>
            <p className="mt-4 max-w-[380px] text-[13px] leading-[1.75] text-muted-foreground">
              If something is still unclear, the documentation and help pages go further.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/help"
                className="inline-flex items-center gap-1.5 border-b border-foreground/20 py-1 text-[11.5px] font-medium text-foreground/75 transition-colors hover:border-foreground hover:text-foreground"
              >
                Help center <ArrowUpRight className="size-3" aria-hidden />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-1.5 border-b border-foreground/20 py-1 text-[11.5px] font-medium text-foreground/75 transition-colors hover:border-foreground hover:text-foreground"
              >
                Documentation <ArrowUpRight className="size-3" aria-hidden />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.05} className="lg:col-span-8">
            <div className="border-t-2 border-foreground/80">
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
                        <span className="mt-0.5 font-mono text-[9px] tabular-nums tracking-[0.14em] text-muted-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 font-display text-[14.5px] font-semibold leading-snug tracking-[-0.015em] text-foreground sm:text-[15.5px]">
                          {faq.question}
                        </span>
                        <span
                          aria-hidden
                          className="mt-0.5 flex size-5 shrink-0 items-center justify-center border border-border bg-card text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary"
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
