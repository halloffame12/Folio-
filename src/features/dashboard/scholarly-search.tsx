"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Compass, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ScholarlyQuickSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/discover?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search scholarly literature"
      className={cn("relative w-full", className)}
    >
      <div className="relative flex items-center rounded-md border border-border bg-card/90 shadow-2xs transition-all focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 hover:border-border/80">
        <Search
          className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground/70"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by paper title, DOI (e.g. 10.1145/...), author, or topic across Crossref & OpenAlex…"
          className="h-11 w-full bg-transparent pl-10 pr-20 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
        <div className="absolute right-1.5 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search query"
              className="rounded p-1 text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!query.trim()}
            className="h-8 gap-1.5 px-3 text-[12px] font-medium"
          >
            <span className="hidden sm:inline">Search</span>
            <ArrowRight className="size-3" />
          </Button>
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2 px-1 text-[11px] text-muted-foreground/80">
        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
          <Compass className="size-3" /> Index:
        </span>
        <button
          type="button"
          onClick={() => {
            setQuery("machine learning healthcare");
            router.push(`/discover?q=${encodeURIComponent("machine learning healthcare")}`);
          }}
          className="underline decoration-border/60 underline-offset-2 transition-colors hover:text-foreground"
        >
          machine learning healthcare
        </button>
        <span className="text-border">·</span>
        <button
          type="button"
          onClick={() => {
            setQuery("transformer neural network");
            router.push(`/discover?q=${encodeURIComponent("transformer neural network")}`);
          }}
          className="underline decoration-border/60 underline-offset-2 transition-colors hover:text-foreground"
        >
          transformer neural network
        </button>
        <span className="text-border">·</span>
        <button
          type="button"
          onClick={() => {
            setQuery("climate change policy");
            router.push(`/discover?q=${encodeURIComponent("climate change policy")}`);
          }}
          className="underline decoration-border/60 underline-offset-2 transition-colors hover:text-foreground"
        >
          climate change policy
        </button>
      </div>
    </form>
  );
}
