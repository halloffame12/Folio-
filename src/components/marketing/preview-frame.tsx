import type { ReactNode } from "react";
import { Bell, Search } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

/**
 * A believable application window used by every marketing preview. It is
 * deliberately not a browser mockup: this is the product's own chrome.
 */
export function PreviewFrame({
  path,
  description,
  children,
  className,
}: {
  path: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("m-0 min-w-0", className)}>
      <div aria-hidden className="overflow-hidden rounded-md border border-border bg-card shadow-float">
        <div className="flex h-8 items-center gap-2 border-b border-border bg-surface/70 px-2.5 sm:px-3">
          <span className="flex items-center gap-1.5">
            <LogoMark className="size-4" />
            <span className="hidden font-mono text-[7.5px] uppercase tracking-[0.14em] text-muted-foreground sm:inline">
              Folio
            </span>
          </span>
          <span className="h-3 w-px bg-border" aria-hidden />
          <span className="truncate font-mono text-[7.5px] text-muted-foreground">
            folio.app{path}
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5">
            <span className="hidden h-[18px] w-24 items-center gap-1 rounded border border-border bg-card px-1.5 py-0.5 text-[6.5px] text-muted-foreground sm:flex">
              <Search className="size-2" /> Search the workspace
            </span>
            <span className="flex size-[18px] items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
              <Bell className="size-2" />
            </span>
            <span className="flex size-[18px] items-center justify-center rounded-full bg-primary/15 font-mono text-[5.5px] font-semibold text-primary">
              MS
            </span>
          </span>
        </div>
        {children}
      </div>
      {description ? <figcaption className="sr-only">{description}</figcaption> : null}
    </figure>
  );
}

export function PreviewLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[6.5px] uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </p>
  );
}

export function MiniTag({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "forest" | "terracotta" | "success" | "warning";
}) {
  const tones = {
    neutral: "border-border bg-card text-muted-foreground",
    forest: "border-primary/20 bg-primary/[0.07] text-primary",
    terracotta: "border-accent/25 bg-accent/[0.08] text-accent",
    success: "border-success/25 bg-success/[0.08] text-success",
    warning: "border-warning/30 bg-warning/[0.08] text-warning",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[2px] border px-1 py-px font-mono text-[5.5px] uppercase leading-[1.5] tracking-[0.06em]",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

export function MiniAvatar({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-[18px] items-center justify-center rounded-full border border-background bg-secondary font-mono text-[5.5px] font-medium text-secondary-foreground",
        className
      )}
    >
      {initials}
    </span>
  );
}

export function MiniBar({
  value,
  className,
  tone = "bg-primary",
}: {
  value: number;
  className?: string;
  tone?: string;
}) {
  return (
    <span className={cn("block h-1 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <span className={cn("block h-full rounded-full", tone)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </span>
  );
}
