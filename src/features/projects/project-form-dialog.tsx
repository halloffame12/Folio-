"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { users } from "@/lib/client-registry";
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

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Give the project a title of at least 3 characters.")
    .max(90, "Keep the title under 90 characters."),
  description: z
    .string()
    .trim()
    .min(10, "Add a short description so collaborators know the scope.")
    .max(400, "Keep the description under 400 characters."),
  deadline: z.string().min(1, "Choose a target deadline."),
  tag: z.string().trim().max(30, "Keep the label short.").optional(),
  ownerId: z.string().min(1, "Choose an owner."),
  status: z.enum(["active", "planning", "completed", "archived"]).optional(),
});

type FormValues = z.infer<typeof schema>;

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  onCreated?: (project: Project) => void;
}) {
  const profile = useWorkspaceStore((s) => s.profile);
  const createProject = useWorkspaceStore((s) => s.createProject);
  const updateProject = useWorkspaceStore((s) => s.updateProject);

  const defaultDeadline = new Date();
  defaultDeadline.setDate(defaultDeadline.getDate() + 60);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: project?.title ?? "",
      description: project?.description ?? "",
      deadline: project?.deadline?.slice(0, 10) ?? defaultDeadline.toISOString().slice(0, 10),
      tag: project?.tag ?? "New project",
      ownerId: project?.ownerId ?? profile.id,
      status: project?.status ?? "planning",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: project?.title ?? "",
        description: project?.description ?? "",
        deadline: project?.deadline?.slice(0, 10) ?? defaultDeadline.toISOString().slice(0, 10),
        tag: project?.tag ?? "New project",
        ownerId: project?.ownerId ?? profile.id,
        status: project?.status ?? "planning",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project, reset, profile.id]);

  const onSubmit = async (values: FormValues) => {
    if (project) {
      await updateProject(project.id, {
        title: values.title,
        description: values.description,
        deadline: new Date(`${values.deadline}T17:00:00`).toISOString(),
        tag: values.tag || "Project",
        status: values.status,
      });
      toast.success("Project updated");
    } else {
      const created = await createProject({
        title: values.title,
        description: values.description,
        deadline: new Date(`${values.deadline}T17:00:00`).toISOString(),
        tag: values.tag || "Project",
        ownerId: values.ownerId,
      });
      toast.success("Project created", { description: values.title });
      onCreated?.(created);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "Create a research project"}</DialogTitle>
          <DialogDescription>
            {project
              ? "Update the scope, deadline, or status of this project."
              : "Projects organise tasks, milestones, papers, notes, and reviews around a shared research goal."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="project-title">Project title</Label>
            <Input
              id="project-title"
              autoFocus
              placeholder="e.g. AI-assisted literature review"
              aria-invalid={Boolean(errors.title)}
              {...register("title")}
            />
            {errors.title && <p className="text-[11px] text-destructive" role="alert">{errors.title.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              rows={3}
              placeholder="What question does this project answer? What is in scope?"
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            {errors.description && <p className="text-[11px] text-destructive" role="alert">{errors.description.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="project-deadline">Deadline</Label>
              <Input id="project-deadline" type="date" aria-invalid={Boolean(errors.deadline)} {...register("deadline")} />
              {errors.deadline && <p className="text-[11px] text-destructive" role="alert">{errors.deadline.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-tag">Label</Label>
              <Input id="project-tag" placeholder="e.g. Flagship study" {...register("tag")} />
              {errors.tag && <p className="text-[11px] text-destructive" role="alert">{errors.tag.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="project-owner">Owner</Label>
              <Controller
                control={control}
                name="ownerId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={Boolean(project)}>
                    <SelectTrigger id="project-owner">
                      <SelectValue />
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
            {project && (
              <div className="space-y-1.5">
                <Label htmlFor="project-status">Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="project-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {project ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
