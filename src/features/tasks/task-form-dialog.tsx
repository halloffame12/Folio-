"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Task, TaskStatus } from "@/types";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { papersById, users } from "@/lib/client-registry";
import { taskPriorities, taskPriorityConfig, taskStatusConfig, taskStatuses } from "@/lib/labels";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Give the task a clear title of at least 3 characters.")
    .max(120, "Keep the title under 120 characters."),
  description: z.string().trim().max(800, "Keep the description under 800 characters."),
  projectId: z.string().min(1, "Choose a project."),
  status: z.enum(["todo", "in-progress", "in-review", "completed"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  assigneeId: z.string().min(1, "Choose an assignee."),
  dueDate: z.string().min(1, "Choose a due date."),
  milestoneId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const none = "none";

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  projectId,
  defaultStatus = "todo",
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  projectId?: string;
  defaultStatus?: TaskStatus;
  onCreated?: (task: Task) => void;
}) {
  const projects = useWorkspaceStore((s) => s.data.projects);
  const milestones = useWorkspaceStore((s) => s.data.milestones);
  const library = useWorkspaceStore((s) => s.data.library);
  const profile = useWorkspaceStore((s) => s.profile);
  const createTask = useWorkspaceStore((s) => s.createTask);
  const updateTask = useWorkspaceStore((s) => s.updateTask);

  const activeProjects = useMemo(
    () => projects.filter((p) => p.status !== "archived"),
    [projects]
  );

  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 7);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      projectId: task?.projectId ?? projectId ?? activeProjects[0]?.id ?? "",
      status: task?.status ?? defaultStatus,
      priority: task?.priority ?? "medium",
      assigneeId: task?.assigneeId ?? profile.id,
      dueDate: task?.dueDate?.slice(0, 10) ?? defaultDue.toISOString().slice(0, 10),
      milestoneId: task?.milestoneId ?? none,
    },
  });

  const watchedProjectId = useWatch({ control, name: "projectId" });
  const selectedProject = projects.find((p) => p.id === watchedProjectId);
  const projectMilestones = milestones.filter((m) => m.projectId === watchedProjectId);

  const paperOptions = useMemo(() => {
    const ids = new Set<string>([
      ...(selectedProject?.paperIds ?? []),
      ...library.map((entry) => entry.paperId),
    ]);
    return Array.from(ids)
      .map((id) => papersById[id])
      .filter(Boolean)
      .slice(0, 30);
  }, [selectedProject, library]);

  const [selectedPapers, setSelectedPapers] = useState<string[]>(task?.paperIds ?? []);

  useEffect(() => {
    if (!open) return;
    setSelectedPapers(task?.paperIds ?? []);
    reset({
      title: task?.title ?? "",
      description: task?.description ?? "",
      projectId: task?.projectId ?? projectId ?? activeProjects[0]?.id ?? "",
      status: task?.status ?? defaultStatus,
      priority: task?.priority ?? "medium",
      assigneeId: task?.assigneeId ?? profile.id,
      dueDate: task?.dueDate?.slice(0, 10) ?? defaultDue.toISOString().slice(0, 10),
      milestoneId: task?.milestoneId ?? none,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task, projectId, defaultStatus, reset]);

  const onSubmit = async (values: FormValues) => {
    const due = new Date(`${values.dueDate}T17:00:00`).toISOString();
    const milestoneId = values.milestoneId && values.milestoneId !== none ? values.milestoneId : undefined;
    if (task) {
      await updateTask(task.id, {
        title: values.title,
        description: values.description,
        projectId: values.projectId,
        priority: values.priority,
        assigneeId: values.assigneeId,
        dueDate: due,
        milestoneId,
        paperIds: selectedPapers,
      });
      toast.success("Task updated");
    } else {
      const created = await createTask({
        projectId: values.projectId,
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        assigneeId: values.assigneeId,
        dueDate: due,
        paperIds: selectedPapers,
        milestoneId,
      });
      toast.success("Task created", { description: values.title });
      onCreated?.(created);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "Create a task"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Update ownership, status, timing, or the milestone this task supports."
              : "Tasks are the small, assignable units of research work. Link them to a project and milestone."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              autoFocus
              placeholder="e.g. Draft screening protocol"
              aria-invalid={Boolean(errors.title)}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-[11px] text-destructive" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              rows={3}
              placeholder="What does done look like? Note constraints or hand-offs."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-[11px] text-destructive" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="task-project">Project</Label>
              <Controller
                control={control}
                name="projectId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (!task) setValue("milestoneId", none);
                    }}
                  >
                    <SelectTrigger id="task-project">
                      <SelectValue placeholder="Choose project" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.projectId && (
                <p className="text-[11px] text-destructive" role="alert">
                  {errors.projectId.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-assignee">Assignee</Label>
              <Controller
                control={control}
                name="assigneeId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="task-assignee">
                      <SelectValue placeholder="Choose assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="task-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {taskStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {taskStatusConfig[status].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="task-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {taskPriorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {taskPriorityConfig[priority].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-due">Due date</Label>
              <Input id="task-due" type="date" aria-invalid={Boolean(errors.dueDate)} {...register("dueDate")} />
              {errors.dueDate && (
                <p className="text-[11px] text-destructive" role="alert">
                  {errors.dueDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-milestone">Milestone</Label>
            <Controller
              control={control}
              name="milestoneId"
              render={({ field }) => (
                <Select value={field.value || none} onValueChange={field.onChange}>
                  <SelectTrigger id="task-milestone">
                    <SelectValue placeholder="No milestone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={none}>No milestone</SelectItem>
                    {projectMilestones.map((milestone) => (
                      <SelectItem key={milestone.id} value={milestone.id}>
                        {milestone.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {projectMilestones.length === 0 && (
              <p className="text-[10px] text-muted-foreground">
                This project has no milestones yet. Create one from the Milestones screen.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Linked papers</Label>
            <div className="max-h-32 space-y-1 overflow-y-auto rounded border border-border bg-surface/30 p-2">
              {paperOptions.length === 0 ? (
                <p className="px-1 py-2 text-[11px] text-muted-foreground">No papers available to link.</p>
              ) : (
                paperOptions.map((paper) => {
                  const checked = selectedPapers.includes(paper.id);
                  return (
                    <label
                      key={paper.id}
                      className="flex cursor-pointer items-start gap-2 rounded px-1.5 py-1 text-[11px] leading-snug hover:bg-secondary/60"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => {
                          const next = value
                            ? [...selectedPapers, paper.id]
                            : selectedPapers.filter((id) => id !== paper.id);
                          setSelectedPapers(next);
                        }}
                        className="mt-0.5"
                      />
                      <span className="line-clamp-2">
                        <span className="text-foreground/90">{paper.title}</span>
                        <span className="ml-1 font-mono text-[9px] text-muted-foreground">{paper.year}</span>
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {task ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
