"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  BookMarked,
  FileText,
  FolderPlus,
  MoreHorizontal,
  Pencil,
  Plus,
  SearchX,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/states";
import { CollectionFormDialog } from "@/features/collections/collection-form-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { papers, papersById } from "@/lib/client-registry";
import { readingStatusConfig } from "@/lib/labels";
import { relativeTime, cn } from "@/lib/utils";
import type { Collection, Paper } from "@/types";

const accentClass: Record<Collection["color"], string> = {
  forest: "bg-primary",
  terracotta: "bg-accent",
  sand: "bg-warning",
  sage: "bg-success",
  ink: "bg-foreground/70",
};

export default function CollectionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const collections = useWorkspaceStore((s) => s.data.collections);
  const library = useWorkspaceStore((s) => s.data.library);
  const addPaperToCollection = useWorkspaceStore((s) => s.addPaperToCollection);
  const removePaperFromCollection = useWorkspaceStore((s) => s.removePaperFromCollection);
  const deleteCollection = useWorkspaceStore((s) => s.deleteCollection);

  const collection = collections.find((c) => c.id === params.id);

  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addQuery, setAddQuery] = useState("");
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const savedIds = useMemo(() => new Set(library.map((entry) => entry.paperId)), [library]);
  const collectionPapers = useMemo(
    () =>
      (collection?.paperIds ?? [])
        .map((id) => papersById[id])
        .filter((paper): paper is Paper => Boolean(paper)),
    [collection]
  );

  const filteredPapers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return collectionPapers;
    return collectionPapers.filter((paper) =>
      `${paper.title} ${paper.authors.map((a) => a.name).join(" ")} ${paper.venue} ${paper.keywords.join(" ")}`
        .toLowerCase()
        .includes(q)
    );
  }, [collectionPapers, query]);

  const candidates = useMemo(() => {
    const q = addQuery.trim().toLowerCase();
    return papers
      .filter((paper) => !collection?.paperIds.includes(paper.id))
      .filter((paper) =>
        q
          ? `${paper.title} ${paper.authors.map((a) => a.name).join(" ")} ${paper.year} ${paper.venue}`
              .toLowerCase()
              .includes(q)
          : true
      )
      .sort((a, b) => Number(savedIds.has(b.id)) - Number(savedIds.has(a.id)));
  }, [addQuery, collection, savedIds]);

  if (!collection) {
    return (
      <div>
        <PageHeader
          eyebrow="Collections"
          title="Collection not found"
          description="This collection may have been deleted."
          backHref="/collections"
          backLabel="Back to collections"
        />
        <EmptyState
          icon={BookMarked}
          title="No collection with that identifier"
          description="Return to collections to browse your curated reading lists."
          action={<Button asChild><Link href="/collections">All collections</Link></Button>}
        />
      </div>
    );
  }

  const handleAdd = async () => {
    if (selectedToAdd.length === 0) return;
    setAdding(true);
    try {
      await Promise.all(
        selectedToAdd.map((id) => addPaperToCollection(collection.id, id))
      );
      toast.success(`${selectedToAdd.length} papers added`, {
        description: `Filed into ${collection.name}.`,
      });
      setSelectedToAdd([]);
      setAddOpen(false);
      setAddQuery("");
    } finally {
      setAdding(false);
    }
  };

  const remove = (paperId: string) => {
    removePaperFromCollection(collection.id, paperId);
    toast("Removed from collection", {
      description: "The paper remains in your library.",
      action: {
        label: "Undo",
        onClick: () => void addPaperToCollection(collection.id, paperId),
      },
    });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteCollection(collection.id);
      toast("Collection deleted", { description: collection.name });
      router.push("/collections");
    } finally {
      setDeleting(false);
    }
  };

  const statusCounts = collectionPapers.reduce(
    (acc, paper) => {
      const entry = library.find((item) => item.paperId === paper.id);
      if (entry) acc[entry.status] += 1;
      return acc;
    },
    { unread: 0, reading: 0, completed: 0 } as Record<string, number>
  );

  return (
    <div>
      <PageHeader
        backHref="/collections"
        backLabel="All collections"
        eyebrow="Collection"
        title={collection.name}
        description={collection.description || "No description yet."}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil /> Edit
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus /> Add papers
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Collection actions">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                  <Pencil /> Edit collection
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/collections">
                    <BookMarked /> All collections
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => setDeleteOpen(true)}
                >
                  <Trash2 className="text-destructive" /> Delete collection
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <div className={cn("h-[3px] w-full rounded-full", accentClass[collection.color])} />

      <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-md border border-border bg-card sm:grid-cols-4">
        {[
          { label: "Papers", value: collectionPapers.length },
          { label: "Unread", value: statusCounts.unread },
          { label: "Reading", value: statusCounts.reading },
          { label: "Completed", value: statusCounts.completed },
        ].map((metric, index) => (
          <div key={metric.label} className={cn("px-4 py-3", index > 0 && "border-l border-border", index === 2 && "border-l-0 border-t sm:border-l sm:border-t-0")}>
            <p className="meta-label">{metric.label}</p>
            <p className="mt-1 font-display text-[20px] font-semibold leading-none tabular-nums">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
          placeholder="Search within this collection…"
          aria-label="Search within collection"
          wrapperClassName="w-full sm:max-w-sm"
        />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
            Updated {relativeTime(collection.updatedAt)}
          </span>
        </div>
      </div>

      {collectionPapers.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={FolderPlus}
            title="This collection is empty"
            description="Add papers from your library or search results. Papers can belong to more than one collection."
            action={
              <Button onClick={() => setAddOpen(true)}>
                <Plus /> Add papers
              </Button>
            }
          />
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={SearchX}
            title="No papers in this collection match"
            description="Try a different title, author, or keyword."
            action={<Button variant="outline" onClick={() => setQuery("")}>Clear search</Button>}
          />
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-md border border-border bg-card">
          <div className="hidden grid-cols-[minmax(0,1fr)_120px_120px_40px] gap-4 border-b border-border bg-surface/40 px-4 py-2 md:grid">
            <span className="meta-label">Paper</span>
            <span className="meta-label">Reading</span>
            <span className="meta-label">Tags</span>
            <span />
          </div>
          <div className="divide-y divide-border/70">
            {filteredPapers.map((paper) => {
              const entry = library.find((item) => item.paperId === paper.id);
              return (
                <div
                  key={paper.id}
                  className="grid gap-3 px-4 py-3.5 md:grid-cols-[minmax(0,1fr)_120px_120px_40px] md:items-center md:gap-4"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/discover/${paper.id}`}
                      className="font-serif text-[14px] font-medium leading-snug transition-colors hover:text-primary"
                    >
                      {paper.title}
                    </Link>
                    <p className="mt-1 text-[10.5px] text-muted-foreground">
                      {paper.authors.map((a) => a.name).join(", ")} · {paper.year} ·{" "}
                      <span className="font-mono text-[9px]">{paper.venueShort}</span>
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 font-mono text-[9px] text-muted-foreground/70 md:hidden">
                      {entry && (
                        <Badge variant={readingStatusConfig[entry.status].badge} className="normal-case tracking-normal">
                          {readingStatusConfig[entry.status].label}
                        </Badge>
                      )}
                      {entry?.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="normal-case tracking-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="hidden md:block">
                    {entry ? (
                      <Badge variant={readingStatusConfig[entry.status].badge} className="normal-case tracking-normal">
                        {readingStatusConfig[entry.status].label}
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Not saved</span>
                    )}
                  </div>
                  <div className="hidden flex-wrap gap-1 md:flex">
                    {entry?.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="normal-case tracking-normal">
                        {tag}
                      </Badge>
                    ))}
                    {!entry?.tags.length && <span className="text-[10px] text-muted-foreground/50">—</span>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="justify-self-end text-muted-foreground hover:text-destructive"
                    onClick={() => remove(paper.id)}
                    aria-label={`Remove ${paper.title} from collection`}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-border bg-surface/30 px-4 py-2.5">
            <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
              {filteredPapers.length} of {collectionPapers.length} papers
            </span>
            <Button variant="ghost" size="xs" onClick={() => setAddOpen(true)}>
              <Plus /> Add more
            </Button>
          </div>
        </div>
      )}

      <p className="mt-4 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60">
        <FileText className="size-3" /> Created {relativeTime(collection.createdAt)} · collection
      </p>

      {/* Add papers dialog */}
      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) {
            setSelectedToAdd([]);
            setAddQuery("");
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add papers to “{collection.name}”</DialogTitle>
            <DialogDescription>
              Choose from your library or current search results. Papers not yet saved will be added
              to your library automatically.
            </DialogDescription>
          </DialogHeader>
          <SearchInput
            value={addQuery}
            onChange={(event) => setAddQuery(event.target.value)}
            onClear={() => setAddQuery("")}
            placeholder="Search by title, author, or venue…"
            aria-label="Search papers to add"
          />
          <div className="max-h-[340px] overflow-y-auto rounded border border-border">
            {candidates.length === 0 ? (
              <p className="px-4 py-8 text-center text-[11.5px] text-muted-foreground">
                No more papers match this search.
              </p>
            ) : (
              <ul className="divide-y divide-border/70">
                {candidates.map((paper) => (
                  <li key={paper.id}>
                    <label className="flex cursor-pointer items-start gap-2.5 px-3 py-2.5 transition-colors hover:bg-secondary/40">
                      <Checkbox
                        checked={selectedToAdd.includes(paper.id)}
                        onCheckedChange={(checked) =>
                          setSelectedToAdd((current) =>
                            checked
                              ? [...current, paper.id]
                              : current.filter((id) => id !== paper.id)
                          )
                        }
                        aria-label={`Select ${paper.title}`}
                        className="mt-0.5"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="paper-title block text-[13px] leading-snug">{paper.title}</span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                          {paper.authors[0]?.name} · {paper.year} · {paper.venueShort}
                          <span className="text-border">/</span>
                          {savedIds.has(paper.id) ? (
                            <span className="text-success">In library</span>
                          ) : (
                            <span className="text-warning">Will be saved</span>
                          )}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DialogFooter>
            <span className="mr-auto self-center font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              {selectedToAdd.length} selected
            </span>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={adding}>
              Cancel
            </Button>
            <Button onClick={() => void handleAdd()} disabled={selectedToAdd.length === 0 || adding}>
              {adding ? "Adding…" : `Add ${selectedToAdd.length || ""} paper${selectedToAdd.length === 1 ? "" : "s"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CollectionFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={collection}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{collection.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The collection and its filing structure will be removed. All {collectionPapers.length}{" "}
              papers remain in your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete collection"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
