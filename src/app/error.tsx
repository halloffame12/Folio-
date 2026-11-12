"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Folio workspace error:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-lg rounded border border-border bg-card p-6 sm:p-8">
        <span className="flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="size-4" />
        </span>
        <p className="eyebrow mt-4">Something went wrong</p>
        <h1 className="mt-2 font-display text-xl font-semibold tracking-[-0.02em]">
          The workspace hit an unexpected error.
        </h1>
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
          Your locally saved data has not been cleared. Try rendering this view again, or return
          to the overview and continue from there.
        </p>
        {error.digest && (
          <p className="mt-3 rounded bg-surface px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button onClick={reset}>
            <RefreshCw /> Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to overview</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
