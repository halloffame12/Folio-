"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Loader2,
  Maximize2,
  Minimize2,
  NotebookPen,
  Pin,
  PinOff,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/states";
import { RichTextEditor } from "@/features/notes/rich-text-editor";
import { LinkedPapers } from "@/features/notes/linked-papers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { papersById } from "@/lib/client-registry";
import { formatDate, relativeTime, stripHtml, wordCount, readingMinutes, cn } from "@/lib/utils";
import type { Note } from "@/types";

export default function NotesPage() {
  const notes = useWorkspaceStore((s) => s.data.notes);
  const projects = useWorkspaceStore((s) => s.data.projects);
  const createNote = useWorkspaceStore((s) => s.createNote);
  const updateNote = useWorkspaceStore((s) => s.updateNote);
  const deleteNote = useWorkspaceStore((s) => s.deleteNote);
  const toggleNotePin = useWorkspaceStore((s) => s.toggleNotePin);

  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [view, setView] = useState<"list" | "editor">("list");
  const [focusMode, setFocusMode] = useState(false);
  const [query, setQuery] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [creating, setCreating] = useState(false);

  const saveTimer = useRef<number | null>(null);
  const pending = useRef<Partial<Note>>({});
  const initialised = useRef(false);
  const creatingRef = useRef(false);

  const sortedNotes = useMemo(
    () =>
      [...notes].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }),
    [notes]
  );

  const selectedNote = notes.find((note) => note.id === selectedId);

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedNotes;
    return sortedNotes.filter((note) =>
      `${note.title} ${stripHtml(note.content)} ${note.tags.join(" ")}`
        .toLowerCase()
        .includes(q)
    );
  }, [sortedNotes, query]);

  const project = selectedNote?.projectId
    ? projects.find((p) => p.id === selectedNote.projectId)
    : undefined;

  useEffect(() => {
    if (!selectedNote) return;
    setDraftTitle(selectedNote.title);
    setDraftContent(selectedNote.content);
    setSaveState("saved");
    // Only reset drafts when the selected note changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const flush = (noteId?: string) => {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (noteId && Object.keys(pending.current).length > 0) {
      updateNote(noteId, pending.current);
      setLastSaved(new Date());
    }
    pending.current = {};
    setSaveState("saved");
  };

  const scheduleSave = (patch: Partial<Note>) => {
    if (!selectedNote) return;
    pending.current = { ...pending.current, ...patch };
    setSaveState("saving");
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      updateNote(selectedNote.id, pending.current);
      pending.current = {};
      setSaveState("saved");
      setLastSaved(new Date());
    }, 650);
  };

  const selectNote = (id: string) => {
    if (id === selectedId) {
      setView("editor");
      return;
    }
    flush(selectedNote?.id);
    setSelectedId(id);
    setView("editor");
  };

  const createNew = async (paperId?: string | null, projectId?: string | null) => {
    if (creatingRef.current) return;
    creatingRef.current = true;
    setCreating(true);
    try {
      const paper = paperId ? papersById[paperId] : undefined;
      const created = await createNote({
        title: paper ? `Reading memo — ${paper.title.slice(0, 64)}` : "Untitled note",
        content: "",
        tags: paper ? ["reading-notes"] : [],
        paperIds: paper ? [paper.id] : [],
        projectId: projectId ?? undefined,
      });
      setSelectedId(created.id);
      setView("editor");
      setQuery("");
      toast.success("Note created", { description: "Start writing — changes save automatically." });
    } finally {
      creatingRef.current = false;
      setCreating(false);
    }
  };

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const search = new URLSearchParams(window.location.search);
    const noteParam = search.get("note");
    const isNew = search.get("new") === "1";
    const paperParam = search.get("paper");
    const projectParam = search.get("project");

    if (isNew) {
      void createNew(paperParam, projectParam);
      window.history.replaceState(null, "", "/notes");
    } else if (noteParam && notes.some((note) => note.id === noteParam)) {
      setSelectedId(noteParam);
      setView("editor");
    } else if (sortedNotes[0]) {
      setSelectedId(sortedNotes[0].id);
    }
    // Runs once on mount; store methods are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        flush(selectedId);
        toast.success("Note saved");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const addTag = () => {
    if (!selectedNote) return;
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag) return;
    if (!selectedNote.tags.includes(tag)) {
      updateNote(selectedNote.id, { tags: [...selectedNote.tags, tag] });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    if (!selectedNote) return;
    updateNote(selectedNote.id, { tags: selectedNote.tags.filter((t) => t !== tag) });
  };

  const confirmDelete = async () => {
    if (!selectedNote) return;
    setDeleting(true);
    try {
      flush(selectedNote.id);
      const remaining = sortedNotes.filter((note) => note.id !== selectedNote.id);
      await deleteNote(selectedNote.id);
      setSelectedId(remaining[0]?.id);
      setView(remaining[0] ? "editor" : "list");
      setDeleteOpen(false);
      toast("Note deleted", { description: selectedNote.title });
    } finally {
      setDeleting(false);
    }
  };

  const words = wordCount(draftContent);

  return (
    <div>
      <PageHeader
        eyebrow="Writing & reading"
        title="Research notes"
        description="A quiet place to think on paper. Notes autosave locally and can be linked to papers and projects."
        actions={
          <Button size="sm" onClick={() => void createNew()} disabled={creating}>
            <Plus /> {creating ? "Creating…" : "New note"}
          </Button>
        }
      />

      <div className="overflow-hidden rounded-md border border-border bg-card shadow-xs">
        <div className={cn("grid", focusMode ? "lg:grid-cols-1" : "lg:grid-cols-[310px_minmax(0,1fr)]")}>
          {/* Notes list */}
          <aside
            className={cn(
              "min-h-[560px] border-b border-border lg:min-h-[640px] lg:border-b-0 lg:border-r",
              view === "editor" && "hidden lg:block",
              focusMode && "hidden"
            )}
            aria-label="Notes list"
          >
            <div className="border-b border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <h2 className="font-display text-[13px] font-semibold">All notes</h2>
                  <span className="font-mono text-[9px] text-muted-foreground">{notes.length}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => void createNew()}
                  aria-label="Create note"
                  className="text-muted-foreground"
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
              <SearchInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onClear={() => setQuery("")}
                placeholder="Search notes…"
                aria-label="Search notes"
              />
            </div>
            <div className="max-h-[560px] divide-y divide-border/60 overflow-y-auto lg:max-h-[calc(100dvh-300px)]">
              {filteredNotes.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-[11px] text-muted-foreground">No notes match that search.</p>
                  <Button variant="link" size="sm" onClick={() => setQuery("")}>
                    Clear search
                  </Button>
                </div>
              ) : (
                filteredNotes.map((note) => {
                  const noteProject = note.projectId
                    ? projects.find((p) => p.id === note.projectId)
                    : undefined;
                  const isActive = note.id === selectedId;
                  return (
                    <button
                      key={note.id}
                      onClick={() => selectNote(note.id)}
                      className={cn(
                        "relative block w-full px-3.5 py-3 text-left transition-colors",
                        isActive ? "bg-primary/[0.055]" : "hover:bg-secondary/40"
                      )}
                    >
                      {isActive && (
                        <span className="absolute inset-y-0 left-0 w-[2px] bg-primary" aria-hidden />
                      )}
                      <div className="flex items-start gap-1.5">
                        {note.pinned && <Pin className="mt-0.5 size-2.5 shrink-0 text-accent" aria-label="Pinned" />}
                        <h3 className={cn("line-clamp-2 text-[11.5px] leading-snug", isActive ? "font-semibold text-primary" : "font-medium")}>
                          {note.title || "Untitled note"}
                        </h3>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
                        {stripHtml(note.content).slice(0, 110) || "Empty note"}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1">
                        {noteProject && (
                          <span className="inline-flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground/80">
                            <span className="size-1 rounded-full bg-accent" />
                            {noteProject.tag}
                          </span>
                        )}
                        {note.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="h-4 px-1 text-[8px] normal-case tracking-normal">
                            {tag}
                          </Badge>
                        ))}
                        <span className="ml-auto font-mono text-[8.5px] text-muted-foreground/60">
                          {relativeTime(note.updatedAt)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Editor */}
          <section
            className={cn(
              "flex min-h-[560px] min-w-0 flex-col lg:min-h-[640px]",
              view === "list" && "hidden lg:flex"
            )}
            aria-label="Note editor"
          >
            {!selectedNote ? (
              <div className="flex flex-1 items-center justify-center p-6">
                <EmptyState
                  icon={NotebookPen}
                  title="No note selected"
                  description="Choose a note from the list or start a new one."
                  action={<Button onClick={() => void createNew()}><Plus /> New note</Button>}
                />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="lg:hidden"
                    onClick={() => setView("list")}
                    aria-label="Back to notes list"
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <span className="hidden items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground sm:flex">
                    <NotebookPen className="size-3" />
                    Note
                  </span>
                  <span className="hidden text-border sm:block">/</span>
                  {selectedNote.projectId ? (
                    <Select
                      value={selectedNote.projectId ?? "none"}
                      onValueChange={(value) =>
                        updateNote(selectedNote.id, { projectId: value === "none" ? undefined : value })
                      }
                    >
                      <SelectTrigger className="h-7 w-auto max-w-[220px] gap-1 border-0 bg-transparent px-1.5 text-[10.5px] shadow-none">
                        <SelectValue placeholder="Link to project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No project</SelectItem>
                        {projects
                          .filter((p) => p.status !== "archived")
                          .map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select
                      value="none"
                      onValueChange={(value) =>
                        updateNote(selectedNote.id, { projectId: value === "none" ? undefined : value })
                      }
                    >
                      <SelectTrigger className="h-7 w-auto gap-1 border-0 bg-transparent px-1.5 text-[10.5px] text-muted-foreground shadow-none">
                        <SelectValue placeholder="Link to project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No project</SelectItem>
                        {projects
                          .filter((p) => p.status !== "archived")
                          .map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}

                  <div className="ml-auto flex items-center gap-1">
                    <span
                      className="mr-1 flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground"
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
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="hidden text-muted-foreground lg:flex"
                      onClick={() => setFocusMode((value) => !value)}
                      aria-label={focusMode ? "Exit focus mode" : "Enter focus mode"}
                      aria-pressed={focusMode}
                    >
                      {focusMode ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground"
                      onClick={() => {
                        toggleNotePin(selectedNote.id);
                        toast(selectedNote.pinned ? "Note unpinned" : "Note pinned");
                      }}
                      aria-label={selectedNote.pinned ? "Unpin note" : "Pin note"}
                    >
                      {selectedNote.pinned ? <PinOff className="size-3.5 text-accent" /> : <Pin className="size-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteOpen(true)}
                      aria-label="Delete note"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="px-5 pt-5 sm:px-8">
                    <input
                      value={draftTitle}
                      onChange={(event) => {
                        setDraftTitle(event.target.value);
                        scheduleSave({ title: event.target.value });
                      }}
                      onBlur={() => flush(selectedNote.id)}
                      placeholder="Untitled note"
                      aria-label="Note title"
                      className="w-full border-0 bg-transparent font-display text-[22px] font-semibold leading-tight tracking-[-0.025em] outline-none placeholder:text-muted-foreground/40 sm:text-[25px]"
                    />
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <LinkedPapers noteId={selectedNote.id} paperIds={selectedNote.paperIds} />
                      <span className="hidden h-3 w-px bg-border sm:block" />
                      <div className="flex flex-wrap items-center gap-1">
                        {selectedNote.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded border border-border bg-surface/60 py-0.5 pl-1.5 pr-0.5 text-[9px] text-muted-foreground"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              aria-label={`Remove tag ${tag}`}
                              className="rounded p-0.5 hover:bg-secondary hover:text-foreground"
                            >
                              <X className="size-2.5" />
                            </button>
                          </span>
                        ))}
                        <input
                          value={tagInput}
                          onChange={(event) => setTagInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              addTag();
                            }
                          }}
                          placeholder="add tag"
                          aria-label="Add tag"
                          className="h-6 w-[74px] border-0 border-b border-transparent bg-transparent px-0.5 font-mono text-[9px] outline-none placeholder:text-muted-foreground/50 focus:border-border"
                        />
                      </div>
                      {project && (
                        <Link
                          href={`/projects/${project.id}`}
                          className="ml-auto hidden items-center gap-1 font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground hover:text-primary sm:flex"
                        >
                          {project.title}
                        </Link>
                      )}
                    </div>
                  </div>

                  <RichTextEditor
                    key={selectedNote.id}
                    noteId={selectedNote.id}
                    initialContent={selectedNote.content}
                    onChange={(html) => {
                      setDraftContent(html);
                      scheduleSave({ content: html });
                    }}
                    onBlur={() => flush(selectedNote.id)}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border bg-surface/30 px-5 py-2 font-mono text-[9px] uppercase tracking-wide text-muted-foreground sm:px-8">
                  <span>{words} words</span>
                  <span>{readingMinutes(draftContent)} min read</span>
                  <span className="hidden sm:inline">Created {formatDate(selectedNote.createdAt)}</span>
                  <span className="ml-auto normal-case tracking-normal">
                    {lastSaved ? `Saved ${relativeTime(lastSaved)}` : `Updated ${relativeTime(selectedNote.updatedAt)}`}
                  </span>
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60">
          Autosave · saved to your account
        </p>
        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-wide text-muted-foreground/60">
          <span>⌘S to save</span>
          <span className="text-border">/</span>
          <span>{notes.filter((n) => n.pinned).length} pinned</span>
          <span className="text-border">/</span>
          <span>{notes.reduce((acc, n) => acc + wordCount(n.content), 0).toLocaleString()} words total</span>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              “{selectedNote?.title}” will be removed from the workspace. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Keep note</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete note"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
