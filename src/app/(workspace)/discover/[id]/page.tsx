"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BookmarkCheck,
  BookmarkPlus,
  ChevronDown,
  Copy,
  FileText,
  FolderPlus,
  NotebookPen,
  Quote,
  ScrollText,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { papers, papersById, registerPapers } from "@/lib/client-registry";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { citationStyleLabels, citationStyleShort, generateCitation, generateInTextCitation, missingMetadata } from "@/lib/citations";
import { readingStatusConfig, readingStatuses, publicationTypeLabels } from "@/lib/labels";
import { copyToClipboard, formatDate } from "@/lib/utils";
import type { CitationStyle } from "@/types";

export default function PaperDetailPage() {
  const params = useParams<{ id: string }>();
  const [paper, setPaper] = useState<any>(papersById[params.id]);
  useEffect(() => {
    if (paper) return;
    (async () => {
      try {
        const p = await (await fetch(`/api/papers/${params.id}`, { credentials: "include" })).json();
        if (p?.success && p.data) {
          registerPapers([p.data]);
          setPaper(p.data);
        }
      } catch {}
    })();
  }, [params.id, paper]);

  const library = useWorkspaceStore((s) => s.data.library);
  const collections = useWorkspaceStore((s) => s.data.collections);
  const savePaper = useWorkspaceStore((s) => s.savePaper);
  const updateReadingStatus = useWorkspaceStore((s) => s.updateReadingStatus);
  const updateReadingProgress = useWorkspaceStore((s) => s.updateReadingProgress);
  const markPaperOpened = useWorkspaceStore((s) => s.markPaperOpened);
  const addPaperToCollection = useWorkspaceStore((s) => s.addPaperToCollection);
  const removePaperFromCollection = useWorkspaceStore((s) => s.removePaperFromCollection);

  const [style, setStyle] = useState<CitationStyle>("apa");
  const [saving, setSaving] = useState(false);

  const entry = library.find((item) => item.paperId === paper?.id);
  const saved = Boolean(entry);
  const inCollections = useMemo(
    () => collections.filter((c) => paper && c.paperIds.includes(paper.id)),
    [collections, paper]
  );

  useEffect(() => {
    if (paper) markPaperOpened(paper.id);
  }, [paper, markPaperOpened]);

  if (!paper) {
    return (
      <div>
        <PageHeader
          eyebrow="Discover papers"
          title="Paper not found"
          description="This record is not available in the current session."
          backHref="/discover"
          backLabel="Back to discovery"
        />
        <EmptyState
          icon={ScrollText}
          title="We could not find that paper"
          description="The identifier may be incorrect, or the record may not exist."
          action={<Button asChild><Link href="/discover">Browse the index</Link></Button>}
        />
      </div>
    );
  }

  const citation = generateCitation(paper, style);
  const missing = missingMetadata(paper);
  const related = papers
    .filter(
      (candidate) =>
        candidate.id !== paper.id &&
        candidate.keywords.some((keyword) => paper.keywords.includes(keyword))
    )
    .slice(0, 3);

  const handleSave = async () => {
    setSaving(true);
    try {
      const added = await savePaper(paper.id);
      if (added) toast.success("Saved to library");
      else toast("Already in your library");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await copyToClipboard(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error("Clipboard is unavailable in this browser");
    }
  };

  return (
    <div>
      <Link
        href="/discover"
        className="mb-5 inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to discovery
      </Link>

      <div className="border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[9.5px] uppercase tracking-[0.09em] text-muted-foreground">
          <span className="text-primary">{(publicationTypeLabels as any)[paper.publicationType]}</span>
          <span className="text-border">/</span>
          <span>{paper.year}</span>
          <span className="text-border">/</span>
          <span className="normal-case tracking-normal">{paper.venueShort}</span>
          {paper.openAccess && (
            <>
              <span className="text-border">/</span>
              <span className="text-success">Open access</span>
            </>
          )}
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div>
            <h1 className="font-serif text-[26px] font-medium leading-[1.22] tracking-[-0.02em] sm:text-[32px]">
              {paper.title}
            </h1>
            <div className="mt-5 space-y-1.5">
              {paper.authors.map((author: any) => (
                <div key={author.id} className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-[13px] font-medium text-foreground">{author.name}</span>
                  <span className="text-[11px] text-muted-foreground">{author.affiliation}</span>
                  {author.orcid && (
                    <span className="font-mono text-[9px] text-muted-foreground/60">
                      ORCID {author.orcid}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {paper.keywords.map((keyword: any) => (
                <Badge key={keyword} variant="outline" className="normal-case tracking-normal">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:items-stretch">
            <Button
              variant={saved ? "subtle" : "default"}
              onClick={handleSave}
              disabled={saved || saving}
            >
              {saved ? <BookmarkCheck /> : <BookmarkPlus />}
              {saved ? "In your library" : saving ? "Saving…" : "Save to library"}
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/citations?paper=${paper.id}`}>
                <Quote /> Generate citation
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/notes?new=1&paper=${paper.id}`}>
                <NotebookPen /> Add a note
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FolderPlus /> Add to collection <ChevronDown className="ml-auto size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Collections</DropdownMenuLabel>
                {collections.length === 0 && (
                  <DropdownMenuItem asChild>
                    <Link href="/collections?new=1">Create a collection</Link>
                  </DropdownMenuItem>
                )}
                {collections.map((collection) => {
                  const included = collection.paperIds.includes(paper.id);
                  return (
                    <DropdownMenuCheckboxItem
                      key={collection.id}
                      checked={included}
                      onCheckedChange={async (checked) => {
                        if (checked) {
                          await addPaperToCollection(collection.id, paper.id);
                          toast.success(`Added to ${collection.name}`);
                        } else {
                          removePaperFromCollection(collection.id, paper.id);
                          toast(`Removed from ${collection.name}`);
                        }
                      }}
                    >
                      <span className="truncate">{collection.name}</span>
                    </DropdownMenuCheckboxItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/collections?new=1">
                    <FolderPlus /> New collection
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="min-w-0">
          <section aria-labelledby="abstract-heading">
            <div className="flex items-center gap-2">
              <span className="size-1 bg-accent" aria-hidden />
              <h2 id="abstract-heading" className="meta-label text-foreground">
                Abstract
              </h2>
            </div>
            <p className="mt-3 font-serif text-[16px] leading-[1.78] text-foreground/90">
              {paper.abstract}
            </p>
          </section>

          <Separator className="my-6" />

          <section aria-labelledby="citation-heading">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="size-1 bg-accent" aria-hidden />
                <h2 id="citation-heading" className="meta-label text-foreground">
                  Cite this paper
                </h2>
              </div>
              <div className="flex border border-border">
                {(Object.keys(citationStyleShort) as CitationStyle[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setStyle(key)}
                    className={`px-2.5 py-1 font-mono text-[9px] uppercase tracking-wide transition-colors ${
                      style === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {citationStyleShort[key]}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 rounded border border-border bg-surface/40 p-4">
              <p className="font-serif text-[13.5px] leading-[1.75] text-foreground/85">
                {citation}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                  {citationStyleLabels[style]}
                </span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => handleCopy(citation, citationStyleShort[style])}
                >
                  <Copy /> Copy
                </Button>
              </div>
            </div>
            <p className="mt-2 font-mono text-[9.5px] text-muted-foreground">
              In-text: {generateInTextCitation(paper, style)}
            </p>
            {missing.length > 0 && (
              <p className="mt-3 rounded border border-warning/25 bg-warning/[0.05] px-3 py-2 text-[10.5px] leading-relaxed text-muted-foreground">
                <strong className="font-medium text-warning">Incomplete metadata:</strong>{" "}
                {missing.join(", ")}. The generated citation may not meet the style guide in full.
              </p>
            )}
          </section>

          {related.length > 0 && (
            <>
              <Separator className="my-6" />
              <section aria-labelledby="related-heading">
                <div className="flex items-center gap-2">
                  <span className="size-1 bg-accent" aria-hidden />
                  <h2 id="related-heading" className="meta-label text-foreground">
                    Related in the index
                  </h2>
                </div>
                <ul className="mt-3 divide-y divide-border/70">
                  {related.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/discover/${item.id}`}
                        className="group flex items-start justify-between gap-4 py-3"
                      >
                        <span className="min-w-0">
                          <span className="paper-title block text-[14px] transition-colors group-hover:text-primary">
                            {item.title}
                          </span>
                          <span className="mt-1 block text-[10.5px] text-muted-foreground">
                            {item.authors[0]?.name} et al. · {item.year} · {item.venueShort}
                          </span>
                        </span>
                        <ArrowUpRight className="mt-1 size-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </article>

        <aside className="min-w-0 space-y-4">
          <section className="rounded-md border border-border bg-card p-4">
            <h2 className="meta-label text-foreground">Library record</h2>
            {saved && entry ? (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">Reading status</span>
                  <Select
                    value={entry.status}
                    onValueChange={(value) => {
                      updateReadingStatus(paper.id, value as typeof entry.status);
                      toast.success(`Marked as ${readingStatusConfig[value as typeof entry.status].label.toLowerCase()}`);
                    }}
                  >
                    <SelectTrigger className="h-7 w-[116px] text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {readingStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {readingStatusConfig[status].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="reading-progress" className="text-[11px] text-muted-foreground">
                      Reading progress
                    </label>
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                      {entry.readingProgress ?? 0}%
                    </span>
                  </div>
                  <input
                    id="reading-progress"
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={entry.readingProgress ?? 0}
                    onChange={(event) =>
                      updateReadingProgress(paper.id, Number(event.target.value))
                    }
                    className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
                    aria-valuetext={`${entry.readingProgress ?? 0} percent read`}
                  />
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2.5">
                  <span className="text-[10.5px] text-muted-foreground">Added</span>
                  <span className="font-mono text-[9.5px] text-foreground/70">
                    {formatDate(entry.addedAt)}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-muted-foreground">Collections</span>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {inCollections.length > 0 ? (
                      inCollections.map((collection) => (
                        <Link key={collection.id} href={`/collections/${collection.id}`}>
                          <Badge variant="outline" className="normal-case tracking-normal hover:border-primary/30 hover:text-primary">
                            {collection.name}
                          </Badge>
                        </Link>
                      ))
                    ) : (
                      <span className="text-[10px] italic text-muted-foreground/70">
                        Not in a collection
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Save this paper to track reading progress, add tags, and file it into collections.
                </p>
                <Button size="sm" className="mt-3 w-full" onClick={handleSave} disabled={saving}>
                  <BookmarkPlus /> {saving ? "Saving…" : "Save to library"}
                </Button>
              </div>
            )}
          </section>

          <section className="rounded-md border border-border bg-card p-4">
            <h2 className="meta-label text-foreground">Publication record</h2>
            <dl className="mt-3 space-y-2.5 text-[11px]">
              <div className="grid grid-cols-[74px_1fr] gap-2">
                <dt className="text-muted-foreground">Journal</dt>
                <dd className="leading-relaxed">{paper.venue}</dd>
              </div>
              {paper.volume && (
                <div className="grid grid-cols-[74px_1fr] gap-2">
                  <dt className="text-muted-foreground">Volume</dt>
                  <dd className="font-mono text-[10.5px]">{paper.volume}{paper.issue ? ` (${paper.issue})` : ""}</dd>
                </div>
              )}
              {paper.pages && (
                <div className="grid grid-cols-[74px_1fr] gap-2">
                  <dt className="text-muted-foreground">Pages</dt>
                  <dd className="font-mono text-[10.5px]">{paper.pages}</dd>
                </div>
              )}
              {paper.publisher && (
                <div className="grid grid-cols-[74px_1fr] gap-2">
                  <dt className="text-muted-foreground">Publisher</dt>
                  <dd>{paper.publisher}</dd>
                </div>
              )}
              <div className="grid grid-cols-[74px_1fr] gap-2">
                <dt className="text-muted-foreground">DOI</dt>
                <dd className="break-all font-mono text-[10px] text-foreground/70">{paper.doi}</dd>
              </div>
              <div className="grid grid-cols-[74px_1fr] gap-2">
                <dt className="text-muted-foreground">Citations</dt>
                <dd className="font-mono text-[10.5px]">{paper.citationCount.toLocaleString()}</dd>
              </div>
            </dl>
            <div className="mt-3 flex gap-2 border-t border-border pt-3">
              <Button
                variant="ghost"
                size="xs"
                className="flex-1"
                onClick={() => handleCopy(paper.doi, "DOI")}
              >
                <Copy /> Copy DOI
              </Button>
              <Button variant="ghost" size="xs" className="flex-1" asChild>
                <a href={paper.sourceUrl} target="_blank" rel="noreferrer">
                  <ArrowUpRight /> Source
                </a>
              </Button>
            </div>
          </section>

          <section className="rounded-md border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="meta-label text-foreground">PDF availability</h2>
              <Badge variant={paper.pdfAvailable ? "success" : "outline"}>
                {paper.pdfAvailable ? "Available" : "Unavailable"}
              </Badge>
            </div>
            <p className="mt-2.5 text-[10.5px] leading-relaxed text-muted-foreground">
              {paper.pdfAvailable
                ? "An open-access link is recorded for this paper. PDF preview is not implemented in this build."
                : "No open full text is indexed. Access may be available through your institution's subscriptions."}
            </p>
            {paper.pdfAvailable && (
              <div className="mt-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wide text-success">
                <FileText className="size-3" /> Open access full text
              </div>
            )}
          </section>

          <div className="rounded-md border border-dashed border-border bg-surface/40 px-3 py-2.5">
            <p className="text-[9.5px] leading-relaxed text-muted-foreground">
              Metadata is provided by the indexing source. Citation counts and availability may be
              incomplete and should be verified against the publisher before use.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
