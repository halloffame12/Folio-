"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CornerDownRight,
  ExternalLink,
  Flag,
  FolderKanban,
  Link2,
  Loader2,
  MessageSquare,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import type { Task } from "@/types";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { papersById, usersById } from "@/lib/client-registry";
import { taskPriorityConfig, taskStatusConfig, taskStatuses } from "@/lib/labels";
import { daysUntil, formatDate, relativeTime, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MemberAvatar } from "@/components/shared/member-avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onEdit,
  onDeleted,
}: {
  task?: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (task: Task) => void;
  onDeleted?: (task: Task) => void;
}) {
  const projects = useWorkspaceStore((s) => s.data.projects);
  const milestones = useWorkspaceStore((s) => s.data.milestones);
  const profile = useWorkspaceStore((s) => s.profile);
  const updateTaskStatus = useWorkspaceStore((s) => s.updateTaskStatus);
  const deleteTask = useWorkspaceStore((s) => s.deleteTask);
  const addTaskComment = useWorkspaceStore((s) => s.addTaskComment);

  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open) setComment("");
  }, [open, task?.id]);

  if (!task) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Task unavailable</DialogTitle>
            <DialogDescription>This task may have been deleted. Close this panel and try again.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const project = projects.find((p) => p.id === task.projectId);
  const milestone = milestones.find((m) => m.id === task.milestoneId);
  const assignee = usersById[task.assigneeId] ?? profile;
  const dueDays = daysUntil(task.dueDate);
  const overdue = dueDays < 0 && task.status !== "completed";

  const submitComment = async () => {
    const body = comment.trim();
    if (!body) return;
    setPosting(true);
    try {
      await addTaskComment(task.id, body);
      setComment("");
      toast.success("Comment added");
    } finally {
      setPosting(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteTask(task.id);
      toast("Task deleted", { description: task.title });
      setDeleteOpen(false);
      onOpenChange(false);
      onDeleted?.(task);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-[680px]">
          <DialogHeader>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={taskPriorityConfig[task.priority].badge}>
                {taskPriorityConfig[task.priority].label} priority
              </Badge>
              {project && (
                <Badge variant="outline" className="normal-case tracking-normal">
                  {project.tag}
                </Badge>
              )}
              {task.status === "completed" && <Badge variant="success">Completed</Badge>}
            </div>
            <DialogTitle className="pr-6 text-[19px] leading-snug">{task.title}</DialogTitle>
            <DialogDescription className="sr-only">
              Task detail with status, assignment, linked work, and comments.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={task.status}
              onValueChange={(value) => {
                void updateTaskStatus(task.id, value as Task["status"]);
                toast.success(`Moved to ${taskStatusConfig[value as Task["status"]].label}`);
              }}
            >
              <SelectTrigger className="h-8 w-[152px]" aria-label="Task status">
                <span className={cn("flex items-center gap-1.5 text-[11.5px]", taskStatusConfig[task.status].tone)}>
                  <span className={cn("size-1.5 rounded-full", taskStatusConfig[task.status].dot)} />
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent>
                {taskStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {taskStatusConfig[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => onEdit?.(task)}>
              <Pencil /> Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 /> Delete
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
            <div className="space-y-4">
              <section aria-labelledby="task-detail-description">
                <h3 id="task-detail-description" className="meta-label">
                  Description
                </h3>
                <p className="mt-1.5 whitespace-pre-line text-[12.5px] leading-relaxed text-foreground/80">
                  {task.description || "No description yet. Use Edit to add context for collaborators."}
                </p>
              </section>

              <section aria-labelledby="task-detail-links">
                <h3 id="task-detail-links" className="meta-label">
                  Linked work
                </h3>
                <div className="mt-1.5 space-y-1.5">
                  {project && (
                    <Link
                      href={`/projects/${project.id}?tab=tasks`}
                      className="flex items-center gap-2 rounded border border-border bg-surface/40 px-2.5 py-1.5 text-[11.5px] transition-colors hover:border-primary/30 hover:text-primary"
                    >
                      <FolderKanban className="size-3.5 text-muted-foreground" />
                      <span className="truncate">{project.title}</span>
                      <ExternalLink className="ml-auto size-3 text-muted-foreground" />
                    </Link>
                  )}
                  {milestone && (
                    <Link
                      href={`/milestones?milestone=${milestone.id}`}
                      className="flex items-center gap-2 rounded border border-border bg-surface/40 px-2.5 py-1.5 text-[11.5px] transition-colors hover:border-primary/30 hover:text-primary"
                    >
                      <Flag className="size-3.5 text-muted-foreground" />
                      <span className="truncate">{milestone.title}</span>
                      <Badge variant="outline" className="ml-auto">
                        {formatDate(milestone.dueDate, { month: "short", day: "numeric" })}
                      </Badge>
                    </Link>
                  )}
                  {task.paperIds.length > 0 && (
                    <div className="rounded border border-border">
                      <p className="flex items-center gap-1.5 border-b border-border/70 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                        <Link2 className="size-3" /> Papers · {task.paperIds.length}
                      </p>
                      <ul className="divide-y divide-border/60">
                        {task.paperIds.map((paperId) => {
                          const paper = papersById[paperId];
                          if (!paper) return null;
                          return (
                            <li key={paperId}>
                              <Link
                                href={`/discover/${paper.id}`}
                                className="flex items-start gap-2 px-2.5 py-1.5 text-[11px] leading-snug transition-colors hover:bg-secondary/50"
                              >
                                <CornerDownRight className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                                <span>
                                  <span className="line-clamp-2 text-foreground/85">{paper.title}</span>
                                  <span className="mt-0.5 block font-mono text-[9px] text-muted-foreground">
                                    {paper.venueShort} · {paper.year}
                                  </span>
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  {!project && !milestone && task.paperIds.length === 0 && (
                    <p className="text-[11px] text-muted-foreground">No linked project, milestone, or papers.</p>
                  )}
                </div>
              </section>

              <section aria-labelledby="task-comments">
                <h3 id="task-comments" className="flex items-center gap-1.5 meta-label">
                  <MessageSquare className="size-3" /> Comments · {task.comments.length}
                </h3>
                <ul className="mt-2 space-y-2.5">
                  {task.comments.map((item) => {
                    const author = usersById[item.authorId] ?? profile;
                    return (
                      <li key={item.id} className="flex gap-2">
                        <MemberAvatar user={{ id: author.id, name: author.name }} className="mt-0.5 size-6" />
                        <div className="min-w-0 flex-1 rounded border border-border/70 bg-surface/30 px-2.5 py-1.5">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-[10.5px] font-medium text-foreground/85">{author.name}</span>
                            <span className="font-mono text-[8.5px] uppercase text-muted-foreground/70">
                              {relativeTime(item.createdAt)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11.5px] leading-relaxed text-foreground/75">{item.body}</p>
                        </div>
                      </li>
                    );
                  })}
                  {task.comments.length === 0 && (
                    <li className="rounded border border-dashed border-border px-2.5 py-3 text-[11px] text-muted-foreground">
                      No comments yet. Leave a note for the team below.
                    </li>
                  )}
                </ul>
                <div className="mt-2.5">
                  <Textarea
                    rows={2}
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Add a comment…"
                    aria-label="Add comment"
                    className="text-[11.5px]"
                  />
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground/70">
                      Mock comment · saved locally
                    </span>
                    <Button size="sm" disabled={posting || !comment.trim()} onClick={() => void submitComment()}>
                      {posting ? <Loader2 className="animate-spin" /> : <MessageSquare />} Comment
                    </Button>
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-3 rounded border border-border bg-surface/30 p-3">
              <div>
                <p className="meta-label">Assignee</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <MemberAvatar user={{ id: assignee.id, name: assignee.name }} className="size-6" />
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium">{assignee.name}</p>
                    <p className="truncate font-mono text-[8.5px] uppercase text-muted-foreground">
                      {assignee.title}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-border/70 pt-2.5">
                <p className="meta-label">Due</p>
                <p
                  className={cn(
                    "mt-1 flex items-center gap-1.5 text-[11.5px]",
                    overdue ? "text-destructive" : dueDays <= 3 ? "text-warning" : "text-foreground/80"
                  )}
                >
                  <CalendarDays className="size-3.5" />
                  {formatDate(task.dueDate, { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">
                  {task.status === "completed"
                    ? "Completed"
                    : overdue
                      ? `${Math.abs(dueDays)} day${Math.abs(dueDays) === 1 ? "" : "s"} overdue`
                      : dueDays === 0
                        ? "Due today"
                        : `${dueDays} day${dueDays === 1 ? "" : "s"} left`}
                </p>
              </div>
              <div className="border-t border-border/70 pt-2.5">
                <p className="meta-label">Created</p>
                <p className="mt-1 text-[11px] text-foreground/75">{formatDate(task.createdAt)}</p>
              </div>
              <div className="border-t border-border/70 pt-2.5">
                <p className="meta-label">Updated</p>
                <p className="mt-1 text-[11px] text-foreground/75">{relativeTime(task.updatedAt)}</p>
              </div>
              <div className="border-t border-border/70 pt-2.5">
                <p className="meta-label">Task ID</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">{task.id}</p>
              </div>
            </aside>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground/70">
            <span className="flex items-center gap-1">
              <UserRound className="size-3" /> Assigned in {project?.title ?? "workspace"}
            </span>
            <span>Click a status to move · changes save instantly</span>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              “{task.title}” and its {task.comments.length} comment
              {task.comments.length === 1 ? "" : "s"} will be removed. This demonstration cannot undo the change.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Keep task</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {deleting ? "Deleting…" : "Delete task"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
