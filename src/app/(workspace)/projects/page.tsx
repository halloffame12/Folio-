"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowUpRight,
  CalendarDays,
  FolderKanban,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  SearchX,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/states";
import { AvatarGroup } from "@/components/shared/member-avatar";
import { ProjectFormDialog } from "@/features/projects/project-form-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useWorkspaceStore } from "@/stores/workspace-store";
import { usersById } from "@/lib/client-registry";
import { memberProfile } from "@/lib/members";
import { projectStatusConfig } from "@/lib/labels";
import { formatDate, relativeTime, daysUntil, cn } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/types";

const filters: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "planning", label: "Planning" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

const accent: Record<Project["accent"], string> = {
  forest: "bg-primary",
  terracotta: "bg-accent",
  sand: "bg-warning",
  sage: "bg-success",
};

export default function ProjectsPage() {
  const router = useRouter();
  const projects = useWorkspaceStore((s) => s.data.projects);
  const tasks = useWorkspaceStore((s) => s.data.tasks);
  const updateProject = useWorkspaceStore((s) => s.updateProject);
  const archiveProject = useWorkspaceStore((s) => s.archiveProject);

  const [status, setStatus] = useState<ProjectStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("updated");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>();
  const [archiveTarget, setArchiveTarget] = useState<Project | undefined>();
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("new=1")) {
      setCreateOpen(true);
      window.history.replaceState(null, "", "/projects");
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = projects.filter((project) => {
      if (status !== "all" && project.status !== status) return false;
      if (!q) return true;
      return `${project.title} ${project.description} ${project.tag}`
        .toLowerCase()
        .includes(q);
    });
    return rows.sort((a, b) => {
      switch (sort) {
        case "deadline":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case "progress":
          return b.progress - a.progress;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  }, [projects, status, query, sort]);

  const counts = useMemo(
    () => ({
      all: projects.length,
      active: projects.filter((p) => p.status === "active").length,
      planning: projects.filter((p) => p.status === "planning").length,
      completed: projects.filter((p) => p.status === "completed").length,
      archived: projects.filter((p) => p.status === "archived").length,
    }),
    [projects]
  );

  const confirmArchive = async () => {
    if (!archiveTarget) return;
    setArchiving(true);
    try {
      await archiveProject(archiveTarget.id);
      toast("Project archived", {
        description: archiveTarget.title,
        action: {
          label: "Restore",
          onClick: () => void updateProject(archiveTarget.id, { status: "active" }),
        },
      });
      setArchiveTarget(undefined);
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Research programme"
        title="Projects"
        description="The container for a line of inquiry: its questions, people, tasks, milestones, papers, notes, and writing."
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus /> New project
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border">
        <div className="flex flex-wrap items-center gap-4">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatus(filter.value)}
              className={cn(
                "relative flex items-baseline gap-1.5 pb-2 text-[11.5px] transition-colors",
                status === filter.value
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="font-medium">{filter.label}</span>
              <span className="font-mono text-[9px] tabular-nums text-muted-foreground">
                {counts[filter.value]}
              </span>
              {status === filter.value && (
                <span className="absolute inset-x-0 -bottom-px h-[2px] bg-primary" />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pb-2">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery("")}
            placeholder="Search projects…"
            aria-label="Search projects"
            wrapperClassName="w-[180px] sm:w-[220px]"
          />
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[145px]" aria-label="Sort projects">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Last updated</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="title">Title A–Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={query || status !== "all" ? SearchX : FolderKanban}
          title={query || status !== "all" ? "No projects match this view" : "Start your first project"}
          description={
            query || status !== "all"
              ? "Try a different status or search term. Archived projects can be restored at any time."
              : "Projects bring your team, tasks, milestones, papers, and literature review into one place."
          }
          action={
            query || status !== "all" ? (
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus /> Create project
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((project) => {
            const owner = usersById[project.ownerId];
            const members = project.members.map(memberProfile);
            const openTasks = tasks.filter(
              (task) => task.projectId === project.id && task.status !== "completed"
            );
            const deadlineDays = daysUntil(project.deadline);
            return (
              <article
                key={project.id}
                className={cn(
                  "group relative overflow-hidden rounded-md border border-border bg-card shadow-xs transition-colors hover:border-foreground/20",
                  project.status === "archived" && "opacity-75"
                )}
              >
                <span
                  className={cn("absolute inset-y-0 left-0 w-[2px]", accent[project.accent])}
                  aria-hidden
                />
                <div className="p-4 pl-5 sm:p-5 sm:pl-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={projectStatusConfig[project.status].badge}>
                        {projectStatusConfig[project.status].label}
                      </Badge>
                      <Badge variant="outline" className="normal-case tracking-normal">
                        {project.tag}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0 text-muted-foreground"
                          aria-label={`Actions for ${project.title}`}
                        >
                          <MoreHorizontal className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project.id}`}>
                            <ArrowUpRight /> Open project
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setEditing(project)}>
                          <Pencil /> Edit project
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {project.status === "archived" ? (
                          <DropdownMenuItem
                            onSelect={() => {
                              void updateProject(project.id, { status: "active" });
                              toast.success("Project restored");
                            }}
                          >
                            <RotateCcw /> Restore project
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => setArchiveTarget(project)}
                          >
                            <Archive className="text-destructive" /> Archive
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Link href={`/projects/${project.id}`} className="mt-3 block">
                    <h2 className="font-display text-[17px] font-semibold leading-snug tracking-[-0.02em] transition-colors group-hover:text-primary">
                      {project.title}
                    </h2>
                    <p className="mt-1.5 line-clamp-2 min-h-[34px] text-[11.5px] leading-relaxed text-muted-foreground">
                      {project.description}
                    </p>
                  </Link>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="meta-label">Progress</span>
                      <span className="font-mono tabular-nums text-foreground/70">{project.progress}%</span>
                    </div>
                    <Progress
                      value={project.progress}
                      className="mt-1.5 h-1"
                      indicatorClassName={cn(
                        project.progress === 100 && "bg-success",
                        project.status === "archived" && "bg-muted-foreground"
                      )}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3">
                    <div className="flex items-center gap-2">
                      <AvatarGroup users={members} max={3} size="size-6" />
                      <span className="text-[10px] text-muted-foreground">
                        {project.members.length} member{project.members.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="size-3" />
                        {openTasks.length} open
                      </span>
                      <span
                        className={cn(
                          "flex items-center gap-1",
                          deadlineDays < 0 && project.status !== "completed" && project.status !== "archived"
                            ? "text-destructive"
                            : deadlineDays <= 14
                              ? "text-warning"
                              : ""
                        )}
                      >
                        <CalendarDays className="size-3" />
                        {formatDate(project.deadline, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[9px] text-muted-foreground/70">
                    <span>Owner · {owner?.name ?? "Unassigned"}</span>
                    <span className="font-mono uppercase tracking-wide">
                      Updated {relativeTime(project.updatedAt)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60">
        {filtered.length} of {projects.length} projects · Mock programme data
      </p>

      <ProjectFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(project) => router.push(`/projects/${project.id}`)}
      />
      <ProjectFormDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(undefined)}
        project={editing}
      />

      <AlertDialog open={Boolean(archiveTarget)} onOpenChange={(open) => !open && setArchiveTarget(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive “{archiveTarget?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Archived projects become read-only in your listings but retain all tasks, papers, and
              notes. You can restore the project later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={archiving}
              onClick={(event) => {
                event.preventDefault();
                void confirmArchive();
              }}
            >
              {archiving ? "Archiving…" : "Archive project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
