import { BookmarkCheck, Search } from "lucide-react";
import { collections, papersById } from "@/mocks/data";
import { cn } from "@/lib/utils";

const threadIds = ["p1", "p4", "p2"];

function authorLine(paperId: string) {
  const paper = papersById[paperId];
  if (!paper) return "";
  const first = paper.authors[0]?.name ?? "";
  return paper.authors.length > 1 ? `${first} et al.` : first;
}

export function ResearchThread({ className }: { className?: string }) {
  const papers = threadIds.map((id) => papersById[id]).filter(Boolean);
  const collection = collections[0];

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-card", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-[13px] font-medium text-foreground">Search results</span>
        <span className="text-[12px] text-muted-foreground">Crossref · OpenAlex</span>
      </div>

      <div className="border-b border-border p-3">
        <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-[13px] text-foreground/80">
            research infrastructure
          </span>
          <span className="shrink-0 text-[12px] text-muted-foreground">14</span>
        </div>
      </div>

      <ul className="divide-y divide-border">
        {papers.map((paper, index) => (
          <li key={paper.id} className="flex gap-3 px-4 py-3.5">
            <span
              aria-hidden
              className={cn(
                "mt-1.5 size-1.5 shrink-0 rounded-full",
                index === 0 ? "bg-accent" : "bg-border"
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-serif text-[14.5px] leading-snug text-foreground">
                {paper.title}
              </p>
              <p className="mt-1 truncate text-[12px] text-muted-foreground">
                {authorLine(paper.id)} · {paper.venueShort} · {paper.year}
              </p>
            </div>
            {index === 0 ? (
              <span className="mt-0.5 flex shrink-0 items-center gap-1 text-[12px] text-muted-foreground">
                <BookmarkCheck className="size-3.5" aria-hidden />
                Saved
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-border bg-secondary/50 px-4 py-2.5 text-[12px] text-muted-foreground">
        <span>Saved to {collection?.name ?? "your library"}</span>
        <span>{collection?.paperIds.length ?? 3} papers</span>
      </div>
    </div>
  );
}
