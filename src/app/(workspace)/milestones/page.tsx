"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { MilestonePanel } from "@/features/milestones/milestone-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceStore } from "@/stores/workspace-store";

export default function MilestonesPage() {
  const projects = useWorkspaceStore((s) => s.data.projects);
  const milestones = useWorkspaceStore((s) => s.data.milestones);

  const [projectId, setProjectId] = useState<string | undefined>();
  const [milestoneId, setMilestoneId] = useState<string | undefined>();

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const project = search.get("project");
    const milestone = search.get("milestone");
    if (project && projects.some((p) => p.id === project)) setProjectId(project);
    if (milestone && milestones.some((m) => m.id === milestone)) setMilestoneId(milestone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scopedProject = projectId ? projects.find((p) => p.id === projectId) : undefined;
  const atRisk = milestones.filter((milestone) => milestone.status === "at-risk").length;

  return (
    <div>
      <PageHeader
        eyebrow="Management"
        title="Milestones"
        description="Checkpoints that make progress legible. Each milestone can gather linked tasks, contributors, and a target date."
        actions={
          <Badge
            variant={atRisk > 0 ? "warning" : "outline"}
            className="h-7 px-2.5 normal-case tracking-normal"
          >
            {atRisk > 0 ? `${atRisk} at risk` : "Nothing at risk"} · {milestones.length} total
          </Badge>
        }
      />

      {scopedProject && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded border border-border bg-surface/40 px-3 py-2 text-[11px]">
          <span className="text-muted-foreground">Project view:</span>
          <Link href={`/projects/${scopedProject.id}?tab=milestones`} className="font-medium text-primary hover:underline">
            {scopedProject.title}
          </Link>
          <Button asChild variant="ghost" size="xs" className="ml-auto text-muted-foreground">
            <Link href="/milestones">
              <X /> All milestones
            </Link>
          </Button>
        </div>
      )}

      <MilestonePanel projectId={projectId} initialMilestoneId={milestoneId} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground/60">
        <span>Timeline derives from milestone dates · all data is fictional</span>
        <Link href="/tasks" className="hover:text-primary">
          Open task board →
        </Link>
      </div>
    </div>
  );
}
