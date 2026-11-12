"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Milestone, MilestoneStatus, ProjectMember } from "@/types";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { milestoneStatusConfig } from "@/lib/labels";
import { memberProfile } from "@/lib/members";
import { initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
    .min(3, "Give the milestone a clear title.")
    .max(110, "Keep the title under 110 characters."),
  description: z.string().trim().max(600, "Keep the description under 600 characters."),
  projectId: z.string().min(1, "Choose a project."),
  dueDate: z.string().min(1, "Choose a target date."),
  status: z.enum(["upcoming", "in-progress", "at-risk", "completed"]),
});

type FormValues = z.infer<typeof schema>;

const statuses: MilestoneStatus[] = ["upcoming", "in-progress", "at-risk", "completed"];

export function MilestoneDialog({
  open,
  onOpenChange,
  milestone,
  projectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone?: Milestone;
  projectId?: string;
}) {
  const projects = useWorkspaceStore((s) => s.data.projects);
  const createMilestone = useWorkspaceStore((s) => s.createMilestone);
  const updateMilestone = useWorkspaceStore((s) => s.updateMilestone);
  const deleteMilestone = useWorkspaceStore((s) => s.deleteMilestone);

  const [assigneeIds, setAssigneeIds] = useState<string[]>(milestone?.assigneeIds ?? []);
  const [progress, setProgress] = useState(milestone?.progress ?? 0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const activeProjects = useMemo(() => projects.filter((p) => p.status !== "archived"), [projects]);
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 30);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: milestone?.title ?? "",
      description: milestone?.description ?? "",
      projectId: milestone?.projectId ?? projectId ?? activeProjects[0]?.id ?? "",
      dueDate: milestone?.dueDate?.slice(0, 10) ?? defaultDue.toISOString().slice(0, 10),
      status: milestone?.status ?? "upcoming",
    },
  });

  const watchedProjectId = useWatch({ control, name: "projectId" });
  const selectedProject = projects.find((p) => p.id === watchedProjectId);
  const projectMembers: ProjectMember[] = selectedProject?.members ?? [];

  useEffect(() => {
    if (!open) return;
    setAssigneeIds(milestone?.assigneeIds ?? []);
    setProgress(milestone?.progress ?? 0);
    reset({
      title: milestone?.title ?? "",
      description: milestone?.description ?? "",
      projectId: milestone?.projectId ?? projectId ?? activeProjects[0]?.id ?? "",
      dueDate: milestone?.dueDate?.slice(0, 10) ?? defaultDue.toISOString().slice(0, 10),
      status: milestone?.status ?? "upcoming",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, milestone, projectId, reset]);

  const onSubmit = async (values: FormValues) => {
    const due = new Date(`${values.dueDate}T17:00:00`).toISOString();
    const nextProgress = values.status === "completed" ? 100 : Math.min(100, Math.max(0, progress));
    if (milestone) {
      await updateMilestone(milestone.id, {
        title: values.title,
        description: values.description,
        dueDate: due,
        status: values.status,
        progress: nextProgress,
        assigneeIds,
      });
      toast.success("Milestone updated");
    } else {
      const created = await createMilestone({
        projectId: values.projectId,
        title: values.title,
        description: values.description,
        dueDate: due,
        assigneeIds,
      });
      if (values.status !== "upcoming" || nextProgress > 0) {
        await updateMilestone(created.id, { status: values.status, progress: nextProgress });
      }
      toast.success("Milestone created", { description: values.title });
    }
    onOpenChange(false);
  };

  const confirmDelete = async () => {
    if (!milestone) return;
    setDeleting(true);
    try {
      await deleteMilestone(milestone.id);
      toast("Milestone deleted", { description: milestone.title });
      setDeleteOpen(false);
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{milestone ? "Edit milestone" : "Create a milestone"}</DialogTitle>
            <DialogDescription>
              Milestones mark meaningful checkpoints. Tasks can be linked to show what is contributing to progress.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="milestone-title">Title</Label>
              <Input
                id="milestone-title"
                autoFocus
                placeholder="e.g. Full draft submitted"
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
              <Label htmlFor="milestone-description">Description</Label>
              <Textarea
                id="milestone-description"
                rows={3}
                placeholder="What has to be true when this milestone is complete?"
                {...register("description")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="milestone-project">Project</Label>
                <Controller
                  control={control}
                  name="projectId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setAssigneeIds([]);
                      }}
                    >
                      <SelectTrigger id="milestone-project">
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
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="milestone-due">Target date</Label>
                <Input id="milestone-due" type="date" {...register("dueDate")} />
                {errors.dueDate && (
                  <p className="text-[11px] text-destructive" role="alert">
                    {errors.dueDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="milestone-status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (value === "completed") setProgress(100);
                    }}
                  >
                    <SelectTrigger id="milestone-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {milestoneStatusConfig[status].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="milestone-progress">Progress</Label>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{progress}%</span>
              </div>
              <input
                id="milestone-progress"
                type="range"
                min={0}
                max={100}
                step={5}
                value={progress}
                onChange={(event) => setProgress(Number(event.target.value))}
                className="w-full accent-[hsl(var(--primary))]"
              />
              <Progress value={progress} className="h-1.5" />
            </div>

            <div className="space-y-2">
              <Label>Contributors</Label>
              {projectMembers.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  This project has no members yet. Invite collaborators from the project page.
                </p>
              ) : (
                <div className="grid max-h-36 gap-1 overflow-y-auto rounded border border-border bg-surface/30 p-2 sm:grid-cols-2">
                  {projectMembers.map((member) => {
                    const user = memberProfile(member);
                    const checked = assigneeIds.includes(member.userId);
                    return (
                      <label
                        key={member.id}
                        className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-[11px] hover:bg-secondary/60"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => {
                            setAssigneeIds((current) =>
                              value
                                ? [...new Set([...current, member.userId])]
                                : current.filter((id) => id !== member.userId)
                            );
                          }}
                        />
                        <span className="flex size-5 items-center justify-center rounded-full bg-secondary font-mono text-[8px] text-muted-foreground">
                          {initials(user.name)}
                        </span>
                        <span className="truncate">{user.name}</span>
                        {member.status === "invited" && (
                          <span className="ml-auto font-mono text-[8px] uppercase text-muted-foreground">Invited</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <DialogFooter className="sm:justify-between">
              <div>
                {milestone && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 /> Delete
                  </Button>
                )}
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="animate-spin" />}
                  {milestone ? "Save changes" : "Create milestone"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this milestone?</AlertDialogTitle>
            <AlertDialogDescription>
              “{milestone?.title}” will be removed. Linked tasks stay in the project but will no longer reference a
              milestone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Keep milestone</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {deleting ? "Deleting…" : "Delete milestone"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
