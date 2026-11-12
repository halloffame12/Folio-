"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DashboardPreview,
  GapPreview,
  LibraryPreview,
  LiteraturePreview,
} from "@/components/marketing/product-previews";
import { Reveal } from "@/components/marketing/reveal";
import { SectionIntro } from "@/components/marketing/section-intro";
import { cn } from "@/lib/utils";

const views = [
  {
    value: "dashboard",
    index: "01",
    label: "Dashboard",
    summary: "The day's research in one view.",
    body: "Saved papers, active projects, upcoming work, and reading progress meet on a single surface. The dashboard answers “what needs attention?” before it becomes a meeting.",
    href: "/dashboard",
    Preview: DashboardPreview,
  },
  {
    value: "library",
    index: "02",
    label: "Library",
    summary: "Sources with their reading context.",
    body: "Every saved paper keeps its status, progress, tags, and collections. The library is a record of what has been read and what the reading was for.",
    href: "/library",
    Preview: LibraryPreview,
  },
  {
    value: "literature",
    index: "03",
    label: "Literature review",
    summary: "An argument built on linked evidence.",
    body: "The review workspace holds the outline, the method, the findings, and the papers each section depends on. Drafting and evidence stay in the same room.",
    href: "/literature",
    Preview: LiteraturePreview,
  },
  {
    value: "gaps",
    index: "04",
    label: "Gap explorer",
    summary: "Potential opportunities, stated carefully.",
    body: "Topic density and recent momentum suggest where attention is thin. Folio labels these as potential opportunities — never as verified gaps — and shows the evidence behind each.",
    href: "/research-gaps",
    Preview: GapPreview,
  },
];

export function Showcase() {
  return (
    <section id="showcase" aria-labelledby="showcase-heading" className="border-b border-border">
      <div className="marketing-container py-16 sm:py-20 lg:py-24">
        <Reveal>
          <SectionIntro
            index="06"
            label="Product tour"
            title={
              <span id="showcase-heading">
                Walk through the{" "}
                <span className="font-serif font-normal italic text-primary">workspace</span>.
              </span>
            }
            lede="Four views, one project. Each screen uses the demonstration data that ships with the product, so what you see here is what the workspace actually contains."
          />
        </Reveal>

        <Tabs defaultValue="dashboard" className="mt-10 grid gap-6 lg:grid-cols-[268px_minmax(0,1fr)] lg:gap-10">
          <Reveal className="min-w-0">
            <TabsList
              aria-label="Product views"
              className="grid h-auto w-full grid-cols-2 items-stretch justify-start gap-1 rounded-md border border-border bg-surface/50 p-1 lg:flex lg:flex-col lg:border-0 lg:bg-transparent lg:p-0"
            >
              {views.map((view) => (
                <TabsTrigger
                  key={view.value}
                  value={view.value}
                  className={cn(
                    "group h-auto w-full flex-col items-start justify-start gap-1 rounded-[3px] px-3 py-2.5 text-left",
                    "data-[state=active]:bg-card data-[state=active]:shadow-xs",
                    "lg:rounded-none lg:border-l-2 lg:border-transparent lg:px-3.5 lg:py-3",
                    "lg:data-[state=active]:border-accent lg:data-[state=active]:bg-transparent lg:data-[state=active]:shadow-none"
                  )}
                >
                  <span className="flex items-baseline gap-2">
                    <span className="font-mono text-[8px] tabular-nums tracking-[0.14em] text-accent">
                      {view.index}
                    </span>
                    <span className="font-display text-[12.5px] font-semibold tracking-[-0.01em]">
                      {view.label}
                    </span>
                  </span>
                  <span className="hidden text-[10.5px] leading-snug text-muted-foreground lg:block lg:text-left">
                    {view.summary}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Reveal>

          <Reveal delay={0.08} className="min-w-0">
            {views.map((view) => {
              const Preview = view.Preview;
              return (
                <TabsContent key={view.value} value={view.value} className="mt-0 min-w-0">
                  <div className="min-w-0">
                    <Preview />
                  </div>
                  <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-[560px]">
                      <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-muted-foreground">
                        {view.label}
                      </p>
                      <p className="mt-1.5 text-[12px] leading-[1.7] text-muted-foreground">
                        {view.body}
                      </p>
                    </div>
                    <Link
                      href={view.href}
                      className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-primary transition-colors hover:text-primary/75"
                    >
                      Open view <ArrowUpRight className="size-3" aria-hidden />
                    </Link>
                  </div>
                </TabsContent>
              );
            })}
          </Reveal>
        </Tabs>
      </div>
    </section>
  );
}
