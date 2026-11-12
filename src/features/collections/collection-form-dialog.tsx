"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Collection } from "@/types";
import { useWorkspaceStore } from "@/stores/workspace-store";
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
import { cn } from "@/lib/utils";

const colors = [
  { value: "forest", label: "Forest", className: "bg-primary" },
  { value: "terracotta", label: "Terracotta", className: "bg-accent" },
  { value: "sand", label: "Sand", className: "bg-warning" },
  { value: "sage", label: "Sage", className: "bg-success" },
  { value: "ink", label: "Ink", className: "bg-foreground/70" },
] as const;

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Give the collection a name of at least 2 characters.")
    .max(64, "Keep the name under 64 characters."),
  description: z
    .string()
    .trim()
    .max(240, "Keep the description under 240 characters.")
    .optional(),
  color: z.enum(["forest", "terracotta", "sand", "sage", "ink"]),
});

type FormValues = z.infer<typeof schema>;

export function CollectionFormDialog({
  open,
  onOpenChange,
  collection,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection?: Collection;
  onCreated?: (collection: Collection) => void;
}) {
  const createCollection = useWorkspaceStore((s) => s.createCollection);
  const updateCollection = useWorkspaceStore((s) => s.updateCollection);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: collection?.name ?? "",
      description: collection?.description ?? "",
      color: collection?.color ?? "forest",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: collection?.name ?? "",
        description: collection?.description ?? "",
        color: collection?.color ?? "forest",
      });
    }
  }, [open, collection, reset]);

  const color = watch("color");

  const onSubmit = async (values: FormValues) => {
    if (collection) {
      await updateCollection(collection.id, {
        name: values.name,
        description: values.description ?? "",
        color: values.color,
      });
      toast.success("Collection updated");
    } else {
      const created = await createCollection({
        name: values.name,
        description: values.description ?? "",
        color: values.color,
      });
      toast.success("Collection created", {
        description: `${values.name} is ready for papers.`,
      });
      onCreated?.(created);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{collection ? "Edit collection" : "Create a collection"}</DialogTitle>
          <DialogDescription>
            {collection
              ? "Update how this collection is described and displayed."
              : "Collections gather papers around a theme, a review, or a line of inquiry."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="collection-name">Name</Label>
            <Input
              id="collection-name"
              autoFocus
              placeholder="e.g. Research evaluation & equity"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-[11px] text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="collection-description">Description</Label>
            <Textarea
              id="collection-description"
              rows={3}
              placeholder="What holds these papers together?"
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            <div className="flex justify-between">
              {errors.description ? (
                <p className="text-[11px] text-destructive" role="alert">
                  {errors.description.message}
                </p>
              ) : (
                <span className="text-[10px] text-muted-foreground">
                  Optional, but useful for collaborators.
                </span>
              )}
            </div>
          </div>
          <fieldset className="space-y-2">
            <legend className="text-[12px] font-medium">Accent</legend>
            <div className="flex flex-wrap gap-2">
              {colors.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded border px-2.5 py-1.5 text-[11px] transition-colors",
                    color === option.value
                      ? "border-foreground/30 bg-secondary/70"
                      : "border-border hover:border-foreground/20"
                  )}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={color === option.value}
                    onChange={() => setValue("color", option.value)}
                    className="sr-only"
                  />
                  <span className={cn("size-2.5 rounded-full", option.className)} />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {collection ? "Save changes" : "Create collection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
