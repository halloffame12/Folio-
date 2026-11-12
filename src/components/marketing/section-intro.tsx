import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionIntro({
  index,
  label,
  title,
  lede,
  className,
  headingLevel = "h2",
  aside,
}: {
  index: string;
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  className?: string;
  headingLevel?: "h1" | "h2";
  aside?: ReactNode;
}) {
  const Heading = headingLevel;
  return (
    <div className={cn("grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-10", className)}>
      <div className="flex items-start gap-2.5 lg:flex-col lg:gap-2">
        <span className="font-mono text-[9px] tabular-nums tracking-[0.18em] text-accent">
          {index}
        </span>
        <span className="eyebrow">{label}</span>
      </div>
      <div className="max-w-[720px]">
        <Heading className={headingLevel === "h1" ? "display-xl" : "display-lg"}>{title}</Heading>
        {lede ? <div className="editorial-lede mt-4 max-w-[620px]">{lede}</div> : null}
        {aside}
      </div>
    </div>
  );
}
