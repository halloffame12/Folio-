"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { TaskBoard } from "@/features/tasks/task-board";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Badge } from "@/components/ui/badge";

export default function TasksPage() {
  const projects = useWorkspaceStore((s) => s.data.projects);
  const tasks = useWorkspaceStore((s) => s.data.tasks);

  const [projectId, setProjectId] = useState<string | undefined>();
  const [taskId, setTaskId] = useState<string | undefined>();

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const project = search.get("project");
    const task = search.get("task");
    if (project && projects.some((p) => p.id === project)) setProjectId(project);
    if (task && tasks.some((t) => t.id === task)) setTaskId(task);
    // Initialise once from the URL; later navigation within the board is local.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scopedProject = projectId ? projects.find((p) => p.id === projectId) : undefined;
  const openCount = tasks.filter((task) => task.status !== "completed").length;

  return (
    <div>
      <PageHeader
        eyebrow="Management"
        title="Tasks"
        description="Move research forward in small, visible units. Drag cards between columns, or switch to a list for a denser view."
        actions={
          <Badge variant="outline" className="h-7 px-2.5 normal-case tracking-normal">
            {openCount} open · {tasks.length} total
          </Badge>
        }
      />

      {scopedProject && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded border border-border bg-surface/40 px-3 py-2 text-[11px]">
          <span className="text-muted-foreground">Project view:</span>
          <Link href={`/projects/${scopedProject.id}`} className="font-medium text-primary hover:underline">
            {scopedProject.title}
          </Link>
          <Button asChild variant="ghost" size="xs" className="ml-auto text-muted-foreground">
            <Link href="/tasks">
              <X /> All tasks
            </Link>
          </Button>
        </div>
      )}

      <TaskBoard projectId={projectId} initialTaskId={taskId} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground/60">
        <span>Board changes are saved to your workspace</span>
        <Link href="/milestones" className="flex items-center gap-1 hover:text-primary">
          <ArrowLeft className="size-2.5 rotate-180" /> View milestones
        </Link>
      </div>
    </div>
  );
}
