import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  compact = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-card/40 text-center",
        compact ? "px-6 py-10" : "px-6 py-16",
        className
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-[3px] border border-border bg-card">
        <Icon className="size-4 text-muted-foreground" />
      </span>
      <h3 className="mt-4 font-display text-[15px] font-semibold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export function LoadingState({
  rows = 5,
  className,
  label = "Loading",
}: {
  rows?: number;
  className?: string;
  label?: string;
}) {
  return (
    <div role="status" aria-label={label} className={cn("space-y-3", className)}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="shimmer h-12 rounded border border-border bg-card" />
      ))}
    </div>
  );
}

export function InlineLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <Loader2 className="size-3 animate-spin" />
      {label}
    </span>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "The data could not be loaded. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-destructive/20 bg-destructive/[0.04] px-6 py-14 text-center">
      <span className="flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        !
      </span>
      <h3 className="mt-3 font-display text-[15px] font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RotateCcw /> Try again
        </Button>
      )}
    </div>
  );
}
