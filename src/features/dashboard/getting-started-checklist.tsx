"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Compass,
  FilePlus2,
  FlaskConical,
  FolderPlus,
  Quote,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  done: boolean;
  href: string;
  actionText: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function GettingStartedChecklist({
  hasGapAnalysis = false,
  hasCitation = false,
  onOpenNewProject,
  onOpenNewNote,
}: {
  hasGapAnalysis?: boolean;
  hasCitation?: boolean;
  onOpenNewProject?: () => void;
  onOpenNewNote?: () => void;
}) {
  const data = useWorkspaceStore((s) => s.data);
  const settings = useWorkspaceStore((s) => s.settings);
  const updateSettings = useWorkspaceStore((s) => s.updateSettings);

  const [dismissedLocally, setDismissedLocally] = useState(false);

  const isDismissed = settings.onboardingDismissed || dismissedLocally;

  const items: ChecklistItem[] = [
    {
      id: "save-paper",
      label: "Search & save your first paper",
      description: "Explore Crossref and OpenAlex to seed your library.",
      done: data.library.length > 0,
      href: "/discover",
      actionText: "Search papers",
      icon: Compass,
    },
    {
      id: "create-project",
      label: "Create a project or collection",
      description: "Organize publications, deadlines, and collaborators.",
      done: data.projects.length > 0 || data.collections.length > 0,
      href: "/projects",
      actionText: "New project",
      icon: FolderPlus,
    },
    {
      id: "write-note",
      label: "Write your first literature note",
      description: "Capture reading memos and methodology notes.",
      done: data.notes.length > 0,
      href: "/notes",
      actionText: "Write note",
      icon: FilePlus2,
    },
    {
      id: "gap-analysis",
      label: "Run a research gap analysis",
      description: "Discover underrepresented keywords and emerging questions.",
      done: hasGapAnalysis,
      href: "/research-gaps",
      actionText: "Analyze gaps",
      icon: FlaskConical,
    },
    {
      id: "generate-citation",
      label: "Generate a formatted citation",
      description: "Output reference standards in APA, MLA, IEEE, or Chicago.",
      done: hasCitation,
      href: "/citations",
      actionText: "Open citations",
      icon: Quote,
    },
  ];

  const completedCount = items.filter((i) => i.done).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);
  const allComplete = completedCount === items.length;

  if (isDismissed) return null;

  const handleDismiss = () => {
    setDismissedLocally(true);
    updateSettings({ onboardingDismissed: true });
  };

  return (
    <section
      aria-label="Getting started with your research workspace"
      className="mb-6 rounded-md border border-border/80 bg-card p-4 sm:p-5 shadow-2xs"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-[3px] bg-primary/10 text-primary">
              <Sparkles className="size-3" />
            </span>
            <h2 className="text-[13px] font-medium text-foreground">Getting Started with Folio</h2>
            <span className="font-mono text-[11px] text-muted-foreground">
              {completedCount} of {items.length} completed
            </span>
          </div>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            {allComplete
              ? "All onboarding milestones completed! Your academic command center is primed."
              : "Complete these foundational steps to activate your workspace."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss getting started checklist"
          className="rounded p-1 text-muted-foreground/60 transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-3">
        <Progress value={progressPercent} className="h-1.5" />
      </div>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={cn(
                "group relative flex flex-col justify-between rounded border p-3 transition-colors",
                item.done
                  ? "border-border/50 bg-secondary/20 text-muted-foreground"
                  : "border-border bg-card hover:border-primary/30 hover:bg-secondary/35"
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Icon className={cn("size-3.5 mt-0.5", item.done ? "text-success" : "text-muted-foreground")} />
                  {item.done ? (
                    <CheckCircle2 className="size-3.5 text-success shrink-0" />
                  ) : (
                    <Circle className="size-3.5 text-muted-foreground/35 shrink-0" />
                  )}
                </div>
                <h3 className={cn("mt-2 text-[12px] font-medium leading-snug", item.done && "line-through text-muted-foreground/80")}>
                  {item.label}
                </h3>
                <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-border/40">
                {item.done ? (
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-success flex items-center gap-1">
                    <CheckCircle2 className="size-2.5" /> Done
                  </span>
                ) : item.id === "create-project" && onOpenNewProject ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={onOpenNewProject}
                    className="h-6 px-1.5 text-[11px] font-medium text-primary hover:text-primary"
                  >
                    {item.actionText} →
                  </Button>
                ) : item.id === "write-note" && onOpenNewNote ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={onOpenNewNote}
                    className="h-6 px-1.5 text-[11px] font-medium text-primary hover:text-primary"
                  >
                    {item.actionText} →
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant="ghost"
                    size="xs"
                    className="h-6 px-1.5 text-[11px] font-medium text-primary hover:text-primary"
                  >
                    <Link href={item.href}>{item.actionText} →</Link>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
