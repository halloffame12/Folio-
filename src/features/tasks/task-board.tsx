"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Filter,
  Flag,
  GripVertical,
  LayoutGrid,
  List,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  SearchX,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { Task, TaskPriority, TaskStatus } from "@/types";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { usersById } from "@/lib/client-registry";
import { taskPriorityConfig, taskStatusConfig, taskStatuses } from "@/lib/labels";
import { daysUntil, formatDate, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/states";
import { MemberAvatar } from "@/components/shared/member-avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskFormDialog } from "@/features/tasks/task-form-dialog";
import { TaskDetailDialog } from "@/features/tasks/task-detail-dialog";

const all = "all";

const priorityOrder: Record<TaskPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export function TaskBoard({
  projectId,
  compact = false,
  initialTaskId,
}: {
  projectId?: string;
  compact?: boolean;
  initialTaskId?: string;
}) {
  const tasks = useWorkspaceStore((s) => s.data.tasks);
  const projects = useWorkspaceStore((s) => s.data.projects);
  const updateTaskStatus = useWorkspaceStore((s) => s.updateTaskStatus);
  const deleteTask = useWorkspaceStore((s) => s.deleteTask);

  const [view, setView] = useState<"board" | "list">("board");
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>(projectId ?? all);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>(all);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const [detailId, setDetailId] = useState<string | undefined>(initialTaskId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");
  const [deleteTarget, setDeleteTarget] = useState<Task | undefined>();

  useEffect(() => {
    if (initialTaskId) setDetailId(initialTaskId);
  }, [initialTaskId]);

  useEffect(() => {
    if (projectId) setProjectFilter(projectId);
  }, [projectId]);

  const scopeTasks = useMemo(
    () => (projectId ? tasks.filter((t) => t.projectId === projectId) : tasks),
    [tasks, projectId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scopeTasks
      .filter((task) => {
        if (projectFilter !== all && task.projectId !== projectFilter) return false;
        if (priorityFilter !== all && task.priority !== priorityFilter) return false;
        if (assigneeFilter !== all && task.assigneeId !== assigneeFilter) return false;
        if (!q) return true;
        return `${task.title} ${task.description}`.toLowerCase().includes(q);
      })
      .sort(
        (a, b) =>
          priorityOrder[a.priority] - priorityOrder[b.priority] ||
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
  }, [scopeTasks, projectFilter, priorityFilter, assigneeFilter, query]);

  const assignees = useMemo(() => {
    const ids = new Set(scopeTasks.map((t) => t.assigneeId));
    return Array.from(ids).map((id) => usersById[id]).filter(Boolean);
  }, [scopeTasks]);

  const openTasks = scopeTasks.filter((t) => t.status !== "completed");
  const overdue = openTasks.filter((t) => daysUntil(t.dueDate) < 0);
  const completed = scopeTasks.filter((t) => t.status === "completed");
  const completion = scopeTasks.length
    ? Math.round((completed.length / scopeTasks.length) * 100)
    : 0;

  const detailTask = tasks.find((t) => t.id === detailId);

  const openCreate = (status: TaskStatus = "todo") => {
    setEditing(undefined);
    setDefaultStatus(status);
    setFormOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setFormOpen(true);
  };

  const moveTask = async (task: Task, status: TaskStatus) => {
    if (task.status === status) return;
    await updateTaskStatus(task.id, status);
    toast.success(`Moved to ${taskStatusConfig[status].label}`, {
      description: task.title,
    });
  };

  const handleDrop = (event: React.DragEvent, status: TaskStatus) => {
    event.preventDefault();
    setDragOver(null);
    const id = event.dataTransfer.getData("text/plain");
    const task = tasks.find((t) => t.id === id);
    if (task) void moveTask(task, status);
    setDraggingId(null);
  };

  return (
    <div>
      {!compact && (
        <div className="mb-4 grid gap-2 sm:grid-cols-4">
          <SummaryCell label="Open tasks" value={openTasks.length} hint={`${scopeTasks.length} total`} />
          <SummaryCell
            label="Overdue"
            value={overdue.length}
            hint={overdue.length ? "Needs attention" : "Nothing past due"}
            tone={overdue.length ? "text-destructive" : undefined}
          />
          <SummaryCell label="Completed" value={completed.length} hint="All time" tone="text-success" />
          <div className="rounded border border-border bg-card px-3 py-2.5">
            <p className="meta-label">Completion</p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-display text-[20px] font-semibold tabular-nums leading-none">{completion}%</span>
              <span className="font-mono text-[9px] text-muted-foreground">
                {completed.length}/{scopeTasks.length}
              </span>
            </div>
            <Progress value={completion} className="mt-2 h-1" />
          </div>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
          placeholder="Search tasks…"
          aria-label="Search tasks"
          wrapperClassName="w-full sm:w-[220px]"
        />
        {!projectId && (
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[190px]" aria-label="Filter by project">
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
          value={assigneeFilter}
          onValueChange={setAssigneeFilter}
        >
          <SelectTrigger className="w-[160px]" aria-label="Filter by assignee">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={all}>All assignees</SelectItem>
            {assignees.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={priorityFilter}
          onValueChange={(value) => setPriorityFilter(value as TaskPriority | "all")}
        >
          <SelectTrigger className="w-[145px]" aria-label="Filter by priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={all}>All priorities</SelectItem>
            {(Object.keys(taskPriorityConfig) as TaskPriority[]).map((priority) => (
              <SelectItem key={priority} value={priority}>
                {taskPriorityConfig[priority].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center rounded border border-border bg-card p-0.5" role="group" aria-label="Task view">
            <button
              onClick={() => setView("board")}
              aria-pressed={view === "board"}
              className={cn(
                "flex size-7 items-center justify-center rounded-[3px] transition-colors",
                view === "board" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Board view"
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              className={cn(
                "flex size-7 items-center justify-center rounded-[3px] transition-colors",
                view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="List view"
            >
              <List className="size-3.5" />
            </button>
          </div>
          <Button size="sm" onClick={() => openCreate()}>
            <Plus /> {compact ? "Task" : "New task"}
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={query || priorityFilter !== all || assigneeFilter !== all ? SearchX : CircleDashed}
          title="No tasks match this view"
          description="Adjust the filters, or create a task for the next piece of work."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setPriorityFilter("all");
                setAssigneeFilter("all");
                setProjectFilter(projectId ?? all);
              }}
            >
              Clear filters
            </Button>
          }
          secondaryAction={<Button onClick={() => openCreate()}><Plus /> New task</Button>}
        />
      ) : view === "board" ? (
        <div className={cn("grid gap-2.5", compact ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-4")}>
          {taskStatuses.map((status) => {
            const columnTasks = filtered.filter((task) => task.status === status);
            const config = taskStatusConfig[status];
            return (
              <section
                key={status}
                aria-label={`${config.label} tasks`}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDragOver(status);
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragOver(null);
                }}
                onDrop={(event) => handleDrop(event, status)}
                className={cn(
                  "flex min-h-[260px] flex-col rounded border border-border bg-surface/35 transition-colors",
                  dragOver === status && "border-primary/45 bg-primary/[0.045]"
                )}
              >
                <header className="flex items-center justify-between gap-2 border-b border-border/70 px-2.5 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("size-1.5 rounded-full", config.dot)} aria-hidden />
                    <h3 className="font-display text-[11.5px] font-semibold">{config.label}</h3>
                    <span className="font-mono text-[9px] tabular-nums text-muted-foreground">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => openCreate(status)}
                    className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label={`Add a task to ${config.label}`}
                  >
                    <Plus className="size-3.5" />
                  </button>
                </header>

                <div className="flex flex-1 flex-col gap-1.5 p-1.5">
                  {columnTasks.map((task) => {
                    const project = projects.find((p) => p.id === task.projectId);
                    const assignee = usersById[task.assigneeId];
                    const dueDays = daysUntil(task.dueDate);
                    const overdueTask = dueDays < 0 && task.status !== "completed";
                    return (
                      <article
                        key={task.id}
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/plain", task.id);
                          event.dataTransfer.effectAllowed = "move";
                          setDraggingId(task.id);
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setDragOver(null);
                        }}
                        onClick={() => setDetailId(task.id)}
                        className={cn(
                          "group cursor-pointer rounded border border-border bg-card p-2.5 shadow-xs transition-all hover:border-foreground/25",
                          draggingId === task.id && "opacity-50"
                        )}
                      >
                        <div className="flex items-start gap-1.5">
                          <GripVertical
                            className="mt-0.5 size-3 shrink-0 text-muted-foreground/35 transition-colors group-hover:text-muted-foreground"
                            aria-hidden
                          />
                          <h4 className="flex-1 text-[11.5px] font-medium leading-snug text-foreground/90">
                            {task.title}
                          </h4>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                onClick={(event) => event.stopPropagation()}
                                className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary focus:opacity-100 group-hover:opacity-100"
                                aria-label={`Actions for ${task.title}`}
                              >
                                <MoreHorizontal className="size-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                              <DropdownMenuLabel>Move to</DropdownMenuLabel>
                              {taskStatuses
                                .filter((s) => s !== task.status)
                                .map((s) => (
                                  <DropdownMenuItem key={s} onSelect={() => void moveTask(task, s)}>
                                    <span className={cn("size-1.5 rounded-full", taskStatusConfig[s].dot)} />
                                    {taskStatusConfig[s].label}
                                  </DropdownMenuItem>
                                ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => openEdit(task)}>
                                <Pencil /> Edit task
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={() => setDeleteTarget(task)}
                              >
                                <Trash2 /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {project && (
                          <p className="mt-1.5 truncate font-mono text-[8.5px] uppercase tracking-[0.06em] text-muted-foreground">
                            {project.tag}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Badge variant={taskPriorityConfig[task.priority].badge} className="h-4 px-1 text-[8px]">
                            {taskPriorityConfig[task.priority].label}
                          </Badge>
                          {task.milestoneId && (
                            <Flag className="size-3 text-muted-foreground" aria-label="Linked to a milestone" />
                          )}
                          {task.paperIds.length > 0 && (
                            <span className="flex items-center gap-0.5 font-mono text-[8.5px] text-muted-foreground">
                              <Paperclip className="size-2.5" /> {task.paperIds.length}
                            </span>
                          )}
                          {task.comments.length > 0 && (
                            <span className="flex items-center gap-0.5 font-mono text-[8.5px] text-muted-foreground">
                              <MessageSquare className="size-2.5" /> {task.comments.length}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/60 pt-1.5">
                          <span
                            className={cn(
                              "flex items-center gap-1 font-mono text-[8.5px]",
                              overdueTask
                                ? "text-destructive"
                                : task.status === "completed"
                                  ? "text-success"
                                  : "text-muted-foreground"
                            )}
                          >
                            {task.status === "completed" ? <CheckCircle2 className="size-2.5" /> : <CalendarDays className="size-2.5" />}
                            {formatDate(task.dueDate, { month: "short", day: "numeric" })}
                          </span>
                          {assignee && (
                            <MemberAvatar user={{ id: assignee.id, name: assignee.name }} className="size-5" />
                          )}
                        </div>
                      </article>
                    );
                  })}

                  {columnTasks.length === 0 && (
                    <button
                      onClick={() => openCreate(status)}
                      className="flex flex-1 items-center justify-center rounded border border-dashed border-border/80 py-6 text-[10px] text-muted-foreground/70 transition-colors hover:border-primary/30 hover:text-primary"
                    >
                      Drop a task here
                    </button>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-border bg-card">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                {["Task", "Project", "Status", "Priority", "Assignee", "Due", ""].map((heading) => (
                  <th
                    key={heading}
                    className="px-3 py-2 font-mono text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                const assignee = usersById[task.assigneeId];
                const overdueTask = daysUntil(task.dueDate) < 0 && task.status !== "completed";
                return (
                  <tr
                    key={task.id}
                    className="group cursor-pointer transition-colors hover:bg-secondary/30"
                    onClick={() => setDetailId(task.id)}
                  >
                    <td className="max-w-[280px] px-3 py-2">
                      <p className="truncate text-[11.5px] font-medium">{task.title}</p>
                      <p className="mt-0.5 flex items-center gap-2 font-mono text-[8.5px] text-muted-foreground">
                        <span>{task.id}</span>
                        {task.comments.length > 0 && (
                          <span className="flex items-center gap-0.5"><MessageSquare className="size-2.5" />{task.comments.length}</span>
                        )}
                        {task.paperIds.length > 0 && (
                          <span className="flex items-center gap-0.5"><Paperclip className="size-2.5" />{task.paperIds.length}</span>
                        )}
                      </p>
                    </td>
                    <td className="px-3 py-2 text-[10.5px] text-muted-foreground">
                      {project ? (
                        <Link
                          href={`/projects/${project.id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="hover:text-primary hover:underline"
                        >
                          {project.tag}
                        </Link>
                      ) : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn("flex items-center gap-1.5 text-[10.5px]", taskStatusConfig[task.status].tone)}>
                        <span className={cn("size-1.5 rounded-full", taskStatusConfig[task.status].dot)} />
                        {taskStatusConfig[task.status].label}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={taskPriorityConfig[task.priority].badge} className="h-4 px-1 text-[8px]">
                        {taskPriorityConfig[task.priority].label}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      {assignee ? (
                        <span className="flex items-center gap-1.5">
                          <MemberAvatar user={{ id: assignee.id, name: assignee.name }} className="size-5" />
                          <span className="text-[10.5px] text-muted-foreground">{assignee.name.split(" ")[0]}</span>
                        </span>
                      ) : "—"}
                    </td>
                    <td className={cn("px-3 py-2 font-mono text-[10px]", overdueTask ? "text-destructive" : "text-muted-foreground")}>
                      {formatDate(task.dueDate, { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-2 py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(event) => event.stopPropagation()}
                            className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            aria-label={`Actions for ${task.title}`}
                          >
                            <MoreHorizontal className="size-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Move to</DropdownMenuLabel>
                          {taskStatuses.map((status) => (
                            <DropdownMenuItem key={status} onSelect={() => void moveTask(task, status)}>
                              <span className={cn("size-1.5 rounded-full", taskStatusConfig[status].dot)} />
                              {taskStatusConfig[status].label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => openEdit(task)}><Pencil /> Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => setDeleteTarget(task)}
                          >
                            <Trash2 /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground/60">
        <span>{filtered.length} of {scopeTasks.length} tasks shown · drag cards between columns</span>
        <span className="hidden items-center gap-1 sm:flex">
          <Filter className="size-2.5" /> Filters apply to both views
        </span>
      </div>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
        projectId={projectId}
        defaultStatus={defaultStatus}
      />

      <TaskDetailDialog
        task={detailTask}
        open={Boolean(detailId && detailTask)}
        onOpenChange={(open) => !open && setDetailId(undefined)}
        onEdit={(task) => {
          setDetailId(undefined);
          openEdit(task);
        }}
        onDeleted={() => setDetailId(undefined)}
      />

      <TaskDeleteDialog
        task={deleteTarget}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteTask(deleteTarget.id);
          toast("Task deleted", { description: deleteTarget.title });
          setDeleteTarget(undefined);
        }}
      />
    </div>
  );
}

function SummaryCell({
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
        <span className={cn("font-display text-[20px] font-semibold tabular-nums leading-none", tone)}>
          {value}
        </span>
        <span className="font-mono text-[9px] text-muted-foreground">{hint}</span>
      </div>
    </div>
  );
}

function TaskDeleteDialog({
  task,
  open,
  onOpenChange,
  onConfirm,
}: {
  task?: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{task?.title}”?</AlertDialogTitle>
          <AlertDialogDescription>
            The task and its comments will be removed from this demonstration workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Keep task</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(event) => {
              event.preventDefault();
              setDeleting(true);
              void onConfirm().finally(() => setDeleting(false));
            }}
          >
            {deleting ? "Deleting…" : "Delete task"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
