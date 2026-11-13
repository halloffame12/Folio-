"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookMarked,
  Bookmark,
  ChevronDown,
  LayoutGrid,
  LibraryBig,
  List,
  MoreHorizontal,
  SearchX,
  Table2,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/states";
import { TagEditor } from "@/features/library/tag-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { papersById, allTags } from "@/lib/client-registry";
import { readingStatusConfig, readingStatuses } from "@/lib/labels";
import { formatDate, relativeTime, cn } from "@/lib/utils";
import type { LibraryEntry, Paper, ReadingStatus } from "@/types";

type Row = {
  entry: LibraryEntry;
  paper: Paper;
  collectionNames: string[];
};

export default function LibraryPage() {
  const router = useRouter();
  const library = useWorkspaceStore((s) => s.data.library);
  const collections = useWorkspaceStore((s) => s.data.collections);
  const updateReadingStatus = useWorkspaceStore((s) => s.updateReadingStatus);
  const removePaper = useWorkspaceStore((s) => s.removePaper);
  const savePaper = useWorkspaceStore((s) => s.savePaper);
  const addPaperToCollection = useWorkspaceStore((s) => s.addPaperToCollection);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ReadingStatus | "all">("all");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [view, setView] = useState<"table" | "list">("table");
  const [sort, setSort] = useState("added-desc");
  const [selected, setSelected] = useState<string[]>([]);

  const rows: Row[] = useMemo(
    () =>
      library
        .map((entry) => {
          const paper = papersById[entry.paperId];
          if (!paper) return null;
          return {
            entry,
            paper,
            collectionNames: collections
              .filter((collection) => collection.paperIds.includes(paper.id))
              .map((collection) => collection.name),
          };
        })
        .filter((row): row is Row => Boolean(row)),
    [library, collections]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = rows.filter((row) => {
      if (status !== "all" && row.entry.status !== status) return false;
      if (collectionFilter !== "all") {
        const collection = collections.find((c) => c.id === collectionFilter);
        if (!collection?.paperIds.includes(row.paper.id)) return false;
      }
      if (tagFilter !== "all" && !row.entry.tags.includes(tagFilter)) return false;
      if (!q) return true;
      return [
        row.paper.title,
        row.paper.abstract,
        row.paper.authors.map((a) => a.name).join(" "),
        row.entry.tags.join(" "),
        row.paper.venue,
        row.paper.doi,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });

    if (view === "list") {
      result = [...result].sort((a, b) => {
        switch (sort) {
          case "added-asc":
            return new Date(a.entry.addedAt).getTime() - new Date(b.entry.addedAt).getTime();
          case "title":
            return a.paper.title.localeCompare(b.paper.title);
          case "year":
            return b.paper.year - a.paper.year;
          case "citations":
            return b.paper.citationCount - a.paper.citationCount;
          default:
            return new Date(b.entry.addedAt).getTime() - new Date(a.entry.addedAt).getTime();
        }
      });
    }
    return result;
  }, [rows, query, status, collectionFilter, tagFilter, collections, view, sort]);

  const selectedSet = new Set(selected);
  const allVisibleSelected = filtered.length > 0 && filtered.every((row) => selectedSet.has(row.paper.id));
  const someVisibleSelected = filtered.some((row) => selectedSet.has(row.paper.id));

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelected(Array.from(new Set([...selected, ...filtered.map((r) => r.paper.id)])));
    } else {
      setSelected(selected.filter((id) => !filtered.some((row) => row.paper.id === id)));
    }
  };

  const toggleRow = (paperId: string) => {
    setSelected((current) =>
      current.includes(paperId)
        ? current.filter((id) => id !== paperId)
        : [...current, paperId]
    );
  };

  const changeStatus = (paperId: string, next: ReadingStatus) => {
    updateReadingStatus(paperId, next);
    toast.success(`Marked as ${readingStatusConfig[next].label.toLowerCase()}`);
  };

  const remove = async (paperId: string) => {
    const paper = papersById[paperId];
    await removePaper(paperId);
    setSelected((current) => current.filter((id) => id !== paperId));
    toast("Removed from library", {
      description: paper?.venueShort,
      action: {
        label: "Undo",
        onClick: () => void savePaper(paperId),
      },
    });
  };

  const bulkStatus = (next: ReadingStatus) => {
    selected.forEach((id) => updateReadingStatus(id, next));
    toast.success(`${selected.length} papers marked as ${readingStatusConfig[next].label.toLowerCase()}`);
    setSelected([]);
  };

  const bulkAddToCollection = async (collectionId: string) => {
    const collection = collections.find((c) => c.id === collectionId);
    await Promise.all(selected.map((id) => addPaperToCollection(collectionId, id)));
    toast.success(`${selected.length} papers added to ${collection?.name}`);
    setSelected([]);
  };

  const bulkRemove = async () => {
    const count = selected.length;
    await Promise.all(selected.map((id) => removePaper(id)));
    toast(`${count} papers removed from library`);
    setSelected([]);
  };

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        id: "select",
        size: 34,
        header: () => (
          <Checkbox
            checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
            onCheckedChange={(checked) => toggleAll(checked === true)}
            aria-label="Select all papers"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedSet.has(row.original.paper.id)}
            onCheckedChange={() => toggleRow(row.original.paper.id)}
            aria-label={`Select ${row.original.paper.title}`}
          />
        ),
        enableSorting: false,
      },
      {
        id: "title",
        header: "Paper",
        size: 460,
        accessorFn: (row) => row.paper.title,
        cell: ({ row }) => {
          const { paper, entry } = row.original;
          return (
            <div className="min-w-[280px] max-w-[520px] py-0.5">
              <Link
                href={`/discover/${paper.id}`}
                className="paper-title block text-[13.5px] leading-snug transition-colors hover:text-primary"
              >
                {paper.title}
              </Link>
              <p className="mt-1 truncate text-[10.5px] text-muted-foreground">
                {paper.authors.map((a) => a.name).join(", ")} · {paper.year} ·{" "}
                <span className="font-mono text-[9px]">{paper.venueShort}</span>
              </p>
              {entry.status === "reading" && (entry.readingProgress ?? 0) > 0 && (
                <div className="mt-1.5 flex max-w-[160px] items-center gap-2">
                  <Progress value={entry.readingProgress} className="h-[3px]" />
                  <span className="font-mono text-[8.5px] text-muted-foreground">
                    {entry.readingProgress}%
                  </span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        size: 116,
        accessorFn: (row) => row.entry.status,
        cell: ({ row }) => {
          const { paper, entry } = row.original;
          const config = readingStatusConfig[entry.status];
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center gap-1.5 rounded border border-border bg-card px-1.5 py-1 text-[10px] transition-colors hover:border-foreground/20"
                  aria-label={`Reading status for ${paper.title}: ${config.label}`}
                >
                  <span className={cn("size-1.5 rounded-full", config.dot)} />
                  {config.label}
                  <ChevronDown className="size-2.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuLabel>Reading status</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={entry.status}
                  onValueChange={(value) => changeStatus(paper.id, value as ReadingStatus)}
                >
                  {readingStatuses.map((s) => (
                    <DropdownMenuRadioItem key={s} value={s}>
                      {readingStatusConfig[s].label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
      {
        id: "tags",
        header: "Tags",
        size: 160,
        enableSorting: false,
        cell: ({ row }) => (
          <TagEditor paperId={row.original.paper.id} tags={row.original.entry.tags} compact />
        ),
      },
      {
        id: "collections",
        header: "Collections",
        size: 150,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex max-w-[150px] flex-wrap gap-1">
            {row.original.collectionNames.slice(0, 1).map((name) => (
              <Badge key={name} variant="outline" className="max-w-[130px] truncate normal-case tracking-normal">
                {name}
              </Badge>
            ))}
            {row.original.collectionNames.length > 1 && (
              <span className="font-mono text-[9px] text-muted-foreground">
                +{row.original.collectionNames.length - 1}
              </span>
            )}
            {row.original.collectionNames.length === 0 && (
              <span className="text-[10px] text-muted-foreground/50">—</span>
            )}
          </div>
        ),
      },
      {
        id: "added",
        header: "Added",
        size: 94,
        accessorFn: (row) => new Date(row.entry.addedAt).getTime(),
        cell: ({ row }) => (
          <span className="font-mono text-[9.5px] text-muted-foreground">
            {formatDate(row.original.entry.addedAt, { month: "short", day: "numeric", year: "2-digit" })}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        size: 40,
        enableSorting: false,
        cell: ({ row }) => {
          const { paper } = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${paper.title}`}
                  className="text-muted-foreground"
                >
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => router.push(`/discover/${paper.id}`)}>
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/citations?paper=${paper.id}`}>Cite paper</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/notes?new=1&paper=${paper.id}`}>Add note</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => void remove(paper.id)}
                >
                  <Trash2 className="text-destructive" /> Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, allVisibleSelected, someVisibleSelected, filtered, collections]
  );

  const clearFilters = () => {
    setQuery("");
    setStatus("all");
    setCollectionFilter("all");
    setTagFilter("all");
    setSort("added-desc");
  };

  const hasFilters = Boolean(query) || status !== "all" || collectionFilter !== "all" || tagFilter !== "all";

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Personal collection"
        title="My Library"
        description="A working catalogue of the scholarship you have saved. Track reading, tag ideas, and file papers into collections."
        actions={
          <Button asChild size="sm">
            <Link href="/discover">
              <Bookmark /> Find papers
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex flex-wrap items-center gap-4">
          {(["all", ...readingStatuses] as const).map((item) => {
            const count =
              item === "all" ? rows.length : rows.filter((r) => r.entry.status === item).length;
            return (
              <button
                key={item}
                onClick={() => setStatus(item)}
                className={cn(
                  "relative flex items-baseline gap-1.5 pb-2 text-[11.5px] transition-colors",
                  status === item ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="font-medium">
                  {item === "all" ? "All papers" : readingStatusConfig[item].label}
                </span>
                <span className="font-mono text-[9px] tabular-nums text-muted-foreground">{count}</span>
                {status === item && (
                  <span className="absolute inset-x-0 -bottom-[9px] h-[2px] bg-primary" />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1 pb-1">
          <Button
            variant={view === "table" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setView("table")}
            aria-label="Table view"
            aria-pressed={view === "table"}
          >
            <Table2 className="size-3.5" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setView("list")}
            aria-label="List view"
            aria-pressed={view === "list"}
          >
            <List className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="mb-4 grid gap-2 lg:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(0,160px))]">
        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
          placeholder="Search title, author, tag, DOI…"
          aria-label="Search library"
        />
        <Select value={collectionFilter} onValueChange={setCollectionFilter}>
          <SelectTrigger aria-label="Filter by collection">
            <SelectValue placeholder="All collections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All collections</SelectItem>
            {collections.map((collection) => (
              <SelectItem key={collection.id} value={collection.id}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger aria-label="Filter by tag">
            <SelectValue placeholder="All tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger aria-label="Sort library">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="added-desc">Recently added</SelectItem>
            <SelectItem value="added-asc">Oldest added</SelectItem>
            <SelectItem value="title">Title A–Z</SelectItem>
            <SelectItem value="year">Newest published</SelectItem>
            <SelectItem value="citations">Most cited</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(hasFilters || selected.length > 0) && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {hasFilters && (
            <>
              <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                {filtered.length} of {rows.length} shown
              </span>
              <Button variant="ghost" size="xs" onClick={clearFilters}>
                <X /> Clear filters
              </Button>
            </>
          )}
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState
          icon={LibraryBig}
          title="Your library is empty"
          description="Save papers from discovery to build your personal research catalogue. Saved papers can be tagged, tracked, and filed into collections."
          action={
            <Button asChild>
              <Link href="/discover">
                Discover papers <ArrowRight />
              </Link>
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No papers match these filters"
          description="Try a different reading status, tag, or collection. Your library still contains all saved papers."
          action={<Button onClick={clearFilters}>Clear filters</Button>}
        />
      ) : view === "table" ? (
        <>
          <div className="hidden overflow-hidden rounded-md border border-border bg-card shadow-xs md:block">
            <DataTable
              columns={columns}
              data={filtered}
              getRowId={(row) => row.paper.id}
              onRowClick={(row) => router.push(`/discover/${row.paper.id}`)}
              initialSorting={[{ id: "added", desc: true }]}
              compact
            />
          </div>
          {/* Mobile simplified list */}
          <div className="divide-y divide-border rounded-md border border-border bg-card md:hidden">
            {filtered.map((row) => (
              <div key={row.paper.id} className="flex gap-3 p-3.5">
                <Checkbox
                  checked={selectedSet.has(row.paper.id)}
                  onCheckedChange={() => toggleRow(row.paper.id)}
                  aria-label={`Select ${row.paper.title}`}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <Link href={`/discover/${row.paper.id}`} className="paper-title block text-[14px] leading-snug">
                    {row.paper.title}
                  </Link>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {row.paper.authors[0]?.name} · {row.paper.year} · {row.paper.venueShort}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant={readingStatusConfig[row.entry.status].badge}
                      className="normal-case tracking-normal"
                    >
                      {readingStatusConfig[row.entry.status].label}
                    </Badge>
                    {row.entry.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="normal-case tracking-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Paper actions">
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => router.push(`/discover/${row.paper.id}`)}>
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => void remove(row.paper.id)} className="text-destructive">
                      <Trash2 /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <div className="hidden grid-cols-[34px_minmax(0,1fr)_120px_150px_100px] gap-3 border-b border-border bg-surface/40 px-3 py-2 sm:grid">
            <span />
            <span className="meta-label">Paper</span>
            <span className="meta-label">Status</span>
            <span className="meta-label">Tags</span>
            <span className="meta-label">Added</span>
          </div>
          <div className="divide-y divide-border/70">
            {filtered.map((row) => (
              <div key={row.paper.id} className="grid gap-3 px-3 py-3.5 sm:grid-cols-[34px_minmax(0,1fr)_120px_150px_100px] sm:items-start">
                <Checkbox
                  checked={selectedSet.has(row.paper.id)}
                  onCheckedChange={() => toggleRow(row.paper.id)}
                  aria-label={`Select ${row.paper.title}`}
                  className="mt-1 hidden sm:block"
                />
                <div className="min-w-0">
                  <Link href={`/discover/${row.paper.id}`} className="paper-title block text-[14px] hover:text-primary">
                    {row.paper.title}
                  </Link>
                  <p className="mt-1 text-[10.5px] text-muted-foreground">
                    {row.paper.authors.map((a) => a.name).join(", ")} · {row.paper.year}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1 sm:hidden">
                    <Badge variant={readingStatusConfig[row.entry.status].badge} className="normal-case tracking-normal">
                      {readingStatusConfig[row.entry.status].label}
                    </Badge>
                    {row.entry.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="normal-case tracking-normal">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="inline-flex items-center gap-1.5 rounded border border-border px-1.5 py-1 text-[10px]">
                        <span className={cn("size-1.5 rounded-full", readingStatusConfig[row.entry.status].dot)} />
                        {readingStatusConfig[row.entry.status].label}
                        <ChevronDown className="size-2.5 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuRadioGroup
                        value={row.entry.status}
                        onValueChange={(value) => changeStatus(row.paper.id, value as ReadingStatus)}
                      >
                        {readingStatuses.map((s) => (
                          <DropdownMenuRadioItem key={s} value={s}>
                            {readingStatusConfig[s].label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="hidden sm:block">
                  <TagEditor paperId={row.paper.id} tags={row.entry.tags} compact />
                </div>
                <div className="hidden font-mono text-[9.5px] text-muted-foreground sm:block">
                  {relativeTime(row.entry.addedAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="fixed bottom-5 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-md border border-border bg-card p-2 shadow-float lg:left-[calc(50%+124px)]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              {selected.length} selected
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="xs">
                  <BookMarked /> Status <ChevronDown className="size-2.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {readingStatuses.map((s) => (
                  <DropdownMenuItem key={s} onSelect={() => bulkStatus(s)}>
                    {readingStatusConfig[s].label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="xs">
                  <LayoutGrid /> Add to collection <ChevronDown className="size-2.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {collections.map((collection) => (
                  <DropdownMenuItem key={collection.id} onSelect={() => void bulkAddToCollection(collection.id)}>
                    {collection.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="xs" className="text-destructive hover:text-destructive" onClick={() => void bulkRemove()}>
              <Trash2 /> Remove
            </Button>
            <Button variant="ghost" size="xs" className="ml-auto" onClick={() => setSelected([])}>
              <X /> Clear
            </Button>
          </div>
        </div>
      )}

      <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60">
        {filtered.length} records shown · {rows.length} saved · library
      </p>
    </div>
  );
}
