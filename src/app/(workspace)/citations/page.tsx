"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  Clipboard,
  Copy,
  Download,
  ExternalLink,
  FileText,
  SearchX,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import type { CitationStyle, Paper } from "@/types";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { papers, papersById } from "@/lib/client-registry";
import {
  citationStyleLabels,
  citationStyleShort,
  generateCitation,
  generateInTextCitation,
  missingMetadata,
} from "@/lib/citations";
import { copyToClipboard, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const styleCards: { value: CitationStyle; short: string; note: string }[] = [
  { value: "apa", short: "APA 7", note: "Author–date · social sciences" },
  { value: "mla", short: "MLA 9", note: "Author–page · humanities" },
  { value: "ieee", short: "IEEE", note: "Numeric · engineering" },
  { value: "chicago", short: "Chicago", note: "Notes & bibliography · history" },
];

export default function CitationsPage() {
  const library = useWorkspaceStore((s) => s.data.library);
  const settings = useWorkspaceStore((s) => s.settings);
  const updateSettings = useWorkspaceStore((s) => s.updateSettings);

  const [style, setStyle] = useState<CitationStyle>(settings.citationStyle);
  const [scope, setScope] = useState<"library" | "all">("library");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    if (initialised) return;
    setInitialised(true);
    const search = new URLSearchParams(window.location.search);
    const requested = search.get("paper");
    const fallback = library[0]?.paperId ?? papers[0]?.id ?? "";
    const id = requested && papersById[requested] ? requested : fallback;
    if (id) {
      setSelected([id]);
      setActiveId(id);
    }
    if (requested && !library.some((entry) => entry.paperId === requested)) setScope("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setStyle(settings.citationStyle);
  }, [settings.citationStyle]);

  const available = useMemo(() => {
    const source =
      scope === "library"
        ? library.map((entry) => papersById[entry.paperId]).filter(Boolean)
        : papers;
    const q = query.trim().toLowerCase();
    return source.filter((paper) =>
      q
        ? `${paper.title} ${paper.authors.map((author) => author.name).join(" ")} ${paper.doi} ${paper.venue}`
            .toLowerCase()
            .includes(q)
        : true
    );
  }, [scope, library, query]);

  const selectedPapers = useMemo(
    () =>
      selected
        .map((id) => papersById[id])
        .filter((paper): paper is Paper => Boolean(paper)),
    [selected]
  );

  const activePaper =
    selectedPapers.find((paper) => paper.id === activeId) ?? selectedPapers[0];

  const bibliography = useMemo(
    () =>
      selectedPapers
        .map((paper) => ({
          paper,
          text: generateCitation(paper, style),
        }))
        .sort((a, b) => a.text.localeCompare(b.text)),
    [selectedPapers, style]
  );

  const togglePaper = (paper: Paper) => {
    setSelected((current) =>
      current.includes(paper.id)
        ? current.filter((id) => id !== paper.id)
        : [...current, paper.id]
    );
    setActiveId(paper.id);
  };

  const copyText = async (text: string, label: string) => {
    if (!text) return;
    try {
      await copyToClipboard(text);
      toast.success(`${label} copied`, { description: citationStyleShort[style] });
    } catch {
      toast.error("Clipboard unavailable", { description: "Select the text and copy it manually." });
    }
  };

  const copyBibliography = async () => {
    if (bibliography.length === 0) {
      toast.error("Select at least one paper first");
      return;
    }
    await copyText(bibliography.map((item) => item.text).join("\n\n"), "Bibliography");
  };

  const downloadBibliography = () => {
    if (bibliography.length === 0) {
      toast.error("Select at least one paper first");
      return;
    }
    const text = [
      `Folio bibliography — ${citationStyleLabels[style]}`,
      `Generated ${formatDate(new Date(), { month: "long", day: "numeric", year: "numeric" })}`,
      "Verify all references against the source before submission.",
      "",
      ...bibliography.map((item) => item.text),
    ].join("\n\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `folio-bibliography-${style}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("Bibliography downloaded", {
      description: `${bibliography.length} references · ${citationStyleShort[style]}`,
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Personal"
        title="Citation generator"
        description="Format references from the papers in your workspace in four common styles. Copy one reference, a full bibliography, or export a text file."
        actions={
          <>
            <Badge variant="outline" className="h-7 px-2.5">
              {selectedPapers.length} selected · {citationStyleShort[style]}
            </Badge>
            <Button size="sm" variant="outline" onClick={copyBibliography}>
              <Clipboard /> Copy all
            </Button>
            <Button size="sm" onClick={downloadBibliography}>
              <Download /> Export
            </Button>
          </>
        }
      />

      <div className="mb-4 flex items-start gap-2.5 rounded border border-dashed border-border bg-surface/40 px-4 py-2.5">
        <FileText className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          <strong className="font-medium text-foreground/80">Metadata.</strong> Citations are generated
          from the metadata stored for each paper. Fields marked incomplete should be checked against the source before
          use in a real submission.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-3">
          <section className="rounded border border-border bg-card p-3.5">
            <h2 className="section-title">1. Choose a style</h2>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {styleCards.map((card) => {
                const isActive = style === card.value;
                return (
                  <button
                    key={card.value}
                    onClick={() => {
                      setStyle(card.value);
                      updateSettings({ citationStyle: card.value });
                    }}
                    aria-pressed={isActive}
                    className={
                      "rounded border px-2.5 py-2 text-left transition-colors " +
                      (isActive
                        ? "border-primary/40 bg-primary/[0.055] ring-1 ring-primary/10"
                        : "border-border hover:border-foreground/20")
                    }
                  >
                    <span className="flex items-center justify-between">
                      <span className="text-[11.5px] font-semibold">{card.short}</span>
                      {isActive && <Check className="size-3 text-primary" />}
                    </span>
                    <span className="mt-0.5 block font-mono text-[8px] uppercase leading-relaxed text-muted-foreground">
                      {card.note}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 font-mono text-[8px] uppercase tracking-wide text-muted-foreground/60">
              {citationStyleLabels[style]} · saved as your default
            </p>
          </section>

          <section className="rounded border border-border bg-card">
            <header className="border-b border-border p-3">
              <div className="flex items-center justify-between">
                <h2 className="section-title">2. Select papers</h2>
                <Badge variant="outline">{selectedPapers.length}</Badge>
              </div>
              <div className="mt-2">
                <SearchInput
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onClear={() => setQuery("")}
                  placeholder="Title, author, or DOI…"
                  aria-label="Search papers to cite"
                />
              </div>
              <div className="mt-2 flex items-center gap-1">
                <button
                  onClick={() => setScope("library")}
                  aria-pressed={scope === "library"}
                  className={
                    "rounded px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-wide transition-colors " +
                    (scope === "library"
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  My library ({library.length})
                </button>
                <button
                  onClick={() => setScope("all")}
                  aria-pressed={scope === "all"}
                  className={
                    "rounded px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-wide transition-colors " +
                    (scope === "all"
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  Workspace papers ({papers.length})
                </button>
                {selected.length > 0 && (
                  <button
                    onClick={() => {
                      setSelected([]);
                      setActiveId("");
                    }}
                    className="ml-auto font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground hover:text-destructive"
                  >
                    Clear
                  </button>
                )}
              </div>
            </header>

            <div className="max-h-[420px] overflow-y-auto">
              {available.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <SearchX className="mx-auto size-4 text-muted-foreground" />
                  <p className="mt-2 text-[10.5px] text-muted-foreground">
                    No paper matches that search in this collection.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border/60">
                  {available.map((paper) => {
                    const checked = selected.includes(paper.id);
                    const active = activePaper?.id === paper.id;
                    return (
                      <li
                        key={paper.id}
                        className={
                          "flex items-start gap-2 px-2.5 py-2 transition-colors " +
                          (active ? "bg-primary/[0.04]" : "hover:bg-secondary/30")
                        }
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => togglePaper(paper)}
                          className="mt-0.5"
                          aria-label={`Select ${paper.title}`}
                        />
                        <button onClick={() => setActiveId(paper.id)} className="min-w-0 flex-1 text-left">
                          <p className="line-clamp-2 font-serif text-[11px] font-medium leading-snug">
                            {paper.title}
                          </p>
                          <p className="mt-0.5 font-mono text-[8px] uppercase tracking-wide text-muted-foreground">
                            {paper.authors[0]?.name ?? "Unknown"} · {paper.year}
                          </p>
                        </button>
                        {missingMetadata(paper).length > 0 && (
                          <span title={`Missing: ${missingMetadata(paper).join(", ")}`}>
                            <TriangleAlert className="mt-0.5 size-3 text-warning" />
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </aside>

        <div className="space-y-3">
          {!activePaper ? (
            <EmptyState
              icon={BookOpen}
              title="Select a paper to generate a citation"
              description="Choose one or more records on the left. The preview updates as you change style."
              className="bg-card"
            />
          ) : (
            <>
              <section className="rounded border border-border bg-card">
                <header className="border-b border-border px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="meta-label">3. Preview</p>
                      <h2 className="mt-1 font-serif text-[16px] font-medium leading-snug">
                        {activePaper.title}
                      </h2>
                      <p className="mt-1 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                        {activePaper.authors.map((author) => author.name).join(", ")} · {activePaper.year} ·{" "}
                        {activePaper.venueShort}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline">{citationStyleShort[style]}</Badge>
                      {missingMetadata(activePaper).length > 0 ? (
                        <Badge variant="warning">
                          <TriangleAlert className="size-2.5" /> Incomplete metadata
                        </Badge>
                      ) : (
                        <Badge variant="success">Metadata complete</Badge>
                      )}
                    </div>
                  </div>
                </header>

                <div className="space-y-4 p-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="meta-label">Reference</h3>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-muted-foreground"
                        onClick={() => void copyText(generateCitation(activePaper, style), "Reference")}
                      >
                        <Copy /> Copy
                      </Button>
                    </div>
                    <div className="mt-1.5 rounded border border-border bg-surface/35 px-3.5 py-3">
                      <p className="font-serif text-[13.5px] leading-[1.75] text-foreground/85">
                        {generateCitation(activePaper, style)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="meta-label">In-text</h3>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-muted-foreground"
                        onClick={() =>
                          void copyText(generateInTextCitation(activePaper, style), "In-text citation")
                        }
                      >
                        <Copy /> Copy
                      </Button>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <code className="rounded border border-border bg-card px-2 py-1 font-mono text-[11px] text-foreground/85">
                        {generateInTextCitation(activePaper, style)}
                      </code>
                      <span className="font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground">
                        Insert at the point of use
                      </span>
                    </div>
                  </div>

                  {missingMetadata(activePaper).length > 0 && (
                    <div className="flex items-start gap-2 rounded border border-warning/30 bg-warning/[0.05] px-3 py-2">
                      <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-warning" />
                      <div className="text-[10.5px] leading-relaxed text-muted-foreground">
                        <p>
                          <span className="font-medium text-foreground/80">Missing fields: </span>
                          {missingMetadata(activePaper).join(", ")}.
                        </p>
                        <p className="mt-0.5">
                          The citation is formatted from available metadata. Verify against the publisher record
                          before submission.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-3 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                    <span>DOI · {activePaper.doi}</span>
                    <span className="text-border">/</span>
                    <a
                      href={activePaper.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Source <ExternalLink className="size-2.5" />
                    </a>
                    <span className="text-border">/</span>
                    <Link href={`/discover/${activePaper.id}`} className="hover:text-primary">
                      Paper record
                    </Link>
                  </div>
                </div>
              </section>

              <section className="rounded border border-border bg-card">
                <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                  <div>
                    <h2 className="section-title">Bibliography</h2>
                    <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                      {bibliography.length} reference{bibliography.length === 1 ? "" : "s"} ·{" "}
                      {citationStyleLabels[style]} · alphabetised
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="xs" onClick={copyBibliography}>
                      <Clipboard /> Copy
                    </Button>
                    <Button variant="outline" size="xs" onClick={downloadBibliography}>
                      <Download /> TXT
                    </Button>
                  </div>
                </header>

                {bibliography.length === 0 ? (
                  <p className="px-4 py-8 text-center text-[11px] text-muted-foreground">
                    Add papers with the checkboxes to build a bibliography.
                  </p>
                ) : (
                  <ol className="divide-y divide-border/60">
                    {bibliography.map((item, index) => (
                      <li key={item.paper.id} className="flex items-start gap-3 px-4 py-2.5">
                        <span className="mt-0.5 font-mono text-[9px] tabular-nums text-muted-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="min-w-0 flex-1 font-serif text-[11.5px] leading-relaxed text-foreground/80">
                          {item.text}
                        </p>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            onClick={() => void copyText(item.text, "Reference")}
                            className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            aria-label={`Copy reference for ${item.paper.title}`}
                          >
                            <Copy className="size-3" />
                          </button>
                          <Link
                            href={`/discover/${item.paper.id}`}
                            className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            aria-label={`Open ${item.paper.title}`}
                          >
                            <ExternalLink className="size-3" />
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
                <div className="border-t border-border bg-surface/30 px-4 py-2 font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground/70">
                  Exported file includes a verification note · indexed metadata
                </div>
              </section>

              <Tabs defaultValue="note" className="rounded border border-border bg-card px-4 py-3">
                <TabsList className="h-7 rounded-none border-0 border-b border-border bg-transparent p-0">
                  <TabsTrigger
                    value="note"
                    className="rounded-none border-b-2 border-transparent px-2 py-1 text-[10px] data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Style notes
                  </TabsTrigger>
                  <TabsTrigger
                    value="checklist"
                    className="rounded-none border-b-2 border-transparent px-2 py-1 text-[10px] data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Pre-submission checklist
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="note" className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground">
                  This build implements a compact subset of each style. {citationStyleLabels[style]} expects
                  author–date formatting, sentence-case article titles, and a DOI where available. Books, datasets, and
                  non-English sources may need fields not present in the stored metadata.
                </TabsContent>
                <TabsContent value="checklist" className="mt-2">
                  <ul className="space-y-1 text-[10.5px] text-muted-foreground">
                    {[
                      "Check every author name and initial.",
                      "Confirm volume, issue, pages, and publisher.",
                      "Verify the DOI resolves to the intended record.",
                      "Match the style required by the venue exactly.",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-1.5">
                        <Check className="mt-0.5 size-3 shrink-0 text-success" /> {item}
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>

      <Separator className="my-4" />
      <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground/60">
        Generated locally · no external citation service is contacted · selected papers persist in this browser only
      </p>
    </div>
  );
}
