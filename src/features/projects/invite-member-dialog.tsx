"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { users } from "@/lib/client-registry";
import { memberProfile } from "@/lib/members";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  email: z.string().trim().email("Enter a valid institutional email address."),
  name: z.string().trim().max(80, "Keep the name under 80 characters.").optional(),
  role: z.enum(["Admin", "Member"]),
});

type FormValues = z.infer<typeof schema>;

export function InviteMemberDialog({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}) {
  const inviteMember = useWorkspaceStore((s) => s.inviteMember);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", name: "", role: "Member" },
  });

  useEffect(() => {
    if (open) reset({ email: "", name: "", role: "Member" });
  }, [open, reset]);

  const existingUserIds = useMemo(
    () => new Set(project.members.map((member) => member.userId)),
    [project.members]
  );

  const suggestions = useMemo(
    () => users.filter((user) => !existingUserIds.has(user.id)),
    [existingUserIds]
  );

  const email = watch("email");

  const onSubmit = async (values: FormValues) => {
    const existing = users.find(
      (user) => user.email.toLowerCase() === values.email.trim().toLowerCase()
    );
    if (existing && existingUserIds.has(existing.id)) {
      toast.error("Already a member", {
        description: `${existing.name} is already part of this project.`,
      });
      return;
    }
    await inviteMember({
      projectId: project.id,
      email: values.email.trim(),
      name: values.name?.trim() || existing?.name,
      role: values.role,
    });
    toast.success("Invitation sent", {
      description: `${existing?.name ?? values.email.trim()} was invited as ${values.role}.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Invite a collaborator</DialogTitle>
          <DialogDescription>
            Invitations are simulated in this demo. The invited person appears in the project roster as pending.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              autoFocus
              placeholder="name@university.edu"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-[11px] text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-1.5">
              <p className="meta-label">From your institution</p>
              <div className="max-h-28 space-y-0.5 overflow-y-auto rounded border border-border bg-surface/30 p-1">
                {suggestions.map((user) => {
                  const member = memberProfile({
                    id: "preview",
                    userId: user.id,
                    role: "Member",
                    status: "active",
                    joinedAt: user.joinedAt,
                  });
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setValue("email", user.email, { shouldValidate: true });
                        setValue("name", user.name);
                      }}
                      className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left transition-colors hover:bg-secondary/60"
                    >
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 font-mono text-[8px] text-primary">
                        {member.initials}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-medium">{user.name}</span>
                        <span className="block truncate font-mono text-[8.5px] text-muted-foreground">{user.email}</span>
                      </span>
                      <Mail className="ml-auto size-3 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="invite-name">Display name <span className="font-normal text-muted-foreground">(optional)</span></Label>
            <Input id="invite-name" placeholder="Optional for people outside the directory" {...register("name")} />
            {errors.name && (
              <p className="text-[11px] text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Role</Label>
            <Select
              value={watch("role")}
              onValueChange={(value) => setValue("role", value as FormValues["role"])}
            >
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Member">Member — can edit shared work</SelectItem>
                <SelectItem value="Admin">Admin — can manage members and settings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded border border-dashed border-border bg-surface/40 px-3 py-2 text-[10.5px] leading-relaxed text-muted-foreground">
            <p>
              <span className="font-medium text-foreground/80">Demo behaviour:</span> no email is sent. The invitation
              is stored in this browser and can be accepted from the notifications screen.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !email}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Send invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
