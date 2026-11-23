"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { apiMutate } from "@/lib/api-client";
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
import type { Paper, PublicationType } from "@/types";

export function ManualPaperDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (paper: Paper) => void;
}) {
  const savePaper = useWorkspaceStore((s) => s.savePaper);

  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [venue, setVenue] = useState("");
  const [doi, setDoi] = useState("");
  const [publicationType, setPublicationType] = useState<PublicationType>("journal");
  const [abstract, setAbstract] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a publication title.");
      return;
    }

    setSubmitting(true);
    try {
      const authorList = authors
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
        .map((name) => ({ name }));

      const paper = await apiMutate<Paper>("/api/papers", "POST", {
        title: title.trim(),
        authors: authorList.length ? authorList : [{ name: "Unknown Author" }],
        year: year ? parseInt(year, 10) : undefined,
        venue: venue.trim() || undefined,
        venueShort: venue.trim().slice(0, 24) || undefined,
        publicationType,
        doi: doi.trim() || undefined,
        abstract: abstract.trim() || undefined,
      });

      // Save to library
      await savePaper(paper.id);

      toast.success("Paper added", { description: "The publication has been saved to your research library." });
      setTitle("");
      setAuthors("");
      setVenue("");
      setDoi("");
      setAbstract("");
      onOpenChange(false);
      if (onCreated) onCreated(paper);
    } catch (err: any) {
      toast.error(err?.message || "Failed to add publication.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Publication Manually</DialogTitle>
          <DialogDescription>
            Enter details for a thesis, working paper, or unindexed publication.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <div className="space-y-1">
            <Label htmlFor="manual-paper-title" className="text-[12px]">Title *</Label>
            <Input
              id="manual-paper-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Constitutional AI: Harmlessness from AI Feedback"
              className="h-9 text-[12.5px]"
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="manual-paper-authors" className="text-[12px]">Authors (comma separated)</Label>
            <Input
              id="manual-paper-authors"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="e.g. Y. Bai, S. Kadavath, S. Kundu"
              className="h-9 text-[12.5px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="manual-paper-year" className="text-[12px]">Year</Label>
              <Input
                id="manual-paper-year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-9 text-[12.5px]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="manual-paper-type" className="text-[12px]">Publication Type</Label>
              <Select value={publicationType} onValueChange={(v) => setPublicationType(v as PublicationType)}>
                <SelectTrigger id="manual-paper-type" className="h-9 text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="journal" className="text-[12px]">Journal Article</SelectItem>
                  <SelectItem value="conference" className="text-[12px]">Conference Paper</SelectItem>
                  <SelectItem value="preprint" className="text-[12px]">Preprint / Working Paper</SelectItem>
                  <SelectItem value="book-chapter" className="text-[12px]">Book Chapter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="manual-paper-venue" className="text-[12px]">Journal / Conference</Label>
              <Input
                id="manual-paper-venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. NeurIPS, arXiv"
                className="h-9 text-[12.5px]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="manual-paper-doi" className="text-[12px]">DOI (optional)</Label>
              <Input
                id="manual-paper-doi"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                placeholder="10.xxxx/..."
                className="h-9 text-[12.5px]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="manual-paper-abstract" className="text-[12px]">Abstract (optional)</Label>
            <Textarea
              id="manual-paper-abstract"
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Brief summary or abstract..."
              rows={3}
              className="text-[12px] resize-none"
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
              Add to Library
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
