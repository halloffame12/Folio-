"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Loader2, Quote, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch, apiMutate } from "@/lib/api-client";
import { copyToClipboard } from "@/lib/utils";
import type { CitationStyle, Paper } from "@/types";

export function InstantCitationTool({
  onCitationGenerated,
}: {
  onCitationGenerated?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState<CitationStyle>("apa");
  const [loading, setLoading] = useState(false);
  const [citationText, setCitationText] = useState<string | null>(null);
  const [matchedPaper, setMatchedPaper] = useState<Paper | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setError("Please enter a paper title or DOI.");
      return;
    }

    setLoading(true);
    setError(null);
    setCitationText(null);
    setMatchedPaper(null);

    try {
      // 1. Search existing papers or scholarly index
      const papers = await apiFetch<Paper[]>(`/api/papers?q=${encodeURIComponent(cleanQuery)}`);
      if (!papers || papers.length === 0) {
        setError("No publication found matching that DOI or title. Try adjusting your query.");
        return;
      }

      const paper = papers[0];
      setMatchedPaper(paper);

      // 2. Generate citation
      const res = await apiMutate<{ text: string }>("/api/citations/generate", "POST", {
        paperId: paper.id,
        style,
      });

      setCitationText(res.text);
      if (onCitationGenerated) onCitationGenerated();
    } catch (err: any) {
      setError(err?.message || "Could not generate citation for this paper.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!citationText) return;
    await copyToClipboard(citationText);
    setCopied(true);
    toast.success("Citation copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStyleChange = async (newStyle: CitationStyle) => {
    setStyle(newStyle);
    if (matchedPaper) {
      setLoading(true);
      try {
        const res = await apiMutate<{ text: string }>("/api/citations/generate", "POST", {
          paperId: matchedPaper.id,
          style: newStyle,
        });
        setCitationText(res.text);
      } catch (err: any) {
        setError(err?.message || "Failed to format in selected style.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <section className="overflow-hidden rounded-md border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div>
          <h2 className="section-title text-[13px] flex items-center gap-1.5">
            <Quote className="size-3.5 text-muted-foreground" />
            Instant Citation Generator
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Generate and copy formatted references instantly
          </p>
        </div>
        <Link
          href="/citations"
          className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          All Citations →
        </Link>
      </div>

      <div className="p-5">
        <form onSubmit={handleGenerate} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Enter DOI (e.g. 10.1145/...) or paper title..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (error) setError(null);
                }}
                className="h-9 text-[12.5px] pr-8"
              />
              <Search className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
            </div>

            <div className="flex items-center gap-2">
              <Select value={style} onValueChange={(val) => handleStyleChange(val as CitationStyle)}>
                <SelectTrigger className="h-9 w-28 text-[12px] font-mono uppercase">
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apa" className="text-[12px] font-mono">APA 7th</SelectItem>
                  <SelectItem value="mla" className="text-[12px] font-mono">MLA 9th</SelectItem>
                  <SelectItem value="ieee" className="text-[12px] font-mono">IEEE</SelectItem>
                  <SelectItem value="chicago" className="text-[12px] font-mono">Chicago</SelectItem>
                </SelectContent>
              </Select>

              <Button
                type="submit"
                size="sm"
                disabled={loading || !query.trim()}
                className="h-9 px-3.5 text-[12px]"
              >
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Format"}
              </Button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-3 rounded border border-destructive/25 bg-destructive/[0.05] p-2.5 text-[11.5px] text-destructive">
            {error}
          </div>
        )}

        {citationText && (
          <div className="mt-3.5 rounded border border-border/80 bg-secondary/35 p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-muted-foreground block mb-1">
                  {style.toUpperCase()} Reference:
                </span>
                <p className="font-serif text-[12.5px] leading-relaxed text-foreground select-all break-words">
                  {citationText}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="shrink-0 h-8 gap-1.5 text-[11.5px]"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-success" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
