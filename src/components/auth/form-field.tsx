import type { ReactNode } from "react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  error,
  description,
  optional,
  children,
  className,
  labelAction,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  description?: ReactNode;
  optional?: boolean;
  children: ReactNode;
  className?: string;
  labelAction?: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={htmlFor} className="flex items-baseline gap-1.5">
          {label}
          {optional ? (
            <span className="font-mono text-[8.5px] font-normal uppercase tracking-[0.12em] text-muted-foreground/70">
              Optional
            </span>
          ) : null}
        </Label>
        {labelAction}
      </div>
      {children}
      {description && !error ? (
        <p className="text-[11px] leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {error ? (
        <p role="alert" className="text-[11px] leading-relaxed text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function LabelLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-[11px] font-medium text-primary underline-offset-4 transition-colors hover:underline"
    >
      {children}
    </Link>
  );
}
