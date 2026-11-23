"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function ReadingPipeline() {
  const library = useWorkspaceStore((s) => s.data.library);

  const total = library.length;
  const unread = library.filter((e) => e.status === "unread").length;
  const reading = library.filter((e) => e.status === "reading").length;
  const completed = library.filter((e) => e.status === "completed").length;

  const unreadPct = total > 0 ? (unread / total) * 100 : 0;
  const readingPct = total > 0 ? (reading / total) * 100 : 0;
  const completedPct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="rounded-md border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="section-title text-[13px] flex items-center gap-1.5">
            <BookOpen className="size-3.5 text-muted-foreground" />
            Reading Pipeline
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Distribution of saved literature across reading stages
          </p>
        </div>
        <Link
          href="/library"
          className="font-mono text-[10px] uppercase tracking-wider text-primary hover:underline"
        >
          View Library ({total}) →
        </Link>
      </div>

      {/* Multi-segment visual bar */}
      <div
        role="progressbar"
        aria-label="Reading pipeline progress"
        aria-valuenow={Math.round(completedPct)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-3.5 flex h-2 w-full overflow-hidden rounded-full bg-secondary/60"
      >
        {completed > 0 && (
          <div
            style={{ width: `${completedPct}%` }}
            title={`Completed: ${completed} (${Math.round(completedPct)}%)`}
            className="bg-success transition-all duration-300"
          />
        )}
        {reading > 0 && (
          <div
            style={{ width: `${readingPct}%` }}
            title={`Reading: ${reading} (${Math.round(readingPct)}%)`}
            className="bg-warning transition-all duration-300"
          />
        )}
        {unread > 0 && (
          <div
            style={{ width: `${unreadPct}%` }}
            title={`Unread: ${unread} (${Math.round(unreadPct)}%)`}
            className="bg-muted-foreground/35 transition-all duration-300"
          />
        )}
      </div>

      {/* Stats breakdown */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Link
          href="/library?status=unread"
          className="group rounded border border-border/70 bg-card p-2.5 transition-colors hover:border-border hover:bg-secondary/30"
        >
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="size-2 rounded-full bg-muted-foreground/40" />
            <span>Unread</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-[18px] font-semibold tabular-nums text-foreground">
              {unread}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              ({total > 0 ? Math.round(unreadPct) : 0}%)
            </span>
          </div>
        </Link>

        <Link
          href="/library?status=reading"
          className="group rounded border border-border/70 bg-card p-2.5 transition-colors hover:border-border hover:bg-secondary/30"
        >
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="size-2 rounded-full bg-warning" />
            <span>Currently reading</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-[18px] font-semibold tabular-nums text-foreground">
              {reading}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              ({total > 0 ? Math.round(readingPct) : 0}%)
            </span>
          </div>
        </Link>

        <Link
          href="/library?status=completed"
          className="group rounded border border-border/70 bg-card p-2.5 transition-colors hover:border-border hover:bg-secondary/30"
        >
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="size-2 rounded-full bg-success" />
            <span>Completed</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-[18px] font-semibold tabular-nums text-foreground">
              {completed}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              ({total > 0 ? Math.round(completedPct) : 0}%)
            </span>
          </div>
        </Link>

        <Link
          href="/library"
          className="group rounded border border-border/70 bg-card p-2.5 transition-colors hover:border-border hover:bg-secondary/30"
        >
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="size-2 rounded-full bg-primary" />
            <span>Total library</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-[18px] font-semibold tabular-nums text-foreground">
              {total}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">papers</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
