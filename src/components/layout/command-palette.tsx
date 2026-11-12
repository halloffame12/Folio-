"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookMarked, Compass, FileText, FolderKanban, NotebookPen, Plus, Search } from "lucide-react";
import { Command } from "cmdk";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { buildSearchIndex, type SearchResult } from "@/lib/mock-services";
import { papers } from "@/lib/client-registry";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const groupOrder: SearchResult["group"][] = [
  "Pages",
  "Papers",
  "Projects",
  "Notes",
  "Collections",
];

const groupIcons = {
  Pages: Compass,
  Papers: FileText,
  Projects: FolderKanban,
  Notes: NotebookPen,
  Collections: BookMarked,
} as const;

const quickActions = [
  { id: "new-note", label: "Create a research note", href: "/notes?new=1", icon: NotebookPen },
  { id: "new-project", label: "Create a research project", href: "/projects?new=1", icon: FolderKanban },
  { id: "new-collection", label: "Create a collection", href: "/collections?new=1", icon: BookMarked },
  { id: "new-citation", label: "Generate a citation", href: "/citations", icon: FileText },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const router = useRouter();
  const projects = useWorkspaceStore((s) => s.data.projects);
  const notes = useWorkspaceStore((s) => s.data.notes);
  const collections = useWorkspaceStore((s) => s.data.collections);

  const results = useMemo(
    () =>
      buildSearchIndex({
        projects,
        notes,
        collections,
        papers,
      }),
    [projects, notes, collections, papers]
  );

  const grouped = useMemo(() => {
    return groupOrder.map((group) => ({
      group,
      items: results.filter((result) => result.group === group),
    }));
  }, [results]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="max-w-[600px] gap-0 overflow-hidden p-0 sm:max-w-[600px]"
      >
        <DialogTitle className="sr-only">Search and commands</DialogTitle>
        <DialogDescription className="sr-only">
          Search papers, notes, collections, projects, or navigate to a page.
        </DialogDescription>
        <Command
          loop
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-muted-foreground"
          onKeyDown={(event) => {
            if (event.key === "Escape") onOpenChange(false);
          }}
        >
          <div className="flex items-center gap-2.5 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <Command.Input
              autoFocus
              placeholder="Search papers, projects, notes, or jump to…"
              className="h-12 w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/80 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-[min(460px,60vh)] overflow-y-auto p-2">
            <Command.Empty className="px-4 py-10 text-center text-[12.5px] text-muted-foreground">
              No results. Try a paper title, author, or DOI.
            </Command.Empty>

            <Command.Group heading="Quick actions">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Command.Item
                    key={action.id}
                    value={`action ${action.label}`}
                    onSelect={() => go(action.href)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded px-2 py-2 text-[12.5px] text-foreground outline-none",
                      "data-[selected=true]:bg-secondary"
                    )}
                  >
                    <span className="flex size-6 items-center justify-center rounded-[3px] border border-border bg-card">
                      <Icon className="size-3.5 text-muted-foreground" />
                    </span>
                    {action.label}
                    <Plus className="ml-auto size-3 text-muted-foreground/50" />
                  </Command.Item>
                );
              })}
            </Command.Group>

            {grouped.map(({ group, items }) => {
              if (items.length === 0) return null;
              const Icon = groupIcons[group];
              return (
                <Command.Group key={group} heading={group}>
                  {items.map((item) => (
                    <Command.Item
                      key={item.id}
                      value={`${group} ${item.title} ${item.subtitle}`}
                      onSelect={() => go(item.href)}
                      className="flex cursor-pointer items-start gap-2.5 rounded px-2 py-2 outline-none data-[selected=true]:bg-secondary"
                    >
                      <span className="mt-0.5 flex size-6 items-center justify-center rounded-[3px] border border-border bg-card">
                        <Icon className="size-3.5 text-muted-foreground" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-medium">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block truncate text-[10.5px] text-muted-foreground">
                          {item.subtitle}
                        </span>
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              );
            })}
          </Command.List>
          <div className="flex items-center gap-4 border-t border-border bg-surface/50 px-4 py-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-card px-1 py-[1px] font-mono text-[9px]">↑</kbd>
              <kbd className="rounded border border-border bg-card px-1 py-[1px] font-mono text-[9px]">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-card px-1 py-[1px] font-mono text-[9px]">↵</kbd>
              to open
            </span>
            <span className="ml-auto font-mono tracking-wide">FOLIO / SEARCH</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
