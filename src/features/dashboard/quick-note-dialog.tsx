"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Note } from "@/types";

export function QuickNoteDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (note: Note) => void;
}) {
  const projects = useWorkspaceStore((s) => s.data.projects);
  const createNote = useWorkspaceStore((s) => s.createNote);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState<string>("none");
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a note title.");
      return;
    }

    setSubmitting(true);
    try {
      const tags = tagInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const note = await createNote({
        title: title.trim(),
        content: content.trim(),
        tags,
        paperIds: [],
        projectId: projectId === "none" ? undefined : projectId,
      });

      toast.success("Note created", { description: "Your research note is saved to the workspace." });
      setTitle("");
      setContent("");
      setTagInput("");
      setProjectId("none");
      onOpenChange(false);
      if (onCreated) onCreated(note);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create note.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Research Note</DialogTitle>
          <DialogDescription>
            Capture reading observations, hypotheses, or methodology insights.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="quick-note-title" className="text-[12px]">Title *</Label>
            <Input
              id="quick-note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Synthesis on transformer attention mechanisms"
              className="h-9 text-[13px]"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quick-note-project" className="text-[12px]">Assign to Project (optional)</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger id="quick-note-project" className="h-9 text-[12.5px]">
                <SelectValue placeholder="No project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-[12.5px]">No project (General)</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-[12.5px]">
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quick-note-tags" className="text-[12px]">Tags (comma separated)</Label>
            <Input
              id="quick-note-tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. literature-review, methodology, preliminary"
              className="h-9 text-[12.5px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quick-note-content" className="text-[12px]">Content / Memo</Label>
            <Textarea
              id="quick-note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your notes or memo here..."
              rows={4}
              className="text-[12.5px] leading-relaxed resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting || !title.trim()}>
              {submitting ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
              Save Note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
