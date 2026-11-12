"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPasswordChecks, getPasswordStrength } from "@/lib/validations/auth";

const barTone: Record<number, string> = {
  1: "bg-destructive",
  2: "bg-warning",
  3: "bg-primary",
  4: "bg-success",
};

const labelTone: Record<number, string> = {
  1: "text-destructive",
  2: "text-warning",
  3: "text-primary",
  4: "text-success",
};

export function PasswordStrength({
  password,
  showRequirements = true,
}: {
  password: string;
  showRequirements?: boolean;
}) {
  const strength = getPasswordStrength(password);
  const checks = getPasswordChecks(password);

  return (
    <div className="space-y-2.5" aria-live="polite">
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground">
            Password strength
          </span>
          <span
            className={cn(
              "font-mono text-[8.5px] uppercase tracking-[0.14em]",
              strength.score > 0 ? labelTone[strength.score] : "text-muted-foreground/60"
            )}
          >
            {strength.label}
          </span>
        </div>
        <div className="mt-1.5 grid grid-cols-4 gap-1" role="presentation">
          {[1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className={cn(
                "h-1 rounded-full transition-colors duration-300",
                strength.score >= step ? barTone[strength.score] : "bg-secondary"
              )}
            />
          ))}
        </div>
      </div>

      {showRequirements ? (
        <ul className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
          {checks.map((check) => (
            <li
              key={check.id}
              className={cn(
                "flex items-center gap-1.5 text-[10.5px] leading-tight transition-colors",
                check.met ? "text-foreground/75" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-3.5 shrink-0 items-center justify-center rounded-full border",
                  check.met
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-border bg-card text-transparent"
                )}
                aria-hidden
              >
                <Check className="size-2" strokeWidth={3} />
              </span>
              <span>
                {check.label}
                <span className="sr-only">{check.met ? ", met" : ", not yet met"}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
