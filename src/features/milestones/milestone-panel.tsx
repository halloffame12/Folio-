"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  LayoutList,
  Milestone as MilestoneIcon,
  Plus,
  SearchX,
  Waypoints,
} from "lucide-react";
import { toast } from "sonner";
import type { Milestone, MilestoneStatus } from "@/types";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { usersById } from "@/lib/client-registry";
import { milestoneStatusConfig } from "@/lib/labels";
import { daysUntil, formatDate, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/states";
import { AvatarGroup } from "@/components/shared/member-avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MilestoneDialog } from "@/features/milestones/milestone-dialog";

const all = "all";
const statuses: MilestoneStatus[] = ["upcoming", "in-progress", "at-risk", "completed"];

export function MilestonePanel({
  projectId,
  compact = false,
  initialMilestoneId,
}: {
  projectId?: string;
  compact?: boolean;
  initialMilestoneId?: string;
}) {
  const milestones = useWorkspaceStore((s) => s.data.milestones);
  const tasks = useWorkspaceStore((s) => s.data.tasks);
  const projects = useWorkspaceStore((s) => s.data.projects);
  const updateMilestone = useWorkspaceStore((s) => s.updateMilestone);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MilestoneStatus | "all">("all");
  const [projectFilter, setProjectFilter] = useState(projectId ?? all);
  const [view, setView] = useState<"list" | "timeline">("list");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Milestone | undefined>();

  useEffect(() => {
    if (projectId) setProjectFilter(projectId);
  }, [projectId]);

  useEffect(() => {
    if (!initialMilestoneId) return;
    const target = milestones.find((m) => m.id === initialMilestoneId);
    if (target) {
      setEditing(target);
      setDialogOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMilestoneId]);

  const scope = useMemo(
    () => (projectId ? milestones.filter((m) => m.projectId === projectId) : milestones),
    [milestones, projectId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scope
      .filter((milestone) => {
        if (projectFilter !== all && milestone.projectId !== projectFilter) return false;
        if (statusFilter !== all && milestone.status !== statusFilter) return false;
        if (!q) return true;
        return `${milestone.title} ${milestone.description}`.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [scope, projectFilter, statusFilter, query]);

  const atRisk = scope.filter((m) => m.status === "at-risk");
  const upcoming = scope.filter(
    (m) => m.status !== "completed" && daysUntil(m.dueDate) >= 0 && daysUntil(m.dueDate) <= 30
  );
  const completed = scope.filter((m) => m.status === "completed");

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (milestone: Milestone) => {
    setEditing(milestone);
    setDialogOpen(true);
  };

  const markComplete = async (milestone: Milestone) => {
    await updateMilestone(milestone.id, { status: "completed", progress: 100 });
    toast.success("Milestone completed", { description: milestone.title });
  };

  const years = useMemo(() => {
    const map = new Map<string, Milestone[]>();
    filtered.forEach((milestone) => {
      const key = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
        new Date(milestone.dueDate)
      );
      map.set(key, [...(map.get(key) ?? []), milestone]);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div>
      {!compact && (
        <div className="mb-4 grid gap-2 sm:grid-cols-4">
          <Metric label="Milestones" value={scope.length} hint="Across the programme" />
          <Metric label="At risk" value={atRisk.length} hint={atRisk.length ? "Needs a decision" : "All clear"} tone="text-destructive" />
          <Metric label="Due in 30 days" value={upcoming.length} hint="Horizon" tone="text-warning" />
          <Metric label="Completed" value={completed.length} hint="Recorded" tone="text-success" />
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
          placeholder="Search milestones…"
          aria-label="Search milestones"
          wrapperClassName="w-full sm:w-[220px]"
        />
        {!projectId && (
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[190px]" aria-label="Filter milestones by project">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={all}>All projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as MilestoneStatus | "all")}
        >
          <SelectTrigger className="w-[150px]" aria-label="Filter milestones by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={all}>All statuses</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {milestoneStatusConfig[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center rounded border border-border bg-card p-0.5" role="group" aria-label="Milestone view">
            <button
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              aria-label="List view"
              className={cn(
                "flex size-7 items-center justify-center rounded-[3px]",
                view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutList className="size-3.5" />
            </button>
            <button
              onClick={() => setView("timeline")}
              aria-pressed={view === "timeline"}
              aria-label="Timeline view"
              className={cn(
                "flex size-7 items-center justify-center rounded-[3px]",
                view === "timeline" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Waypoints className="size-3.5" />
            </button>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus /> {compact ? "Milestone" : "New milestone"}
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={query || statusFilter !== all ? SearchX : MilestoneIcon}
          title="No milestones match this view"
          description="Milestones give the project a horizon. Create a checkpoint, then link tasks to it."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setStatusFilter("all");
                setProjectFilter(projectId ?? all);
              }}
            >
              Clear filters
            </Button>
          }
          secondaryAction={
            <Button onClick={openCreate}>
              <Plus /> New milestone
            </Button>
          }
        />
      ) : view === "list" ? (
        <div className="divide-y divide-border rounded border border-border bg-card">
          {filtered.map((milestone) => {
            const project = projects.find((p) => p.id === milestone.projectId);
            const linkedTasks = tasks.filter((task) => task.milestoneId === milestone.id);
            const assignees = milestone.assigneeIds
              .map((id) => usersById[id])
              .filter(Boolean)
              .map((user) => ({ id: user!.id, name: user!.name }));
            const dueDays = daysUntil(milestone.dueDate);
            const config = milestoneStatusConfig[milestone.status];
            return (
              <article
                key={milestone.id}
                className="group grid gap-3 px-3 py-3 transition-colors hover:bg-secondary/25 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:px-4"
              >
                <div className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-0.5">
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                    {formatDate(milestone.dueDate, { month: "short" })}
                  </span>
                  <span className="font-display text-[18px] font-semibold leading-none tabular-nums">
                    {new Date(milestone.dueDate).getDate()}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[8.5px] uppercase",
                      milestone.status === "completed"
                        ? "text-success"
                        : dueDays < 0
                          ? "text-destructive"
                          : dueDays <= 7
                            ? "text-warning"
                            : "text-muted-foreground"
                    )}
                  >
                    {milestone.status === "completed"
                      ? "Delivered"
                      : dueDays < 0
                        ? `${Math.abs(dueDays)}d overdue`
                        : dueDays === 0
                          ? "Today"
                          : `in ${dueDays}d`}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={config.badge}>{config.label}</Badge>
                    {project && (
                      <Link
                        href={`/projects/${project.id}?tab=milestones`}
                        className="font-mono text-[8.5px] uppercase tracking-[0.06em] text-muted-foreground hover:text-primary"
                      >
                        {project.tag}
                      </Link>
                    )}
                  </div>
                  <button onClick={() => openEdit(milestone)} className="mt-1 block text-left">
                    <h3 className="font-display text-[13.5px] font-semibold leading-snug transition-colors hover:text-primary">
                      {milestone.title}
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-[11px] leading-relaxed text-muted-foreground">
                      {milestone.description}
                    </p>
                  </button>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Progress
                        value={milestone.progress}
                        className="h-1 w-16"
                        indicatorClassName={cn(
                          milestone.status === "completed" && "bg-success",
                          milestone.status === "at-risk" && "bg-destructive"
                        )}
                      />
                      <span className="font-mono text-[9px] tabular-nums text-muted-foreground">
                        {milestone.progress}%
                      </span>
                    </div>
                    {linkedTasks.length > 0 && (
                      <span className="font-mono text-[9px] text-muted-foreground">
                        {linkedTasks.length} linked task{linkedTasks.length === 1 ? "" : "s"}
                      </span>
                    )}
                    {assignees.length > 0 && <AvatarGroup users={assignees} max={3} size="size-5" />}
                    {milestone.status !== "completed" && (
                      <button
                        onClick={() => void markComplete(milestone)}
                        className="flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground opacity-0 transition-opacity hover:text-success focus:opacity-100 group-hover:opacity-100"
                      >
                        <CheckCircle2 className="size-3" /> Mark complete
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(milestone)}>
                    Edit
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {years.map(([label, group]) => (
            <section key={label} aria-label={label}>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{label}</h3>
                <span className="h-px flex-1 bg-border" />
                <span className="font-mono text-[9px] text-muted-foreground/60">{group.length}</span>
              </div>
              <div className="relative space-y-2 border-l border-border pl-4">
                {group.map((milestone) => {
                  const config = milestoneStatusConfig[milestone.status];
                  const project = projects.find((p) => p.id === milestone.projectId);
                  return (
                    <article key={milestone.id} className="relative rounded border border-border bg-card p-3">
                      <span
                        className={cn(
                          "absolute -left-[21px] top-4 size-2 rounded-full border-2 border-background",
                          milestone.status === "at-risk"
                            ? "bg-destructive"
                            : milestone.status === "completed"
                              ? "bg-success"
                              : milestone.status === "in-progress"
                                ? "bg-warning"
                                : "bg-muted-foreground/50"
                        )}
                        aria-hidden
                      />
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant={config.badge}>{config.label}</Badge>
                            <span className="flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground">
                              <CalendarDays className="size-2.5" />
                              {formatDate(milestone.dueDate, { month: "short", day: "numeric" })}
                            </span>
                          </div>
                          <button onClick={() => openEdit(milestone)} className="mt-1 text-left">
                            <h3 className="font-display text-[13px] font-semibold hover:text-primary">
                              {milestone.title}
                            </h3>
                          </button>
                          {project && (
                            <p className="mt-0.5 font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground">
                              {project.title}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={milestone.progress} className="h-1 w-14" />
                          <span className="font-mono text-[9px] text-muted-foreground">{milestone.progress}%</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground/60">
        {filtered.length} milestone{filtered.length === 1 ? "" : "s"} · linked tasks update progress on the task board
      </p>

      <MilestoneDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        milestone={editing}
        projectId={projectId}
      />
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  tone?: string;
}) {
  return (
    <div className="rounded border border-border bg-card px-3 py-2.5">
      <p className="meta-label">{label}</p>
      <div className="mt-1 flex items-baseline justify-between">
        <span className={cn("font-display text-[20px] font-semibold leading-none tabular-nums", tone)}>{value}</span>
        <span className="font-mono text-[9px] text-muted-foreground">{hint}</span>
      </div>
    </div>
  );
}
