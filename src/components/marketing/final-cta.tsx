import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";

export function FinalCta() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="border-b border-border bg-inverse text-inverse-foreground"
    >
      <div className="marketing-container py-16 sm:py-20 lg:py-24">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="lg:col-span-8">
              <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-inverse-foreground/80">
                <span className="inline-block size-1.5 bg-accent" aria-hidden />
                10 / Begin
              </p>
              <h2
                id="cta-heading"
                className="mt-5 max-w-[760px] font-display text-[clamp(2.3rem,5vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.045em]"
              >
                Make room for{" "}
                <span className="font-serif font-normal italic tracking-[-0.03em]">better</span>{" "}
                research.
              </h2>
              <p className="mt-5 max-w-[540px] text-[13.5px] leading-[1.75] text-inverse-foreground/85 sm:text-[14px]">
                Bring your papers, notes, literature reviews, and research projects into one
                organised workspace.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end">
              <Button
                asChild
                size="lg"
                className="h-12 w-full rounded-none bg-inverse-foreground px-6 text-[13px] text-inverse hover:bg-inverse-foreground/90 sm:w-auto"
              >
                <Link href="/signup">
                  Create your workspace <ArrowRight />
                </Link>
              </Button>
              <Link
                href="/signin"
                className="self-start border-b border-inverse-foreground/25 pb-0.5 text-[11.5px] text-inverse-foreground/85 transition-colors hover:border-inverse-foreground/60 hover:text-inverse-foreground lg:self-end"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-3 border-t border-inverse-foreground/20 pt-4 font-mono text-[8px] uppercase tracking-[0.14em] text-inverse-foreground/75 sm:grid-cols-3 lg:mt-20">
          <span>Live product · account-backed</span>
          <span className="sm:text-center">Crossref &amp; OpenAlex</span>
          <span className="sm:text-right">Secure session authentication</span>
        </div>
      </div>
    </section>
  );
}
