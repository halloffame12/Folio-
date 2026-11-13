import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-heading" className="border-b border-border">
      <div className="marketing-container py-16 sm:py-20 lg:py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-md border border-primary/25 bg-primary text-primary-foreground">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary-foreground)) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
              }}
            />
            <svg
              aria-hidden
              viewBox="0 0 260 260"
              className="pointer-events-none absolute -right-14 -top-16 size-[300px] text-primary-foreground/20 sm:-right-8 sm:size-[360px]"
            >
              <circle cx="130" cy="130" r="128" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="130" cy="130" r="88" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="130" cy="130" r="46" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <path d="M0 130h260M130 0v260" stroke="currentColor" strokeWidth="0.8" />
            </svg>

            <div className="relative grid gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12 lg:px-12 lg:py-14">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <LogoMark inverse className="size-8" />
                  <span className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-primary-foreground/60 dark:text-primary-foreground/80">
                    Vol. 01 · Academic research workspace
                  </span>
                </div>
                <h2
                  id="cta-heading"
                  className="mt-6 max-w-[620px] font-display text-[30px] font-semibold leading-[1.06] tracking-[-0.04em] sm:text-[38px] lg:text-[44px]"
                >
                  Give the research a{" "}
                  <span className="font-serif font-normal italic text-accent dark:text-[hsl(18_58%_22%)]">better</span> place to
                  live.
                </h2>
                <p className="mt-4 max-w-[520px] text-[13px] leading-[1.75] text-primary-foreground/70 dark:text-primary-foreground/85">
                  Start a workspace for your next paper, or step into the preloaded demonstration to
                  see the full arc first. No account is required to explore.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                <Button
                  asChild
                  size="lg"
                  className="h-10 border-transparent bg-primary-foreground px-5 text-primary hover:bg-primary-foreground/90"
                >
                  <Link href="/signup">
                    Create your workspace <ArrowRight />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-10 border-primary-foreground/30 bg-transparent px-5 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link href="/dashboard">
                    Open the demo <ArrowUpRight />
                  </Link>
                </Button>
                <Link
                  href="/signin"
                  className="mt-1 inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-primary-foreground/55 transition-colors hover:text-primary-foreground/85 dark:text-primary-foreground/80 sm:ml-1 lg:mt-0"
                >
                  Demonstration sign-in available
                </Link>
              </div>
            </div>

            <div className="relative border-t border-primary-foreground/15 px-6 py-3 sm:px-10 lg:px-12">
              <p className="font-mono text-[7.5px] uppercase leading-relaxed tracking-[0.13em] text-primary-foreground/45 dark:text-primary-foreground/75">
                Live product · Real scholarly search · Secure authentication
                security
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
