import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "@/components/marketing/product-previews";
import { Reveal } from "@/components/marketing/reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="editorial-grid pointer-events-none absolute inset-0"
        style={{
          maskImage: "linear-gradient(to bottom, black, transparent 88%)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 88%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-10 size-[540px] rounded-full border border-primary/[0.06]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-24 top-32 hidden size-[220px] rounded-full border border-border/60 lg:block"
      />

      <div className="marketing-container relative grid gap-12 pb-14 pt-12 sm:pt-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-12 lg:pb-24 lg:pt-20 xl:gap-16">
        <div className="min-w-0">
          <Reveal>
            <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="inline-block size-1.5 bg-accent" aria-hidden />
              Academic research workspace
              <span className="text-border">/</span>
              <span className="text-muted-foreground/60">Vol. 01</span>
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="display-xl mt-5 text-balance text-foreground">
              Research deserves a{" "}
              <span className="font-serif font-normal italic tracking-[-0.02em] text-primary">
                better
              </span>{" "}
              workspace.
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="editorial-lede mt-6 max-w-[480px]">
              Discover scholarly papers, organise your literature, manage research projects and
              bring your academic work together in one focused workspace.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-10 px-5">
                <Link href="/signup">
                  Start researching <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-10 px-5">
                <Link href="#showcase">
                  Explore the platform <ArrowDown />
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-8 flex items-start gap-3 border-l-2 border-accent/70 pl-3.5">
              <p className="max-w-[390px] text-[12px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground/85">
                  One workspace for your entire research journey.
                </span>{" "}
                From the first search to the final citation.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.25}>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-4 font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
              {["Discover", "Organise", "Collaborate", "Understand"].map((item, index) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="tabular-nums text-accent/80">0{index + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.12} y={24} className="min-w-0">
          <div className="relative min-w-0 lg:-mr-6 xl:-mr-10">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.16em] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-success" aria-hidden />
                Workspace / Dashboard
              </span>
              <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground/50">
                Demonstration data
              </span>
            </div>

            <DashboardPreview />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-[8px] uppercase leading-relaxed tracking-[0.12em] text-muted-foreground/60">
                16 saved papers · 3 active projects · 11 open tasks
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.12em] text-primary transition-colors hover:text-primary/80"
              >
                Open live demo <ArrowUpRight className="size-2.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
