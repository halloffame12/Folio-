import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MarketingPage({
  label,
  title,
  lede,
  meta,
  children,
  aside,
}: {
  index?: string;
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  meta?: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <>
      <header className="border-b border-border">
        <div className="marketing-container py-12 sm:py-16">
          <p className="text-[13px] text-muted-foreground">{label}</p>
          <h1 className="display-lg mt-2 max-w-[720px] text-balance text-foreground">
            {title}
          </h1>
          {lede ? <p className="editorial-lede mt-4 max-w-[600px]">{lede}</p> : null}
          {meta ? (
            <p className="mt-4 text-[13px] text-muted-foreground">{meta}</p>
          ) : null}
        </div>
      </header>

      <div
        className={cn(
          "marketing-container grid grid-cols-1 gap-10 py-12 sm:py-16",
          aside && "lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16"
        )}
      >
        <div className="min-w-0 max-w-[720px] space-y-10">{children}</div>
        {aside ? <aside className="lg:sticky lg:top-24 lg:self-start">{aside}</aside> : null}
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
    <section
      id={id}
      className={cn(
        "scroll-mt-24 border-t border-border pt-6 first:border-t-0 first:pt-0",
        className
      )}
    >
      <h2 className="font-display text-[18px] font-semibold tracking-[-0.01em]">{title}</h2>
      <div className="article-prose mt-3">{children}</div>
    </section>
  );
}
