"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { papersById } from "@/lib/client-registry";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchInput } from "@/components/shared/search-input";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/shared/states";

export function AddPapersDialog({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}) {
  const library = useWorkspaceStore((s) => s.data.library);
  const updateProject = useWorkspaceStore((s) => s.updateProject);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected([]);
    }
  }, [open]);

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return library
      .map((entry) => papersById[entry.paperId])
      .filter((paper) => paper && !project.paperIds.includes(paper.id))
      .filter((paper) =>
        q
          ? `${paper.title} ${paper.authors.map((a) => a.name).join(" ")} ${paper.keywords.join(" ")}`
              .toLowerCase()
              .includes(q)
          : true
      );
  }, [library, project.paperIds, query]);

  const save = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      await updateProject(project.id, { paperIds: [...project.paperIds, ...selected] });
      toast.success(`${selected.length} paper${selected.length === 1 ? "" : "s"} added to the project`);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add papers to this project</DialogTitle>
          <DialogDescription>
            Choose from papers already saved in your library. Papers not in the library can be saved first from
            Discover.
          </DialogDescription>
        </DialogHeader>

        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
          placeholder="Search your library…"
          aria-label="Search library papers"
        />

        <div className="max-h-[320px] overflow-y-auto rounded border border-border">
          {candidates.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No available papers"
              description={
                query
                  ? "No saved paper matches that search."
                  : "Every saved paper is already linked, or your library is empty."
              }
              compact
            />
          ) : (
            <ul className="divide-y divide-border/60">
              {candidates.map((paper) => {
                const checked = selected.includes(paper.id);
                return (
                  <li key={paper.id}>
                    <label className="flex cursor-pointer items-start gap-2.5 px-3 py-2 transition-colors hover:bg-secondary/30">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          setSelected((current) =>
                            value ? [...current, paper.id] : current.filter((id) => id !== paper.id)
                          )
                        }
                        className="mt-0.5"
                      />
                      <span className="min-w-0">
                        <span className="block text-[12px] font-medium leading-snug">{paper.title}</span>
                        <span className="mt-0.5 block font-mono text-[9px] text-muted-foreground">
                          {paper.authors[0]?.name ?? "Unknown"} · {paper.year} · {paper.venueShort}
                        </span>
                        <span className="mt-1 line-clamp-2 block text-[10.5px] leading-relaxed text-muted-foreground">
                          {paper.abstract}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <span className="self-center font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
            {selected.length} selected
          </span>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={selected.length === 0 || saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Plus />}
              Add {selected.length > 0 ? selected.length : ""} paper{selected.length === 1 ? "" : "s"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
