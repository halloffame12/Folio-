"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BookMarked,
  FolderPlus,
  MoreHorizontal,
  Pencil,
  SearchX,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/states";
import { CollectionFormDialog } from "@/features/collections/collection-form-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { papersById } from "@/lib/client-registry";
import { formatDate, relativeTime, cn } from "@/lib/utils";
import type { Collection } from "@/types";

const accentClass: Record<Collection["color"], string> = {
  forest: "bg-primary",
  terracotta: "bg-accent",
  sand: "bg-warning",
  sage: "bg-success",
  ink: "bg-foreground/70",
};

export default function CollectionsPage() {
  const router = useRouter();
  const collections = useWorkspaceStore((s) => s.data.collections);
  const library = useWorkspaceStore((s) => s.data.library);
  const deleteCollection = useWorkspaceStore((s) => s.deleteCollection);

  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Collection | undefined>();
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("new=1")) {
      setCreateOpen(true);
      window.history.replaceState(null, "", "/collections");
    }
  }, []);

  const totalFiled = collections.reduce((acc, c) => acc + c.paperIds.length, 0);
  const filedIds = new Set(collections.flatMap((c) => c.paperIds));
  const inLibrary = library.filter((entry) => papersById[entry.paperId]).length;
  const unfiled = inLibrary - library.filter((entry) => filedIds.has(entry.paperId)).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return collections;
    return collections.filter((collection) => {
      const paperText = collection.paperIds
        .map((id) => papersById[id]?.title ?? "")
        .join(" ");
      return `${collection.name} ${collection.description} ${paperText}`.toLowerCase().includes(q);
    });
  }, [collections, query]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCollection(deleteTarget.id);
      toast("Collection deleted", { description: deleteTarget.name });
      setDeleteTarget(undefined);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Curated reading"
        title="Collections"
        description="Group saved papers around a theme, a literature review, or a question you are working through."
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <FolderPlus /> New collection
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 overflow-hidden rounded-md border border-border bg-card sm:grid-cols-3">
        {[
          { label: "Collections", value: collections.length, sub: "curated groupings" },
          { label: "Filed papers", value: totalFiled, sub: "collection memberships" },
          { label: "Unfiled", value: unfiled, sub: "in library, not in a collection" },
        ].map((metric, index) => (
          <div
            key={metric.label}
            className={cn(
              "px-4 py-3.5",
              index > 0 && "border-l border-border",
              index === 2 && "col-span-2 border-l-0 border-t sm:col-span-1 sm:border-l sm:border-t-0"
            )}
          >
            <p className="meta-label">{metric.label}</p>
            <p className="mt-1.5 font-display text-[22px] font-semibold leading-none tabular-nums">
              {metric.value}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">{metric.sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
          placeholder="Search collections or their papers…"
          aria-label="Search collections"
          wrapperClassName="w-full sm:max-w-sm"
        />
        <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
          {filtered.length} of {collections.length} shown
        </span>
      </div>

      {collections.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No collections yet"
          description="Create a collection to group papers around a research theme. You can add papers from your library or directly from discovery."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <FolderPlus /> Create your first collection
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No collections match that search"
          description="Search by collection name, description, or the title of a paper inside it."
          action={<Button variant="outline" onClick={() => setQuery("")}>Clear search</Button>}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((collection) => {
            const papers = collection.paperIds
              .map((id) => papersById[id])
              .filter(Boolean)
              .slice(0, 3);
            return (
              <article
                key={collection.id}
                className="group flex flex-col overflow-hidden rounded-md border border-border bg-card shadow-xs transition-colors hover:border-foreground/20"
              >
                <div className={cn("h-[3px] w-full", accentClass[collection.color])} />
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/collections/${collection.id}`} className="min-w-0">
                      <h2 className="font-display text-[15px] font-semibold leading-snug tracking-[-0.015em] transition-colors group-hover:text-primary">
                        {collection.name}
                      </h2>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0 text-muted-foreground"
                          aria-label={`Actions for ${collection.name}`}
                        >
                          <MoreHorizontal className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/collections/${collection.id}`}>
                            <ArrowUpRight /> Open collection
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setEditing(collection)}>
                          <Pencil /> Edit details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => setDeleteTarget(collection)}
                        >
                          <Trash2 className="text-destructive" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="mt-1.5 line-clamp-2 min-h-[32px] text-[11.5px] leading-relaxed text-muted-foreground">
                    {collection.description || "No description yet."}
                  </p>

                  <div className="mt-3 flex-1 space-y-1.5 border-t border-border/70 pt-3">
                    {papers.length === 0 ? (
                      <p className="text-[10.5px] italic text-muted-foreground/70">
                        No papers filed yet.
                      </p>
                    ) : (
                      papers.map((paper) => (
                        <Link
                          key={paper.id}
                          href={`/discover/${paper.id}`}
                          className="flex items-start gap-2 text-[10.5px] leading-snug text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-border" />
                          <span className="line-clamp-1 font-serif text-[11.5px] text-foreground/80">
                            {paper.title}
                          </span>
                        </Link>
                      ))
                    )}
                    {collection.paperIds.length > 3 && (
                      <p className="pl-3 font-mono text-[9px] text-muted-foreground">
                        +{collection.paperIds.length - 3} more
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-2.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{collection.paperIds.length} papers</Badge>
                      <span className="font-mono text-[9px] text-muted-foreground/70">
                        {relativeTime(collection.updatedAt)}
                      </span>
                    </div>
                    <Link
                      href={`/collections/${collection.id}`}
                      className="inline-flex items-center gap-1 text-[10.5px] font-medium text-primary hover:underline"
                    >
                      Open <ArrowUpRight className="size-3" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}

          <button
            onClick={() => setCreateOpen(true)}
            className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-card/30 p-6 text-muted-foreground transition-colors hover:border-primary/30 hover:bg-card hover:text-primary"
          >
            <FolderPlus className="size-5" />
            <span className="text-[11.5px] font-medium">New collection</span>
            <span className="max-w-[180px] text-center text-[10px] text-muted-foreground">
              Start a new line of reading
            </span>
          </button>
        </div>
      )}

      <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60">
        Collections are stored locally · Last updated{" "}
        {collections[0] ? formatDate(collections[0].updatedAt) : "—"}
      </p>

      <CollectionFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(collection) => router.push(`/collections/${collection.id}`)}
      />
      <CollectionFormDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(undefined)}
        collection={editing}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleteTarget?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The collection will be removed. Papers inside it will stay in your library and can be
              filed elsewhere. This action cannot be undone.
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
