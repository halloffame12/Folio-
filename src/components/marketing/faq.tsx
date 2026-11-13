"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Minus, Plus } from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const faqs = [
  {
    question: "Is Folio a real, launched product?",
    answer:
      "Folio is a capstone project with a real backend. It includes secure authentication, a PostgreSQL database, real scholarly search via Crossref and OpenAlex, and live email delivery. User data is stored in a real database and is not shared between accounts.",
  },
  {
    question: "Do I need an account to use Folio?",
    answer:
      "Yes. Create an account to access your personal research workspace. Your library, notes, projects, and settings are tied to your account and stored securely.",
  },
  {
    question: "Does Folio send real email?",
    answer:
      "Yes. Registration sends a verification email, and password reset sends a reset link. Email delivery uses a real provider (Resend).",
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
      "Your data is stored in a PostgreSQL database hosted on Neon. Each user's data is isolated and accessible only through authenticated sessions.",
  },
  {
    question: "Can I use Folio with a research team?",
    answer:
      "Yes. Create a project and invite members by email. Members can be assigned roles (Owner, Admin, Member) with appropriate permissions. Tasks and milestones can be assigned to team members.",
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
