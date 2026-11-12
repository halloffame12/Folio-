import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  pageCount,
  onPageChange,
  total,
  pageSize,
  className,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  total?: number;
  pageSize?: number;
  className?: string;
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter((p) => {
    if (pageCount <= 7) return true;
    return p === 1 || p === pageCount || Math.abs(p - page) <= 1;
  });

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row",
        className
      )}
    >
      {typeof total === "number" && pageSize ? (
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
        </p>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-3.5" />
        </Button>
        {pages.map((p, index) => {
          const previous = pages[index - 1];
          const gap = previous && p - previous > 1;
          return (
            <span key={p} className="flex items-center gap-1">
              {gap && <span className="px-1 text-[10px] text-muted-foreground">…</span>}
              <button
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                className={cn(
                  "flex size-8 items-center justify-center rounded border font-mono text-[10.5px] transition-colors",
                  p === page
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                )}
              >
                {p}
              </button>
            </span>
          );
        })}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
        >
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </nav>
  );
}
