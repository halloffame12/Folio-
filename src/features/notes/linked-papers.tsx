"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { papers } from "@/lib/client-registry";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { cn } from "@/lib/utils";

export function LinkedPapers({
  noteId,
  paperIds,
  compact = false,
}: {
  noteId: string;
  paperIds: string[];
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const updateNote = useWorkspaceStore((s) => s.updateNote);

  const selected = paperIds
    .map((id) => papers.find((paper) => paper.id === id))
    .filter(Boolean);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return papers.filter((paper) =>
      q
        ? `${paper.title} ${paper.authors.map((a) => a.name).join(" ")} ${paper.year}`
            .toLowerCase()
            .includes(q)
        : true
    );
  }, [query]);

  const toggle = (paperId: string) => {
    const next = paperIds.includes(paperId)
      ? paperIds.filter((id) => id !== paperId)
      : [...paperIds, paperId];
    updateNote(noteId, { paperIds: next });
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", compact && "gap-1")}>
      {selected.map((paper) =>
        paper ? (
          <span
            key={paper.id}
            className="inline-flex max-w-[240px] items-center gap-1 rounded border border-border bg-card py-0.5 pl-1.5 pr-1 text-[9.5px] text-foreground/75"
          >
            <BookOpen className="size-2.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{paper.venueShort || paper.title}</span>
            <button
              type="button"
              onClick={() => toggle(paper.id)}
              aria-label={`Unlink ${paper.title}`}
              className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              ×
            </button>
          </span>
        ) : null
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="xs" className="text-muted-foreground">
            <BookOpen /> {selected.length > 0 ? "Link papers" : "Link a paper"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[360px] p-2">
          <p className="px-1 pb-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
            Link papers · {selected.length} linked
          </p>
          <div className="relative mb-1.5">
            <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the index…"
              className="h-7 pl-7 text-[11px]"
              aria-label="Search papers to link"
            />
          </div>
          <div className="max-h-64 space-y-0.5 overflow-y-auto">
            {results.map((paper) => {
              const checked = paperIds.includes(paper.id);
              return (
                <button
                  key={paper.id}
                  type="button"
                  onClick={() => toggle(paper.id)}
                  className="flex w-full items-start gap-2 rounded px-1.5 py-1.5 text-left transition-colors hover:bg-secondary"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border",
                      checked ? "border-primary bg-primary text-primary-foreground" : "border-input"
                    )}
                    aria-hidden
                  >
                    {checked && <Check className="size-2.5" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] font-medium">{paper.title}</span>
                    <span className="block text-[9.5px] text-muted-foreground">
                      {paper.authors[0]?.name} · {paper.year} · {paper.venueShort}
                    </span>
                  </span>
                </button>
              );
            })}
            {results.length === 0 && (
              <p className="px-2 py-4 text-center text-[10.5px] text-muted-foreground">
                No papers match that search.
              </p>
            )}
          </div>
          <div className="mt-1 border-t border-border pt-1.5">
            <Button variant="ghost" size="xs" className="w-full" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
