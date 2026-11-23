"use client";

import Link from "next/link";
import { BookMarked, ChevronRight, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { relativeTime } from "@/lib/utils";
import type { LiteratureReview, ReviewSection } from "@/types";

function calculateReviewStats(review: LiteratureReview) {
  function flatten(sections: ReviewSection[]): ReviewSection[] {
    return (sections || []).flatMap((s) => [s, ...flatten(s.subsections || [])]);
  }
  const allSections = flatten(review.sections);
  const totalSections = allSections.length;
  const completedSections = allSections.filter((s) => {
    const text = s.content ? s.content.replace(/<[^>]*>/g, "").trim() : "";
    return text.length > 30;
  }).length;
  const wordCount = allSections.reduce((acc, s) => {
    const text = s.content ? s.content.replace(/<[^>]*>/g, " ").trim() : "";
    return acc + (text ? text.split(/\s+/).length : 0);
  }, 0);
  const completionPercent = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
  return { totalSections, completedSections, wordCount, completionPercent };
}

export function LiteratureReviewsWidget() {
  const reviews = useWorkspaceStore((s) => s.data.literatureReviews);

  return (
    <section className="overflow-hidden rounded-md border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div>
          <h2 className="section-title text-[13px] flex items-center gap-1.5">
            <BookMarked className="size-3.5 text-muted-foreground" />
            Literature Reviews
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Structured syntheses and narrative outlines
          </p>
        </div>
        <Button variant="ghost" size="xs" asChild>
          <Link href="/literature">
            All reviews <ChevronRight className="size-3" />
          </Link>
        </Button>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <span className="flex size-9 items-center justify-center rounded-[3px] border border-border bg-card text-muted-foreground">
            <FileText className="size-4" />
          </span>
          <h3 className="mt-3 text-[13px] font-medium text-foreground">No literature reviews yet</h3>
          <p className="mt-1 max-w-xs text-[11.5px] leading-relaxed text-muted-foreground">
            Synthesize themes, methodologies, and findings across multiple papers.
          </p>
          <Button size="sm" className="mt-3.5 h-8 text-[12px]" asChild>
            <Link href="/literature">
              <Plus className="size-3.5 mr-1" /> Create Literature Review
            </Link>
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border/70">
          {reviews.slice(0, 3).map((review) => {
            const stats = calculateReviewStats(review);
            return (
              <Link
                key={review.id}
                href={`/literature?review=${review.id}`}
                className="group block px-5 py-3.5 transition-colors hover:bg-secondary/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-[13px] font-medium text-foreground transition-colors group-hover:text-primary">
                        {review.title}
                      </h3>
                      <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
                        {stats.completionPercent}% complete
                      </Badge>
                    </div>
                    {review.researchQuestion && (
                      <p className="mt-1 truncate text-[11px] italic text-muted-foreground">
                        “{review.researchQuestion}”
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-muted-foreground font-mono">
                      <span>{stats.completedSections} of {stats.totalSections} sections</span>
                      <span className="text-border">·</span>
                      <span>{stats.wordCount.toLocaleString()} words</span>
                      <span className="text-border">·</span>
                      <span>Updated {relativeTime(review.updatedAt)}</span>
                    </div>
                  </div>
                </div>
                <Progress value={stats.completionPercent} className="mt-2.5 h-1" />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
