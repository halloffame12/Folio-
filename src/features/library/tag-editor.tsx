"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { allTags } from "@/lib/client-registry";
import { cn } from "@/lib/utils";

export function TagEditor({
  paperId,
  tags,
  className,
  compact = false,
}: {
  paperId: string;
  tags: string[];
  className?: string;
  compact?: boolean;
}) {
  const togglePaperTag = useWorkspaceStore((s) => s.togglePaperTag);

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {tags.slice(0, compact ? 2 : 6).map((tag) => (
        <Badge key={tag} variant="outline" className="normal-case tracking-normal">
          {tag}
        </Badge>
      ))}
      {compact && tags.length > 2 && (
        <span className="font-mono text-[9px] text-muted-foreground">+{tags.length - 2}</span>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-5 rounded text-muted-foreground/60"
            aria-label="Edit tags"
          >
            <Plus className="size-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-2">
          <p className="px-1 pb-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
            Tags
          </p>
          <div className="max-h-56 space-y-0.5 overflow-y-auto">
            {allTags.map((tag) => (
              <label
                key={tag}
                className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-[11.5px] hover:bg-secondary"
              >
                <Checkbox
                  checked={tags.includes(tag)}
                  onCheckedChange={() => togglePaperTag(paperId, tag)}
                  aria-label={`Toggle tag ${tag}`}
                />
                <span className="truncate">{tag}</span>
              </label>
            ))}
          </div>
          <p className="mt-1.5 border-t border-border px-1 pt-1.5 text-[9.5px] leading-relaxed text-muted-foreground">
            Tag changes save to this demonstration library.
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
