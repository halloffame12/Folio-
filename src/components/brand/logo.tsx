import { cn } from "@/lib/utils";

/**
 * Folio brand mark: a geometric folio leaf with a folded corner, two index
 * rules, and a reference node. Drawn as SVG so it stays crisp in the sidebar,
 * navigation, authentication screens, and favicon.
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
  const panel = inverse ? "hsl(var(--inverse-foreground))" : "hsl(var(--primary))";
  const ink = inverse ? "hsl(var(--inverse))" : "hsl(var(--primary-foreground))";
  return (
    <svg
      viewBox="0 0 32 32"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={cn("size-7 shrink-0", className)}
    >
      {title ? <title>{title}</title> : null}
      <rect width="32" height="32" rx="4" fill={panel} />
      <path
        d="M9 8.5h10.5L24 13v10.5H9V8.5Z"
        fill="none"
        stroke={ink}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 8.5V13H24"
        fill="none"
        stroke={ink}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 17h8M12 20h5"
        stroke={ink}
        strokeWidth="1.6"
        strokeLinecap="square"
      />
      <circle
        cx="23.5"
        cy="23.5"
        r="2.4"
        fill="hsl(var(--accent))"
        stroke={panel}
        strokeWidth="1.6"
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
          "font-display text-[17px] font-semibold tracking-[-0.04em]",
          inverse && "text-inverse-foreground"
        )}
      >
        Folio
      </span>
      {subtitle ? (
        <span
          className={cn(
            "mt-1 truncate font-mono text-[8px] uppercase tracking-[0.18em] text-muted-foreground",
            inverse && "text-inverse-foreground/70"
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
