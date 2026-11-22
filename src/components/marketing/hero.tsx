import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResearchThread } from "@/components/marketing/research-thread";
import { Reveal } from "@/components/marketing/reveal";

export function Hero() {
  return (
    <section className="border-b border-border">
      <div className="marketing-container grid grid-cols-1 items-center gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-16 lg:py-24">
        <Reveal>
          <h1 className="hero-title text-foreground">
            Your research deserves a better workspace.
          </h1>

          <p className="mt-6 max-w-[470px] text-[16.5px] leading-[1.65] text-muted-foreground">
            Search scholarly literature, keep the papers you save, and write with
            your sources beside you. Folio keeps the whole project in one place.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-11 px-5">
              <Link href="/signup">
                Get started <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-5">
              <Link href="/#features">Explore features</Link>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
            <li>Live Crossref and OpenAlex search</li>
            <li aria-hidden className="hidden text-border sm:block">
              /
            </li>
            <li>Your own private library</li>
            <li aria-hidden className="hidden text-border sm:block">
              /
            </li>
            <li>Free to start</li>
          </ul>
        </Reveal>

        <Reveal delay={0.06} y={20}>
          <ResearchThread />
        </Reveal>
      </div>
    </section>
  );
}
