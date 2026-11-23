"use client";

import Link from "next/link";
import { ArrowUpRight, FlaskConical, Hash, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { relativeTime } from "@/lib/utils";

export interface LatestGapSummary {
  id: string;
  name: string;
  corpusSize: number;
  createdAt: string;
  result?: {
    topic: string;
    corpusSize: number;
    underrepresented?: { keyword: string; count: number }[];
    topKeywords?: { keyword: string; count: number }[];
  };
}

export function ResearchGapWidget({
  latestAnalysis,
}: {
  latestAnalysis?: LatestGapSummary | null;
}) {
  const underrepresented = latestAnalysis?.result?.underrepresented?.slice(0, 4) || [];

  return (
    <section className="overflow-hidden rounded-md border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div>
          <h2 className="section-title text-[13px] flex items-center gap-1.5">
            <FlaskConical className="size-3.5 text-muted-foreground" />
            Research Intelligence & Gap Analysis
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Identify underrepresented subtopics and open enquiry spaces
          </p>
        </div>
        <Button variant="ghost" size="xs" asChild>
          <Link href="/research-gaps">
            Open Analyzer <ArrowUpRight className="size-3 ml-0.5" />
          </Link>
        </Button>
      </div>

      <div className="p-5">
        {latestAnalysis ? (
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Latest Analysis · {relativeTime(latestAnalysis.createdAt)}
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">
                {latestAnalysis.corpusSize} supporting papers
              </Badge>
            </div>

            <h3 className="mt-2 text-[14px] font-medium text-foreground">
              {latestAnalysis.name}
            </h3>

            {underrepresented.length > 0 && (
              <div className="mt-3">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Hash className="size-3" /> Underrepresented keywords:
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {underrepresented.map((item) => (
                    <Badge
                      key={item.keyword}
                      variant="secondary"
                      className="text-[10.5px] font-mono px-2 py-0.5"
                    >
                      {item.keyword}{" "}
                      <span className="ml-1 text-muted-foreground/70">({item.count})</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Run analysis on another topic in your library
              </span>
              <Button size="xs" variant="outline" asChild>
                <Link href="/research-gaps">New Analysis →</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Folio analyzes keyword frequencies, co-citations, and author distributions across your library
              to spotlight under-explored research directions and niche methodology intersections.
            </p>
            <div className="flex items-center gap-3">
              <Button size="sm" className="h-8 text-[12px]" asChild>
                <Link href="/research-gaps">
                  <Sparkles className="size-3.5 mr-1" /> Run First Gap Analysis
                </Link>
              </Button>
              <span className="text-[11px] text-muted-foreground font-mono">
                Requires saved papers in library
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
