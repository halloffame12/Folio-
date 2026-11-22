import { cn } from "@/lib/utils";

/**
 * Folio brand mark: a thin folio frame, a cut "F", and a single square mark.
 * Drawn in SVG so it stays sharp in navigation, authentication, and the
 * workspace sidebar.
 */
export function LogoMark({
  className,
  title,
  inverse = false,
}: {
  className?: string;
  title?: string;
  inverse?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={cn("size-7 shrink-0", className)}
    >
      {title ? <title>{title}</title> : null}
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.32"
        strokeWidth="1"
      />
      <path
        d="M9.5 8.25h13.25v3.5h-9.2v4.15h7.35v3.5h-7.35v6.35H9.5V8.25Z"
        fill="currentColor"
      />
      <rect
        x="21.25"
        y="19.25"
        width="4.5"
        height="4.5"
        fill={inverse ? "hsl(var(--accent))" : "hsl(var(--primary))"}
      />
    </svg>
  );
}

export function Wordmark({
  className,
  subtitle = "Research workspace",
  inverse = false,
}: {
  className?: string;
  subtitle?: string | null;
  inverse?: boolean;
}) {
  return (
    <span className={cn("flex min-w-0 flex-col leading-none", className)}>
      <span
        className={cn(
          "font-serif text-[21px] font-medium leading-none tracking-[-0.025em]",
          inverse && "text-inverse-foreground"
        )}
      >
        Folio
      </span>
      {subtitle ? (
        <span
          className={cn(
            "mt-1.5 truncate font-mono text-[8px] uppercase tracking-[0.22em] text-muted-foreground",
            inverse && "text-inverse-foreground/60"
          )}
        >
          {subtitle}
        </span>
      ) : null}
    </span>
  );
}

export function Logo({
  className,
  showWordmark = true,
  subtitle,
  inverse = false,
}: {
  className?: string;
  showWordmark?: boolean;
  subtitle?: string | null;
  inverse?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark inverse={inverse} />
      {showWordmark ? <Wordmark subtitle={subtitle} inverse={inverse} /> : null}
    </span>
  );
}
