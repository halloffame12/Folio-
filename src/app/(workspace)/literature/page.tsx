"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  Clipboard,
  Download,
  Loader2,
  NotebookPen,
  Paperclip,
  Plus,
  Quote,
  SearchX,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { CitationStyle, ReviewSection } from "@/types";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { papersById } from "@/lib/client-registry";
import {
  citationStyleLabels,
  generateBibliography,
  generateCitation,
  generateInTextCitation,
  missingMetadata,
} from "@/lib/citations";
import { copyToClipboard, formatDate, relativeTime, stripHtml, wordCount, cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";
import { SearchInput } from "@/components/shared/search-input";
import { RichTextEditor } from "@/features/notes/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const styleOptions = Object.keys(citationStyleLabels) as CitationStyle[];

function flattenSections(sections: ReviewSection[], depth = 0): { section: ReviewSection; depth: number }[] {
  return sections.flatMap((section) => [
    { section, depth },
    ...flattenSections(section.subsections, depth + 1),
  ]);
}

export default function LiteraturePage() {
  const reviews = useWorkspaceStore((s) => s.data.literatureReviews);
  const projects = useWorkspaceStore((s) => s.data.projects);
  const notes = useWorkspaceStore((s) => s.data.notes);
  const library = useWorkspaceStore((s) => s.data.library);
  const settings = useWorkspaceStore((s) => s.settings);
  const updateReviewSection = useWorkspaceStore((s) => s.updateReviewSection);
  const updateReviewSources = useWorkspaceStore((s) => s.updateReviewSources);

  const [reviewId, setReviewId] = useState<string>(reviews[0]?.id ?? "");
  const [sectionId, setSectionId] = useState<string>("");
  const [style, setStyle] = useState<CitationStyle>(settings.citationStyle);
  const [sourceTab, setSourceTab] = useState("papers");
  const [sourceQuery, setSourceQuery] = useState("");
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [draftPaperIds, setDraftPaperIds] = useState<string[]>([]);
  const [draftNoteIds, setDraftNoteIds] = useState<string[]>([]);
  const timer = useRef<number | null>(null);
  const initialised = useRef(false);

  const review = reviews.find((item) => item.id === reviewId) ?? reviews[0];
  const project = projects.find((item) => item.id === review?.projectId);
  const outline = useMemo(() => (review ? flattenSections(review.sections) : []), [review]);
  const activeSection = outline.find((item) => item.section.id === sectionId)?.section;

  useEffect(() => {
    if (initialised.current || reviews.length === 0) return;
    initialised.current = true;
    const search = new URLSearchParams(window.location.search);
    const requestedReview = search.get("review");
    const requestedSection = search.get("section");
    const chosen = reviews.find((item) => item.id === requestedReview) ?? reviews[0]!;
    setReviewId(chosen.id);
    const flat = flattenSections(chosen.sections);
    const section = flat.find((item) => item.section.id === requestedSection) ?? flat[0];
    setSectionId(section?.section.id ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!review) return;
    const flat = flattenSections(review.sections);
    if (!flat.some((item) => item.section.id === sectionId)) {
      setSectionId(flat[0]?.section.id ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewId]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  if (reviews.length === 0 || !review) {
    return (
      <div>
        <PageHeader
          eyebrow="Research"
          title="Literature review"
          description="A three-pane writing workspace for turning reading into argument."
        />
        <EmptyState
          icon={BookOpen}
          title="No literature reviews yet"
          description="Create a project and its review workspace will appear here."
          action={
            <Button asChild>
              <Link href="/projects">Go to projects</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const sources = review.paperIds.map((id) => papersById[id]).filter(Boolean);
  const linkedNotes = review.noteIds
    .map((id) => notes.find((note) => note.id === id))
    .filter((note): note is NonNullable<typeof note> => Boolean(note));

  const q = sourceQuery.trim().toLowerCase();
  const filteredPapers = sources.filter((paper) =>
    q ? `${paper.title} ${paper.authors.map((a) => a.name).join(" ")}`.toLowerCase().includes(q) : true
  );
  const filteredNotes = linkedNotes.filter((note) =>
    q ? `${note.title} ${stripHtml(note.content)}`.toLowerCase().includes(q) : true
  );

  const totalWords = outline.reduce((acc, item) => acc + wordCount(item.section.content), 0);
  const completedSections = outline.filter((item) => wordCount(item.section.content) > 50).length;

  const changeSection = (next: string) => {
    setSectionId(next);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/literature?review=${review.id}&section=${next}`);
    }
  };

  const handleContentChange = (html: string) => {
    if (!activeSection) return;
    setSaveState("saving");
    updateReviewSection(review.id, activeSection.id, html);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setSaveState("saved");
      setLastSaved(new Date());
    }, 500);
  };

  const copyText = async (text: string, label: string) => {
    try {
      await copyToClipboard(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Clipboard unavailable", { description: "Select and copy the text manually." });
    }
  };

  const copyBibliography = async () => {
    const bibliography = generateBibliography(sources, style);
    await copyText(bibliography, `Bibliography (${citationStyleLabels[style]})`);
  };

  const exportReview = async () => {
    const text = outline
      .map(({ section, depth }) => {
        const title = `${"#".repeat(Math.min(depth + 1, 3))} ${section.title}`;
        const body = stripHtml(section.content);
        return `${title}\n\n${body || "[section not yet drafted]"}`;
      })
      .join("\n\n");
    await copyText(
      `${review.title}\n\nResearch question: ${review.researchQuestion}\n\n${text}`,
      "Review draft"
    );
  };

  const openSources = () => {
    setDraftPaperIds(review.paperIds);
    setDraftNoteIds(review.noteIds);
    setSourceQuery("");
    setSourcesOpen(true);
  };

  const saveSources = () => {
    updateReviewSources(review.id, { paperIds: draftPaperIds, noteIds: draftNoteIds });
    toast.success("Sources updated", {
      description: `${draftPaperIds.length} papers · ${draftNoteIds.length} notes`,
    });
    setSourcesOpen(false);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Research"
        title="Literature review"
        description="Draft the argument beside its evidence. The outline, editor, and sources stay in one view so claims never drift far from what supports them."
        actions={
          <>
            <Select
              value={review.id}
              onValueChange={(value) => {
                setReviewId(value);
              }}
            >
              <SelectTrigger className="w-[240px]" aria-label="Switch literature review">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reviews.map((item) => {
                  const itemProject = projects.find((p) => p.id === item.projectId);
                  return (
                    <SelectItem key={item.id} value={item.id}>
                      {itemProject?.tag ?? item.title}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => void exportReview()}>
              <Download /> Export draft
            </Button>
          </>
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded border border-border bg-card px-3.5 py-2.5">
        <div className="min-w-0">
          <p className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground">
            {project ? (
              <Link href={`/projects/${project.id}?tab=literature`} className="hover:text-primary">
                {project.title}
              </Link>
            ) : (
              "Independent review"
            )}
          </p>
          <h2 className="mt-0.5 truncate font-display text-[14px] font-semibold">{review.title}</h2>
        </div>
        <span className="hidden h-8 w-px bg-border sm:block" />
        <div className="flex flex-1 items-center gap-2">
          <span className="font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground">Progress</span>
          <Progress value={review.progress} className="h-1 max-w-[140px] flex-1" />
          <span className="font-mono text-[9px] tabular-nums text-muted-foreground">{review.progress}%</span>
        </div>
        <span className="font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground">
          {totalWords.toLocaleString()} words · {sources.length} sources · updated {relativeTime(review.updatedAt)}
        </span>
      </div>

      <div className="overflow-hidden rounded border border-border bg-card shadow-xs">
        <div className="grid min-h-[680px] xl:grid-cols-[230px_minmax(0,1fr)_300px]">
          {/* Outline */}
          <aside className="border-b border-border bg-surface/25 xl:border-b-0 xl:border-r" aria-label="Review outline">
            <div className="border-b border-border px-3 py-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[12px] font-semibold">Outline</h2>
                <span className="font-mono text-[8.5px] uppercase text-muted-foreground">
                  {completedSections}/{outline.length} drafted
                </span>
              </div>
              <p className="mt-1 font-serif text-[10.5px] leading-relaxed text-muted-foreground">
                {review.researchQuestion}
              </p>
            </div>
            <nav className="max-h-[240px] overflow-y-auto p-1.5 xl:max-h-[calc(100dvh-360px)]">
              {outline.map(({ section, depth }) => {
                const words = wordCount(section.content);
                const active = section.id === sectionId;
                return (
                  <button
                    key={section.id}
                    onClick={() => changeSection(section.id)}
                    className={cn(
                      "group flex w-full items-start gap-1.5 rounded px-2 py-1.5 text-left transition-colors",
                      depth > 0 && "pl-5",
                      active ? "bg-primary/[0.06]" : "hover:bg-secondary/50"
                    )}
                    aria-current={active ? "true" : undefined}
                  >
                    <span
                      className={cn(
                        "mt-1 size-1.5 shrink-0 rounded-full",
                        words > 50 ? "bg-success" : words > 0 ? "bg-warning" : "bg-border"
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-[10.5px] leading-snug",
                          active ? "font-semibold text-primary" : "text-foreground/80"
                        )}
                      >
                        {section.title}
                      </span>
                      <span className="font-mono text-[8px] uppercase text-muted-foreground/70">
                        {words} words
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-border p-3">
              <Button variant="outline" size="sm" className="w-full" onClick={openSources}>
                <Plus /> Manage sources
              </Button>
              <p className="mt-2 font-mono text-[8px] uppercase leading-relaxed tracking-wide text-muted-foreground/60">
                Draft review · saves to your account
              </p>
            </div>
          </aside>

          {/* Editor */}
          <section className="flex min-w-0 flex-col" aria-label="Review editor">
            {!activeSection ? (
              <div className="flex flex-1 items-center justify-center p-6">
                <EmptyState icon={BookOpen} title="Choose a section" description="Select a heading in the outline." />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground">
                      Section
                    </p>
                    <h2 className="truncate font-display text-[14px] font-semibold">{activeSection.title}</h2>
                  </div>
                  <span
                    className="flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground"
                    aria-live="polite"
                  >
                    {saveState === "saving" ? (
                      <>
                        <Loader2 className="size-2.5 animate-spin" /> Saving
                      </>
                    ) : (
                      <>
                        <Check className="size-2.5 text-success" /> {lastSaved ? "Saved" : "Autosave on"}
                      </>
                    )}
                  </span>
                  <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => void copyBibliography()}>
                    <Quote /> Copy bibliography
                  </Button>
                </div>

                <div className="min-h-0 flex-1">
                  <RichTextEditor
                    key={activeSection.id}
                    noteId={activeSection.id}
                    initialContent={activeSection.content}
                    onChange={handleContentChange}
                    placeholder="Write this section. A claim, then its evidence, then what follows from it."
                  />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border bg-surface/30 px-4 py-2 font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground">
                  <span>{wordCount(activeSection.content)} words</span>
                  <span>{activeSection.paperIds.length} linked sources</span>
                  <span>{activeSection.noteIds.length} notes</span>
                  <span className="ml-auto normal-case tracking-normal">
                    {lastSaved ? `Saved ${relativeTime(lastSaved)}` : `Updated ${relativeTime(review.updatedAt)}`}
                  </span>
                </div>
              </>
            )}
          </section>

          {/* Sources */}
          <aside className="border-t border-border bg-surface/20 xl:border-l xl:border-t-0" aria-label="Sources and citations">
            <div className="border-b border-border p-2.5">
              <SearchInput
                value={sourceQuery}
                onChange={(event) => setSourceQuery(event.target.value)}
                onClear={() => setSourceQuery("")}
                placeholder="Search sources…"
                aria-label="Search review sources"
              />
            </div>
            <Tabs value={sourceTab} onValueChange={setSourceTab} className="flex h-full flex-col">
              <TabsList className="mx-2.5 mt-2 h-7 w-auto justify-start rounded-none border-0 border-b border-border bg-transparent p-0">
                {[
                  { value: "papers", label: `Papers ${sources.length}` },
                  { value: "notes", label: `Notes ${linkedNotes.length}` },
                  { value: "cite", label: "Cite" },
                ].map((item) => (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className="rounded-none border-b-2 border-transparent px-2 py-1 text-[10px] data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="max-h-[340px] flex-1 overflow-y-auto xl:max-h-[calc(100dvh-420px)]">
                <TabsContent value="papers" className="m-0 p-2">
                  {filteredPapers.length === 0 ? (
                    <p className="px-1 py-6 text-center text-[10.5px] text-muted-foreground">
                      {q ? "No paper matches that search." : "No papers linked yet."}
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {filteredPapers.map((paper) => (
                        <li key={paper.id} className="rounded border border-border/70 bg-card p-2">
                          <Link href={`/discover/${paper.id}`} className="group block">
                            <p className="line-clamp-2 font-serif text-[11px] font-medium leading-snug group-hover:text-primary">
                              {paper.title}
                            </p>
                            <p className="mt-1 font-mono text-[8px] uppercase tracking-wide text-muted-foreground">
                              {paper.authors[0]?.name} · {paper.year}
                            </p>
                          </Link>
                          <div className="mt-1.5 flex items-center gap-1">
                            <button
                              onClick={() => void copyText(generateInTextCitation(paper, style), "In-text citation")}
                              className="rounded border border-border px-1.5 py-0.5 font-mono text-[8px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                            >
                              Cite
                            </button>
                            <span className="ml-auto font-mono text-[8px] text-muted-foreground">
                              {paper.citationCount} cites
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </TabsContent>

                <TabsContent value="notes" className="m-0 p-2">
                  {filteredNotes.length === 0 ? (
                    <p className="px-1 py-6 text-center text-[10.5px] text-muted-foreground">
                      {q ? "No note matches that search." : "No notes linked yet."}
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {filteredNotes.map((note) => (
                        <li key={note.id} className="rounded border border-border/70 bg-card p-2">
                          <Link href={`/notes?note=${note.id}`} className="group flex items-start gap-1.5">
                            <NotebookPen className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                            <span>
                              <span className="line-clamp-2 block text-[10.5px] font-medium leading-snug group-hover:text-primary">
                                {note.title}
                              </span>
                              <span className="mt-0.5 line-clamp-2 block text-[9.5px] leading-relaxed text-muted-foreground">
                                {stripHtml(note.content).slice(0, 90)}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </TabsContent>

                <TabsContent value="cite" className="m-0 p-2.5">
                  <label className="meta-label" htmlFor="review-citation-style">
                    Citation style
                  </label>
                  <Select value={style} onValueChange={(value) => setStyle(value as CitationStyle)}>
                    <SelectTrigger id="review-citation-style" className="mt-1 h-8 text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {styleOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {citationStyleLabels[option]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="mt-3 space-y-2">
                    {sources.length === 0 ? (
                      <p className="text-[10.5px] text-muted-foreground">Link papers to generate citations.</p>
                    ) : (
                      sources.slice(0, 4).map((paper) => (
                        <div key={paper.id} className="rounded border border-border/70 bg-card p-2">
                          <p className="font-serif text-[10px] leading-relaxed text-foreground/75">
                            {generateCitation(paper, style)}
                          </p>
                          <div className="mt-1.5 flex items-center gap-1">
                            <button
                              onClick={() => void copyText(generateCitation(paper, style), "Reference")}
                              className="flex items-center gap-1 rounded border border-border px-1.5 py-0.5 font-mono text-[8px] text-muted-foreground hover:border-primary/30 hover:text-primary"
                            >
                              <Clipboard className="size-2.5" /> Copy
                            </button>
                            {missingMetadata(paper).length > 0 && (
                              <Badge variant="warning" className="h-4 px-1 text-[7.5px]">
                                Incomplete metadata
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => void copyBibliography()}>
                    <Quote /> Copy full bibliography
                  </Button>
                </TabsContent>
              </div>

              <div className="border-t border-border p-2.5">
                <Button variant="subtle" size="sm" className="w-full" onClick={openSources}>
                  <Sparkles /> Link more sources
                </Button>
              </div>
            </Tabs>
          </aside>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground/60">
        <span>Draft review · autosave saves to your account</span>
        <span>{outline.length} sections · {completedSections} substantially drafted</span>
      </div>

      <Dialog open={sourcesOpen} onOpenChange={setSourcesOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Manage review sources</DialogTitle>
            <DialogDescription>
              Link library papers and research notes to this review. Sections can then reference them individually.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <section>
              <h3 className="flex items-center gap-1.5 meta-label">
                <Paperclip className="size-3" /> Papers · {draftPaperIds.length}
              </h3>
              <div className="mt-1.5 max-h-56 space-y-1 overflow-y-auto rounded border border-border p-1.5">
                {library.map((entry) => {
                  const paper = papersById[entry.paperId];
                  if (!paper) return null;
                  const checked = draftPaperIds.includes(paper.id);
                  return (
                    <label
                      key={paper.id}
                      className="flex cursor-pointer items-start gap-2 rounded px-1 py-1 text-[10.5px] leading-snug hover:bg-secondary/50"
                    >
                      <Checkbox
                        checked={checked}
                        className="mt-0.5"
                        onCheckedChange={(value) =>
                          setDraftPaperIds((current) =>
                            value ? [...current, paper.id] : current.filter((id) => id !== paper.id)
                          )
                        }
                      />
                      <span className="line-clamp-2">{paper.title}</span>
                    </label>
                  );
                })}
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-1.5 meta-label">
                <NotebookPen className="size-3" /> Notes · {draftNoteIds.length}
              </h3>
              <div className="mt-1.5 max-h-56 space-y-1 overflow-y-auto rounded border border-border p-1.5">
                {notes.map((note) => {
                  const checked = draftNoteIds.includes(note.id);
                  return (
                    <label
                      key={note.id}
                      className="flex cursor-pointer items-start gap-2 rounded px-1 py-1 text-[10.5px] leading-snug hover:bg-secondary/50"
                    >
                      <Checkbox
                        checked={checked}
                        className="mt-0.5"
                        onCheckedChange={(value) =>
                          setDraftNoteIds((current) =>
                            value ? [...current, note.id] : current.filter((id) => id !== note.id)
                          )
                        }
                      />
                      <span className="line-clamp-2">{note.title}</span>
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="flex items-center gap-2 rounded border border-dashed border-border bg-surface/40 px-3 py-2 text-[10px] text-muted-foreground">
            <SearchX className="size-3.5 shrink-0" />
            Adding a source here does not import it into each section automatically. Use the section outline to write
            with it in view.
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSourcesOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSources}>
              <Check /> Save sources
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="sr-only">
        Literature review workspace for {review.title}, updated {formatDate(review.updatedAt)}.
      </p>
    </div>
  );
}
