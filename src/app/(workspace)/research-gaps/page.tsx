"use client";

import { useState } from "react";
import { Search, FlaskConical, BookOpen, Users, Hash, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { papersById } from "@/lib/client-registry";
import { apiMutate, apiFetch } from "@/lib/api-client";
import Link from "next/link";

interface GapResult {
  analysisId: string;
  result: {
    topic: string;
    corpusSize: number;
    byYear: Record<string, number>;
    topAuthors: { name: string; count: number }[];
    topKeywords: { keyword: string; count: number }[];
    underrepresented: { keyword: string; count: number }[];
    note: string;
  };
  papers: { id: string; title: string; authors: { name: string }[]; year: number; venueShort: string }[];
}

export default function ResearchGapsPage() {
  const library = useWorkspaceStore((s) => s.data.library);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GapResult | null>(null);

  const runAnalysis = async () => {
    if (!topic.trim()) {
      toast.error("Enter a research topic.");
      return;
    }
    if (library.length === 0) {
      toast.error("Save some papers to your library first.");
      return;
    }
    setLoading(true);
    try {
      const paperIds = library.map((e) => e.paperId);
      const data = await apiMutate<GapResult>("/api/research-gaps/analyze", "POST", {
        topic: topic.trim(),
        paperIds,
      });
      setResult(data);
      toast.success("Analysis complete");
    } catch (e: any) {
      toast.error(e?.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Research intelligence"
        title="Research gap explorer"
        description="Analyse your saved papers to find potential research opportunities based on the available corpus."
      />

      <section className="mt-6 rounded-md border border-border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a research topic, e.g. machine learning in healthcare"
            className="h-10 text-[13px]"
          />
          <Button onClick={() => void runAnalysis()} disabled={loading} className="h-10 shrink-0">
            {loading ? "Analysing…" : "Run analysis"}
          </Button>
        </div>
        {library.length === 0 && (
          <p className="mt-3 text-[11px] text-muted-foreground">
            Save papers to your library first. The analysis runs on your saved corpus.
          </p>
        )}
      </section>

      {result && (
        <div className="mt-6 space-y-6">
          <section className="rounded-md border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <FlaskConical className="size-4 text-primary" />
              <h2 className="text-[14px] font-semibold">{result.result.topic}</h2>
              <Badge variant="outline" className="ml-auto">{result.result.corpusSize} papers</Badge>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">{result.result.note}</p>
          </section>

          {Object.keys(result.result.byYear).length > 0 && (
            <section className="rounded-md border border-border bg-card p-5">
              <h3 className="text-[12px] font-semibold mb-3">Papers by year</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.result.byYear)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([year, count]) => (
                    <Badge key={year} variant="secondary">{year}: {count}</Badge>
                  ))}
              </div>
            </section>
          )}

          {result.result.topAuthors.length > 0 && (
            <section className="rounded-md border border-border bg-card p-5">
              <h3 className="text-[12px] font-semibold mb-3 flex items-center gap-2"><Users className="size-3.5" /> Top authors</h3>
              <ul className="space-y-1 text-[12px]">
                {result.result.topAuthors.map((a) => (
                  <li key={a.name} className="flex justify-between">
                    <span>{a.name}</span>
                    <span className="text-muted-foreground">{a.count}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.result.topKeywords.length > 0 && (
            <section className="rounded-md border border-border bg-card p-5">
              <h3 className="text-[12px] font-semibold mb-3 flex items-center gap-2"><Hash className="size-3.5" /> Top keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.result.topKeywords.map((k) => (
                  <Badge key={k.keyword} variant="outline">{k.keyword} ({k.count})</Badge>
                ))}
              </div>
            </section>
          )}

          {result.result.underrepresented.length > 0 && (
            <section className="rounded-md border border-border bg-card p-5">
              <h3 className="text-[12px] font-semibold mb-3 flex items-center gap-2"><TrendingDown className="size-3.5" /> Potential opportunities (underrepresented keywords)</h3>
              <div className="flex flex-wrap gap-2">
                {result.result.underrepresented.map((k) => (
                  <Badge key={k.keyword} variant="warning">{k.keyword} ({k.count})</Badge>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-muted-foreground">
                Low representation is descriptive, not proof of a research gap. Verify before claiming.
              </p>
            </section>
          )}

          {result.papers.length > 0 && (
            <section className="rounded-md border border-border bg-card p-5">
              <h3 className="text-[12px] font-semibold mb-3 flex items-center gap-2"><BookOpen className="size-3.5" /> Supporting papers</h3>
              <ul className="space-y-2">
                {result.papers.map((p) => (
                  <li key={p.id}>
                    <Link href={`/discover/${p.id}`} className="text-[12px] text-primary hover:underline">
                      {p.title}
                    </Link>
                    <span className="ml-2 text-[10px] text-muted-foreground">
                      {p.authors[0]?.name} · {p.year} · {p.venueShort}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {!result && library.length > 0 && (
        <div className="mt-6">
          <EmptyState
            icon={FlaskConical}
            title="No analysis yet"
            description="Enter a topic above and run an analysis on your saved papers."
          />
        </div>
      )}
    </div>
  );
}
