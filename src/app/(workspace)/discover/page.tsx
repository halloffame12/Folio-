"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, FlaskConical, SearchX, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { PaperCard } from "@/features/discovery/paper-card";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api-client";
import { registerPapers } from "@/lib/client-registry";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Paper, PaperSearchFilters, PublicationType } from "@/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 6;

const scopes = [
  { value: "all", label: "All fields" },
  { value: "title", label: "Title" },
  { value: "author", label: "Author" },
  { value: "doi", label: "DOI" },
  { value: "keyword", label: "Keyword" },
] as const;

const years = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];

export default function DiscoverPage() {
  const library = useWorkspaceStore((s) => s.data.library);
  const savePaper = useWorkspaceStore((s) => s.savePaper);

  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<(typeof scopes)[number]["value"]>("all");
  const [author, setAuthor] = useState("");
  const [yearFrom, setYearFrom] = useState("any");
  const [yearTo, setYearTo] = useState("any");
  const [type, setType] = useState<PublicationType | "all">("all");
  const [openAccessOnly, setOpenAccessOnly] = useState(false);
  const [sort, setSort] = useState<NonNullable<PaperSearchFilters["sort"]>>("relevance");
  const [results, setResults] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const savedIds = useMemo(() => new Set(library.map((entry) => entry.paperId)), [library]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (author) params.set("author", author);
        if (yearFrom !== "any") params.set("yearFrom", yearFrom);
        if (yearTo !== "any") params.set("yearTo", yearTo);
        if (type !== "all") params.set("type", type);
        if (openAccessOnly) params.set("openAccessOnly", "true");
        if (sort) params.set("sort", sort);
        const qs = params.toString();
        const found = query ? await apiFetch<any[]>(`/api/papers${qs ? `?${qs}` : ""}`) : [];
        if (cancelled) return;
        setResults(found || []);
        registerPapers(found || []);
        setLoading(false);
        setPage(1);
      } catch {
        if (cancelled) return;
        setResults([]);
        setLoading(false);
      }
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, scope, author, yearFrom, yearTo, type, openAccessOnly, sort]);

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const activeFilters = [
    query && {
      key: "query",
      label: `${scopes.find((s) => s.value === scope)?.label}: “${query}”`,
      clear: () => setQuery(""),
    },
    author && { key: "author", label: `Author: ${author}`, clear: () => setAuthor("") },
    yearFrom !== "any" && { key: "from", label: `From ${yearFrom}`, clear: () => setYearFrom("any") },
    yearTo !== "any" && { key: "to", label: `To ${yearTo}`, clear: () => setYearTo("any") },
    type !== "all" && { key: "type", label: type, clear: () => setType("all") },
    openAccessOnly && { key: "oa", label: "Open access only", clear: () => setOpenAccessOnly(false) },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const clearAll = () => {
    setQuery("");
    setAuthor("");
    setYearFrom("any");
    setYearTo("any");
    setType("all");
    setOpenAccessOnly(false);
    setScope("all");
    setSort("relevance");
  };

  const handleSave = async (paperId: string) => {
    const added = await savePaper(paperId);
    if (added) {
      toast.success("Saved to library", {
        description: "The paper is now available in My Library.",
      });
    } else {
      toast("Already in your library");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Scholarly discovery"
        title="Discover papers"
        description="Search across titles, authors, abstracts, keywords, and DOIs. Results come from a curated demonstration index, not a live scholarly database."
        actions={
          <Badge variant="outline" className="h-7 px-2.5">
            <FlaskConical className="size-3 text-accent" />
            Mock index · 20 records
          </Badge>
        }
      />

      <div className="mb-4 flex items-start gap-2.5 rounded-md border border-dashed border-warning/30 bg-warning/[0.045] px-4 py-2.5">
        <FlaskConical className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          <strong className="font-medium text-foreground/80">Demonstration data.</strong>{" "}
          These records use realistic academic metadata but are fictional. Search and filters operate locally
          on the mock index; no external API is contacted.
        </p>
      </div>

      {/* Search composition */}
      <section
        aria-label="Paper search"
        className="overflow-hidden rounded-md border border-border bg-card shadow-xs"
      >
        <div className="flex flex-col gap-0 sm:flex-row sm:items-stretch">
          <div className="relative flex-1">
            <SearchInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onClear={() => setQuery("")}
              placeholder="Search for a paper, author, keyword, or DOI…"
              size="lg"
              aria-label="Search papers"
              wrapperClassName="h-full"
              className="h-full rounded-none border-0 border-b border-border bg-transparent pl-10 pr-5 text-[14px] shadow-none focus-visible:ring-0 sm:border-b-0 sm:border-r"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 sm:w-[180px]">
            <Select value={scope} onValueChange={(v) => setScope(v as typeof scope)}>
              <SelectTrigger className="h-8 border-0 bg-transparent shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scopes.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border bg-surface/40 px-4 py-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
            Try
          </span>
          {["provenance", "research gaps", "metadata debt", "equity"].map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term);
                setScope("all");
              }}
              className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              {term}
            </button>
          ))}
          <span className="ml-auto hidden font-mono text-[9px] uppercase tracking-wide text-muted-foreground/60 sm:block">
            Local search · deterministic results
          </span>
        </div>
      </section>

      {/* Filters */}
      <section className="mt-4 rounded-md border border-border bg-card">
        <button
          className="flex w-full items-center justify-between px-4 py-2.5 text-left"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          aria-controls="discovery-filters"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            <span className="text-[11.5px] font-medium">Refine results</span>
            {activeFilters.length > 0 && (
              <Badge variant="outline">{activeFilters.length} active</Badge>
            )}
          </span>
          <span className="flex items-center gap-3">
            <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
              {loading ? "Searching…" : `${results.length} found`}
            </span>
            <Filter className={cn("size-3.5 text-muted-foreground transition-transform", filtersOpen && "rotate-180")} />
          </span>
        </button>
        {filtersOpen && (
          <div id="discovery-filters" className="grid gap-3 border-t border-border px-4 py-3.5 sm:grid-cols-2 lg:grid-cols-6">
            <div className="space-y-1.5">
              <Label htmlFor="year-from">Year from</Label>
              <Select value={yearFrom} onValueChange={setYearFrom}>
                <SelectTrigger id="year-from">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any year</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="year-to">Year to</Label>
              <Select value={yearTo} onValueChange={setYearTo}>
                <SelectTrigger id="year-to">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any year</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="author-filter">Author</Label>
              <input
                id="author-filter"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder="Name contains…"
                className="h-9 w-full rounded border border-input bg-card px-3 text-[12px] shadow-xs placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type-filter">Publication type</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger id="type-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="journal">Journal article</SelectItem>
                  <SelectItem value="conference">Conference paper</SelectItem>
                  <SelectItem value="preprint">Preprint</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sort-filter">Sort by</Label>
              <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                <SelectTrigger id="sort-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="citations">Most cited</SelectItem>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end justify-between gap-2">
              <label className="flex h-9 items-center gap-2 text-[11.5px]">
                <Checkbox
                  checked={openAccessOnly}
                  onCheckedChange={(checked) => setOpenAccessOnly(checked === true)}
                  id="oa-filter"
                />
                <span className="text-muted-foreground">Open access</span>
              </label>
              <Button variant="ghost" size="sm" onClick={clearAll} disabled={activeFilters.length === 0 && sort === "relevance"}>
                Clear
              </Button>
            </div>
          </div>
        )}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-4 py-2">
            {activeFilters.map((filter) => (
              <span
                key={filter.key}
                className="inline-flex items-center gap-1 rounded border border-border bg-surface/70 py-0.5 pl-2 pr-1 text-[10px] text-foreground/80"
              >
                {filter.label}
                <button
                  onClick={filter.clear}
                  aria-label={`Remove ${filter.label} filter`}
                  className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            ))}
            <button onClick={clearAll} className="ml-1 text-[10px] text-primary hover:underline">
              Clear all
            </button>
          </div>
        )}
      </section>

      {/* Results */}
      <section className="mt-6" aria-label="Search results">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border pb-2">
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-[15px] font-semibold">Results</h2>
            <span className="font-mono text-[9.5px] uppercase tracking-wide text-muted-foreground" aria-live="polite">
              {loading ? "Searching mock index" : `${results.length} records`}
            </span>
          </div>
          {sort !== "relevance" && (
            <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
              Sorted by {sort}
            </span>
          )}
        </div>

        {loading ? (
          <div className="pt-4">
            <LoadingState rows={3} label="Searching papers" />
          </div>
        ) : visible.length === 0 ? (
          <div className="pt-6">
            <EmptyState
              icon={SearchX}
              title="No papers match this search"
              description="Try a broader keyword, remove the author filter, or widen the publication year range. This demonstration index contains 20 records."
              action={<Button onClick={clearAll}>Reset search</Button>}
            />
          </div>
        ) : (
          <div>
            {visible.map((paper, i) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                index={(currentPage - 1) * PAGE_SIZE + i + 1}
                saved={savedIds.has(paper.id)}
                onSave={handleSave}
              />
            ))}
            <Pagination
              page={currentPage}
              pageCount={pageCount}
              onPageChange={(next) => {
                setPage(next);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              total={results.length}
              pageSize={PAGE_SIZE}
              className="mt-4"
            />
          </div>
        )}
      </section>
    </div>
  );
}
