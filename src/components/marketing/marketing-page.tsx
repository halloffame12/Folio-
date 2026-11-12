import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function MarketingPage({
  index,
  label,
  title,
  lede,
  meta,
  children,
  aside,
}: {
  index: string;
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  meta?: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <>
      <header className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="editorial-grid pointer-events-none absolute inset-0"
          style={{
            maskImage: "linear-gradient(to bottom, black, transparent 92%)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent 92%)",
          }}
        />
        <div className="marketing-container relative py-12 sm:py-16 lg:py-20">
          <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-10">
            <div className="flex items-start gap-2.5 lg:flex-col lg:gap-2">
              <span className="font-mono text-[9px] tabular-nums tracking-[0.18em] text-accent">
                {index}
              </span>
              <span className="eyebrow">{label}</span>
            </div>
            <div>
              <h1 className="display-lg max-w-[760px] text-balance">{title}</h1>
              {lede ? <p className="editorial-lede mt-4 max-w-[620px]">{lede}</p> : null}
              {meta ? (
                <p className="mt-5 font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground/60">
                  {meta}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="marketing-container grid gap-10 py-12 sm:py-16 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {aside ?? (
            <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.13em] text-foreground/75 transition-colors hover:border-primary/30 hover:text-primary"
              >
                Open demo <ArrowUpRight className="size-2.5" aria-hidden />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.13em] text-foreground/75 transition-colors hover:border-primary/30 hover:text-primary"
              >
                Create account <ArrowUpRight className="size-2.5" aria-hidden />
              </Link>
            </div>
          )}
        </aside>
        <div className="min-w-0 max-w-[760px] space-y-10">{children}</div>
      </div>
    </>
  );
}

export function ProseSection({
  id,
  title,
  children,
  className,
}: {
  id?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 border-t border-border pt-6 first:border-t-0 first:pt-0", className)}>
      <h2 className="font-display text-[18px] font-semibold tracking-[-0.02em]">{title}</h2>
      <div className="article-prose mt-3">{children}</div>
    </section>
  );
}
