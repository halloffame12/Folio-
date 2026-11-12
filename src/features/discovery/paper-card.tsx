"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookmarkCheck,
  BookmarkPlus,
  FileText,
} from "lucide-react";
import type { Paper } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { publicationTypeLabels } from "@/lib/labels";
import { stripHtml } from "@/lib/utils";

export function PaperCard({
  paper,
  index,
  saved = false,
  onSave,
  className,
}: {
  paper: Paper;
  index?: number;
  saved?: boolean;
  onSave?: (paperId: string) => Promise<void> | void;
  className?: string;
}) {
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = async () => {
    if (!onSave || saved || saving) return;
    setSaving(true);
    try {
      await onSave(paper.id);
      setJustSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const isSaved = saved || justSaved;

  return (
    <article
      className={cn(
        "group relative grid gap-4 border-b border-border px-1 py-5 transition-colors last:border-0 sm:grid-cols-[minmax(0,1fr)_148px] sm:gap-6 sm:px-2",
        className
      )}
    >
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">
          {typeof index === "number" && (
            <span className="tabular-nums text-muted-foreground/50">
              {String(index).padStart(2, "0")}
            </span>
          )}
          <span className="text-foreground/70">{publicationTypeLabels[paper.publicationType]}</span>
          <span className="text-border">/</span>
          <span>{paper.year}</span>
          <span className="text-border">/</span>
          <span className="normal-case tracking-normal">{paper.venueShort}</span>
          {paper.openAccess && (
            <>
              <span className="text-border">/</span>
              <span className="text-success">Open access</span>
            </>
          )}
        </div>

        <h3 className="font-serif text-[17px] font-medium leading-snug tracking-[-0.01em] text-foreground sm:text-[18px]">
          <Link
            href={`/discover/${paper.id}`}
            className="decoration-primary/30 underline-offset-[3px] transition-colors hover:text-primary hover:underline"
          >
            {paper.title}
          </Link>
        </h3>

        <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
          {paper.authors.map((author, i) => (
            <span key={author.id}>
              <span className="text-foreground/75">{author.name}</span>
              {i < paper.authors.length - 1 && <span className="text-border"> · </span>}
            </span>
          ))}
        </p>

        <p className="mt-2.5 line-clamp-3 max-w-3xl text-[12px] leading-[1.7] text-muted-foreground">
          {stripHtml(paper.abstract)}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-mono text-[9.5px] text-muted-foreground/80">
            DOI {paper.doi}
          </span>
          {paper.keywords.slice(0, 3).map((keyword) => (
            <Badge key={keyword} variant="outline" className="normal-case tracking-normal">
              {keyword}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-row items-center gap-2 sm:flex-col sm:items-stretch sm:justify-start sm:gap-2">
        <div className="mb-1 hidden border-b border-border pb-3 sm:flex sm:items-baseline sm:justify-between">
          <span className="meta-label">Citations</span>
          <span className="font-mono text-[14px] tabular-nums text-foreground/80">
            {paper.citationCount.toLocaleString()}
          </span>
        </div>
        <Button
          variant={isSaved ? "subtle" : "outline"}
          size="sm"
          onClick={handleSave}
          disabled={isSaved || saving}
          className="flex-1 justify-center sm:flex-none"
        >
          {isSaved ? (
            <>
              <BookmarkCheck /> {saving ? "Saving…" : "Saved"}
            </>
          ) : (
            <>
              <BookmarkPlus /> {saving ? "Saving…" : "Save"}
            </>
          )}
        </Button>
        <Button variant="ghost" size="sm" asChild className="flex-1 justify-center sm:flex-none">
          <Link href={`/discover/${paper.id}`}>
            Details <ArrowUpRight />
          </Link>
        </Button>
        <div className="hidden pt-2 sm:block">
          <span className="flex items-center justify-between font-mono text-[9px] text-muted-foreground">
            <span>PDF</span>
            {paper.pdfAvailable ? (
              <span className="flex items-center gap-1 text-success">
                <FileText className="size-2.5" /> Available
              </span>
            ) : (
              <span className="text-muted-foreground/60">Not available</span>
            )}
          </span>
        </div>
      </div>
    </article>
  );
}
