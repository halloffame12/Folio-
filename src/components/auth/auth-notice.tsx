import type { ReactNode } from "react";
import { CheckCircle2, CircleAlert, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  error: {
    icon: CircleAlert,
    className: "border-destructive/25 bg-destructive/[0.06] text-destructive",
    title: "text-destructive",
  },
  success: {
    icon: CheckCircle2,
    className: "border-success/30 bg-success/[0.07] text-success",
    title: "text-success",
  },
  info: {
    icon: Info,
    className: "border-border bg-secondary/45 text-muted-foreground",
    title: "text-foreground",
  },
} as const;

export function AuthNotice({
  tone = "info",
  title,
  children,
  className,
  role = tone === "error" ? "alert" : "status",
}: {
  tone?: keyof typeof tones;
  title?: string;
  children: ReactNode;
  className?: string;
  role?: "alert" | "status";
}) {
  const config = tones[tone];
  const Icon = config.icon;

  return (
    <div
      role={role}
      aria-live={role === "alert" ? "assertive" : "polite"}
      className={cn("flex items-start gap-2.5 rounded border px-3 py-2.5", config.className, className)}
    >
      <Icon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <div className="min-w-0 text-[11.5px] leading-relaxed">
        {title ? <p className={cn("font-medium", config.title)}>{title}</p> : null}
        <div className={cn(title && "mt-0.5", "text-foreground/75")}>{children}</div>
      </div>
    </div>
  );
}
