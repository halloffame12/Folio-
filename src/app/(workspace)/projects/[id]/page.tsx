"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FileText,
  Flag,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  NotebookPen,
  Paperclip,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { ProjectMember, WorkspaceRole } from "@/types";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { papersById, usersById } from "@/lib/client-registry";
import { memberProfile } from "@/lib/members";
import { milestoneStatusConfig, projectStatusConfig } from "@/lib/labels";
import { daysUntil, formatDate, relativeTime, wordCount, cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";
import { MemberAvatar, AvatarGroup } from "@/components/shared/member-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ProjectFormDialog } from "@/features/projects/project-form-dialog";
import { InviteMemberDialog } from "@/features/projects/invite-member-dialog";
import { AddPapersDialog } from "@/features/projects/add-papers-dialog";
import { TaskBoard } from "@/features/tasks/task-board";
import { MilestonePanel } from "@/features/milestones/milestone-panel";

const tabs = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "tasks", label: "Tasks", icon: ListChecks },
  { value: "milestones", label: "Milestones", icon: Flag },
  { value: "literature", label: "Literature review", icon: BookOpen },
  { value: "papers", label: "Papers", icon: Paperclip },
  { value: "notes", label: "Notes", icon: NotebookPen },
  { value: "members", label: "Members", icon: Users },
  { value: "activity", label: "Activity", icon: MessageSquare },
] as const;

type TabValue = (typeof tabs)[number]["value"];

const accentBar: Record<string, string> = {
  forest: "bg-primary",
  terracotta: "bg-accent",
  sand: "bg-warning",
  sage: "bg-success",
};

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projects = useWorkspaceStore((s) => s.data.projects);
  const tasks = useWorkspaceStore((s) => s.data.tasks);
  const milestones = useWorkspaceStore((s) => s.data.milestones);
  const notes = useWorkspaceStore((s) => s.data.notes);
  const reviews = useWorkspaceStore((s) => s.data.literatureReviews);
  const activity = useWorkspaceStore((s) => s.data.activity);
  const profile = useWorkspaceStore((s) => s.profile);
  const updateProject = useWorkspaceStore((s) => s.updateProject);
  const updateMemberRole = useWorkspaceStore((s) => s.updateMemberRole);
  const removeMember = useWorkspaceStore((s) => s.removeMember);

  const project = projects.find((p) => p.id === params.id);

  const [tab, setTab] = useState<TabValue>("overview");
  const [taskParam, setTaskParam] = useState<string | undefined>();
  const [editOpen, setEditOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [papersOpen, setPapersOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | undefined>();
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const requested = search.get("tab") as TabValue | null;
    if (requested && tabs.some((item) => item.value === requested)) setTab(requested);
    const task = search.get("task");
    if (task) {
      setTaskParam(task);
      setTab("tasks");
    }
  }, []);

  const changeTab = (value: string) => {
    const next = value as TabValue;
    setTab(next);
    if (typeof window !== "undefined") {
      const url = next === "overview" ? `/projects/${params.id}` : `/projects/${params.id}?tab=${next}`;
      window.history.replaceState(null, "", url);
    }
  };

  const currentMember = project?.members.find((member) => member.userId === profile.id);
  const canManage =
    project?.ownerId === profile.id || currentMember?.role === "Owner" || currentMember?.role === "Admin";

  const projectTasks = useMemo(
    () => (project ? tasks.filter((task) => task.projectId === project.id) : []),
    [tasks, project]
  );
  const projectMilestones = useMemo(
    () =>
      project
        ? milestones
            .filter((milestone) => milestone.projectId === project.id)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        : [],
    [milestones, project]
  );
  const projectNotes = useMemo(
    () => (project ? notes.filter((note) => note.projectId === project.id) : []),
    [notes, project]
  );
  const review = reviews.find((item) => item.projectId === project?.id);
  const projectActivity = useMemo(
    () =>
      project
        ? activity
            .filter((item) => item.projectId === project.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [],
    [activity, project]
  );

  if (!project) {
    return (
      <div>
        <PageHeader
          backHref="/projects"
          backLabel="All projects"
          eyebrow="Not found"
          title="This project is unavailable"
          description="It may have been removed from this workspace, or the link is incomplete."
        />
        <EmptyState
          icon={FolderKanban}
          title="Project not found"
          description="Return to the project list to choose another line of inquiry."
          action={
            <Button asChild>
              <Link href="/projects">Browse projects</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const members = project.members.map(memberProfile);
  const completedTasks = projectTasks.filter((task) => task.status === "completed");
  const openTasks = projectTasks.filter((task) => task.status !== "completed");
  const overdueTasks = openTasks.filter((task) => daysUntil(task.dueDate) < 0);
  const nextMilestone = projectMilestones.find((milestone) => milestone.status !== "completed");
  const atRisk = projectMilestones.filter((milestone) => milestone.status === "at-risk");
  const deadlineDays = daysUntil(project.deadline);

  const counts: Record<TabValue, number | null> = {
    overview: null,
    tasks: projectTasks.length,
    milestones: projectMilestones.length,
    literature: review ? 1 : 0,
    papers: project.paperIds.length,
    notes: projectNotes.length,
    members: project.members.length,
    activity: projectActivity.length,
  };

  const removePaper = async (paperId: string) => {
    const paper = papersById[paperId];
    const previous = project.paperIds;
    await updateProject(project.id, { paperIds: previous.filter((id) => id !== paperId) });
    toast("Paper removed from project", {
      description: paper?.title ?? "Paper",
      action: {
        label: "Undo",
        onClick: () => void updateProject(project.id, { paperIds: previous }),
      },
    });
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    setRemoving(true);
    try {
      await removeMember(project.id, memberToRemove.id);
      toast("Member removed", { description: memberProfile(memberToRemove).name });
      setMemberToRemove(undefined);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div>
      <PageHeader
        backHref="/projects"
        backLabel="All projects"
        eyebrow={project.tag}
        title={project.title}
        description={project.description}
        actions={
          <>
            {project.status === "archived" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  void updateProject(project.id, { status: "active" });
                  toast.success("Project restored");
                }}
              >
                <RotateCcw /> Restore
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil /> Edit project
              </Button>
            )}
            {canManage && project.status !== "archived" && (
              <Button size="sm" onClick={() => setInviteOpen(true)}>
                <UserPlus /> Invite
              </Button>
            )}
          </>
        }
      />

      <div className="relative mb-4 overflow-hidden rounded border border-border bg-card px-4 py-3 shadow-xs">
        <span
          className={cn("absolute inset-y-0 left-0 w-[3px]", accentBar[project.accent])}
          aria-hidden
        />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 pl-1.5">
          <Badge variant={projectStatusConfig[project.status].badge}>
            {projectStatusConfig[project.status].label}
          </Badge>
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Users className="size-3.5" />
            Owner
            <span className="text-foreground/80">{usersById[project.ownerId]?.name ?? "Unassigned"}</span>
          </span>
          <span
            className={cn(
              "flex items-center gap-1.5 text-[11px]",
              deadlineDays < 0 && project.status !== "completed"
                ? "text-destructive"
                : deadlineDays <= 14
                  ? "text-warning"
                  : "text-muted-foreground"
            )}
          >
            <CalendarDays className="size-3.5" />
            {formatDate(project.deadline, { month: "short", day: "numeric", year: "numeric" })}
            <span className="font-mono text-[9px]">
              {project.status === "completed"
                ? "delivered"
                : deadlineDays < 0
                  ? `${Math.abs(deadlineDays)}d overdue`
                  : `${deadlineDays}d left`}
            </span>
          </span>
          <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <AvatarGroup users={members} max={4} size="size-5" />
            {project.members.length} member{project.members.length === 1 ? "" : "s"}
          </span>
          <div className="ml-auto flex min-w-[170px] items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">Progress</span>
            <Progress
              value={project.progress}
              className="h-1.5 w-24"
              indicatorClassName={cn(
                project.progress === 100 && "bg-success",
                project.status === "archived" && "bg-muted-foreground"
              )}
            />
            <span className="font-mono text-[10px] tabular-nums text-foreground/70">{project.progress}%</span>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={changeTab}>
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-auto min-w-full justify-start gap-0 rounded-none border-0 border-b border-border bg-transparent p-0">
            {tabs.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="gap-1.5 rounded-none border-b-2 border-transparent px-3 py-2 text-[11.5px] data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <item.icon className="size-3.5" />
                {item.label}
                {counts[item.value] !== null && (
                  <span className="ml-0.5 font-mono text-[9px] tabular-nums text-muted-foreground">
                    {counts[item.value]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-4">
              <section className="rounded border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <h2 className="section-title">About this project</h2>
                  <span className="font-mono text-[9px] uppercase text-muted-foreground">
                    {project.paperIds.length} papers · {projectNotes.length} notes
                  </span>
                </div>
                <p className="mt-2.5 text-[12.5px] leading-relaxed text-foreground/80">{project.description}</p>
                {review && (
                  <div className="mt-4 rounded border border-border/80 bg-surface/40 p-3">
                    <p className="meta-label">Guiding research question</p>
                    <p className="mt-1 font-serif text-[14px] leading-relaxed text-foreground/85">
                      {review.researchQuestion}
                    </p>
                    <Link
                      href={`/literature?review=${review.id}`}
                      className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-medium text-primary hover:underline"
                    >
                      Open review workspace <ArrowUpRight className="size-3" />
                    </Link>
                  </div>
                )}
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Stat label="Open tasks" value={openTasks.length} />
                  <Stat label="Milestones" value={projectMilestones.length} />
                  <Stat label="Completed" value={completedTasks.length} tone="text-success" />
                  <Stat
                    label="Overdue"
                    value={overdueTasks.length}
                    tone={overdueTasks.length ? "text-destructive" : undefined}
                  />
                </div>
              </section>

              <section className="rounded border border-border bg-card">
                <header className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <h2 className="section-title">Next milestones</h2>
                  <button
                    onClick={() => changeTab("milestones")}
                    className="text-[10.5px] font-medium text-primary hover:underline"
                  >
                    View all
                  </button>
                </header>
                {projectMilestones.length === 0 ? (
                  <div className="px-4 py-6 text-[11.5px] text-muted-foreground">
                    No milestones yet. Open the milestones tab to create the first checkpoint.
                  </div>
                ) : (
                  <ul className="divide-y divide-border/60">
                    {projectMilestones
                      .filter((milestone) => milestone.status !== "completed")
                      .slice(0, 3)
                      .map((milestone) => {
                        const config = milestoneStatusConfig[milestone.status];
                        const linked = projectTasks.filter((task) => task.milestoneId === milestone.id).length;
                        return (
                          <li key={milestone.id}>
                            <button
                              onClick={() => changeTab("milestones")}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-secondary/25"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <Badge variant={config.badge}>{config.label}</Badge>
                                  <span className="font-mono text-[8.5px] uppercase text-muted-foreground">
                                    {formatDate(milestone.dueDate, { month: "short", day: "numeric" })}
                                  </span>
                                </div>
                                <p className="mt-1 truncate text-[12px] font-medium">{milestone.title}</p>
                                <p className="font-mono text-[8.5px] uppercase text-muted-foreground">
                                  {linked} linked task{linked === 1 ? "" : "s"}
                                </p>
                              </div>
                              <div className="w-20 shrink-0">
                                <Progress value={milestone.progress} className="h-1" />
                                <p className="mt-1 text-right font-mono text-[8.5px] text-muted-foreground">
                                  {milestone.progress}%
                                </p>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    {projectMilestones.every((milestone) => milestone.status === "completed") && (
                      <li className="flex items-center gap-2 px-4 py-3 text-[11px] text-success">
                        <CheckCircle2 className="size-3.5" /> All milestones complete.
                      </li>
                    )}
                  </ul>
                )}
                {atRisk.length > 0 && (
                  <div className="border-t border-warning/25 bg-warning/[0.05] px-4 py-2 text-[10.5px] text-warning">
                    {atRisk.length} milestone{atRisk.length === 1 ? "" : "s"} flagged at risk. Review progress in the
                    milestones tab.
                  </div>
                )}
              </section>

              <section className="rounded border border-border bg-card">
                <header className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <h2 className="section-title">Linked papers</h2>
                  <button
                    onClick={() => changeTab("papers")}
                    className="text-[10.5px] font-medium text-primary hover:underline"
                  >
                    Manage
                  </button>
                </header>
                {project.paperIds.length === 0 ? (
                  <div className="px-4 py-6 text-[11.5px] text-muted-foreground">
                    No papers linked yet. Add relevant library papers to keep the evidence close.
                  </div>
                ) : (
                  <ul className="divide-y divide-border/60">
                    {project.paperIds.slice(0, 3).map((paperId) => {
                      const paper = papersById[paperId];
                      if (!paper) return null;
                      return (
                        <li key={paperId}>
                          <Link
                            href={`/discover/${paper.id}`}
                            className="block px-4 py-2.5 transition-colors hover:bg-secondary/25"
                          >
                            <p className="line-clamp-1 font-serif text-[12.5px] font-medium">{paper.title}</p>
                            <p className="mt-0.5 font-mono text-[8.5px] uppercase text-muted-foreground">
                              {paper.authors[0]?.name} · {paper.year} · {paper.venueShort}
                            </p>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>

            <aside className="space-y-4">
              <section className="rounded border border-border bg-card p-4">
                <h2 className="section-title">Project health</h2>
                <div className="mt-3 space-y-2.5">
                  <HealthRow
                    label="Tasks complete"
                    value={`${completedTasks.length}/${projectTasks.length}`}
                    progress={projectTasks.length ? (completedTasks.length / projectTasks.length) * 100 : 0}
                  />
                  <HealthRow
                    label="Milestones"
                    value={`${projectMilestones.filter((m) => m.status === "completed").length}/${projectMilestones.length}`}
                    progress={
                      projectMilestones.length
                        ? (projectMilestones.filter((m) => m.status === "completed").length /
                            projectMilestones.length) *
                          100
                        : 0
                    }
                  />
                  <HealthRow label="Overall progress" value={`${project.progress}%`} progress={project.progress} />
                </div>
                <div className="mt-3 border-t border-border/70 pt-2.5 text-[10px] leading-relaxed text-muted-foreground">
                  {nextMilestone
                    ? `Next checkpoint: ${nextMilestone.title} · ${formatDate(nextMilestone.dueDate, { month: "short", day: "numeric" })}`
                    : "No upcoming checkpoint. Consider planning the next phase."}
                </div>
              </section>

              <section className="rounded border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <h2 className="section-title">Team</h2>
                  <button
                    onClick={() => changeTab("members")}
                    className="text-[10.5px] font-medium text-primary hover:underline"
                  >
                    {canManage ? "Manage" : "View"}
                  </button>
                </div>
                <ul className="mt-2.5 space-y-2">
                  {project.members.slice(0, 5).map((member) => {
                    const user = memberProfile(member);
                    return (
                      <li key={member.id} className="flex items-center gap-2">
                        <MemberAvatar user={user} className="size-6" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-medium">{user.name}</p>
                          <p className="font-mono text-[8.5px] uppercase text-muted-foreground">
                            {member.role}
                            {member.status === "invited" && " · invited"}
                          </p>
                        </div>
                        {member.userId === profile.id && (
                          <span className="font-mono text-[8px] uppercase text-muted-foreground">You</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {project.members.length > 5 && (
                  <p className="mt-2 font-mono text-[8.5px] uppercase text-muted-foreground">
                    +{project.members.length - 5} more
                  </p>
                )}
              </section>

              <section className="rounded border border-border bg-card p-4">
                <h2 className="section-title">Recent activity</h2>
                {projectActivity.length === 0 ? (
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    No recorded project activity yet. Moving tasks or editing notes will appear here.
                  </p>
                ) : (
                  <ul className="mt-2.5 space-y-2.5">
                    {projectActivity.slice(0, 4).map((item) => {
                      const actor = usersById[item.actorId];
                      return (
                        <li key={item.id} className="flex gap-2">
                          <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/50" aria-hidden />
                          <div className="min-w-0">
                            <p className="text-[10.5px] leading-relaxed text-foreground/80">
                              <span className="font-medium">{actor?.name.split(" ")[0] ?? "Someone"}</span>{" "}
                              {item.action}{" "}
                              <span className="text-foreground/60">{item.target}</span>
                            </p>
                            <p className="font-mono text-[8px] uppercase text-muted-foreground/70">
                              {relativeTime(item.createdAt)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <TaskBoard projectId={project.id} initialTaskId={taskParam} />
        </TabsContent>

        <TabsContent value="milestones" className="mt-4">
          <MilestonePanel projectId={project.id} />
        </TabsContent>

        <TabsContent value="literature" className="mt-4">
          {!review ? (
            <EmptyState
              icon={BookOpen}
              title="No literature review for this project"
              description="A review workspace connects the project's papers, notes, and argument in one place."
              action={
                <Button asChild>
                  <Link href="/literature">Open literature reviews</Link>
                </Button>
              }
            />
          ) : (
            <div className="rounded border border-border bg-card">
              <div className="border-b border-border p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="meta-label">Current review</p>
                    <h2 className="mt-1 font-display text-[17px] font-semibold">{review.title}</h2>
                    <p className="mt-1 max-w-2xl font-serif text-[12.5px] leading-relaxed text-muted-foreground">
                      {review.researchQuestion}
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/literature?review=${review.id}`}>
                      Open workspace <ArrowUpRight />
                    </Link>
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                  <span className="flex items-center gap-2 font-mono text-[9px] uppercase text-muted-foreground">
                    Progress
                    <Progress value={review.progress} className="h-1 w-24" />
                    {review.progress}%
                  </span>
                  <span className="font-mono text-[9px] uppercase text-muted-foreground">
                    {review.paperIds.length} sources · {review.noteIds.length} notes
                  </span>
                  <span className="font-mono text-[9px] uppercase text-muted-foreground">
                    {review.sections.reduce((acc, section) => acc + wordCount(section.content), 0).toLocaleString()}{" "}
                    words
                  </span>
                  <span className="font-mono text-[9px] uppercase text-muted-foreground">
                    Updated {relativeTime(review.updatedAt)}
                  </span>
                </div>
              </div>
              <ul className="divide-y divide-border/60">
                {review.sections.map((section) => {
                  const words = wordCount(section.content);
                  return (
                    <li key={section.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[8px]",
                          words > 0
                            ? "border-success/30 bg-success/10 text-success"
                            : "border-border text-muted-foreground"
                        )}
                      >
                        {words > 0 ? "✓" : "·"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11.5px] font-medium">{section.title}</p>
                        <p className="font-mono text-[8.5px] uppercase text-muted-foreground">
                          {words} words · {section.paperIds.length} sources
                        </p>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/literature?review=${review.id}&section=${section.id}`}>Write</Link>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="papers" className="mt-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[11.5px] text-muted-foreground">
              {project.paperIds.length} paper{project.paperIds.length === 1 ? "" : "s"} linked to this project.
            </p>
            {canManage && (
              <Button size="sm" variant="outline" onClick={() => setPapersOpen(true)}>
                <Plus /> Add papers
              </Button>
            )}
          </div>
          {project.paperIds.length === 0 ? (
            <EmptyState
              icon={Paperclip}
              title="No papers linked"
              description="Add papers from your library so the project's evidence base stays together."
              action={
                canManage ? (
                  <Button onClick={() => setPapersOpen(true)}>
                    <Plus /> Add papers
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <ul className="divide-y divide-border rounded border border-border bg-card">
              {project.paperIds.map((paperId) => {
                const paper = papersById[paperId];
                if (!paper) return null;
                return (
                  <li key={paperId} className="flex items-start gap-3 px-4 py-3">
                    <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/discover/${paper.id}`} className="paper-title block hover:text-primary">
                        {paper.title}
                      </Link>
                      <p className="mt-1 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                        {paper.authors.map((author) => author.name).join(", ")} · {paper.year} · {paper.venueShort}
                      </p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                        {paper.abstract}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant="outline">{paper.citationCount} cites</Badge>
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => void removePaper(paper.id)}
                          aria-label={`Remove ${paper.title} from project`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[11.5px] text-muted-foreground">
              Working notes linked to this project. Notes autosave in the notes workspace.
            </p>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/notes?new=1&project=${project.id}`}>
                <Plus /> New note
              </Link>
            </Button>
          </div>
          {projectNotes.length === 0 ? (
            <EmptyState
              icon={NotebookPen}
              title="No notes yet"
              description="Capture a reading memo, a methods decision, or a meeting summary for this project."
              action={
                <Button asChild>
                  <Link href={`/notes?new=1&project=${project.id}`}>
                    <Plus /> Create note
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {projectNotes.map((note) => (
                <Link
                  key={note.id}
                  href={`/notes?note=${note.id}`}
                  className="group rounded border border-border bg-card p-3.5 transition-colors hover:border-foreground/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[12px] font-semibold leading-snug group-hover:text-primary">{note.title}</h3>
                    <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
                  </div>
                  <p className="mt-1 line-clamp-2 text-[10.5px] leading-relaxed text-muted-foreground">
                    {note.content.replace(/<[^>]*>/g, " ").trim() || "Empty note"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {note.paperIds.length > 0 && (
                      <span className="flex items-center gap-0.5 font-mono text-[8.5px] text-muted-foreground">
                        <Paperclip className="size-2.5" /> {note.paperIds.length}
                      </span>
                    )}
                    <span className="ml-auto font-mono text-[8.5px] uppercase text-muted-foreground/70">
                      {relativeTime(note.updatedAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11.5px] text-muted-foreground">
              {project.members.length} collaborator{project.members.length === 1 ? "" : "s"} ·{" "}
              {project.members.filter((member) => member.status === "invited").length} pending invitation
              {project.members.filter((member) => member.status === "invited").length === 1 ? "" : "s"}
            </p>
            {canManage && project.status !== "archived" && (
              <Button size="sm" onClick={() => setInviteOpen(true)}>
                <UserPlus /> Invite collaborator
              </Button>
            )}
          </div>

          {!canManage && (
            <p className="mb-3 rounded border border-dashed border-border bg-surface/40 px-3 py-2 text-[10.5px] text-muted-foreground">
              You are a member of this project. Owners and admins can change roles or remove collaborators.
            </p>
          )}

          <div className="overflow-x-auto rounded border border-border bg-card">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  {["Collaborator", "Role", "Status", "Joined", ""].map((heading) => (
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
                {project.members.map((member) => {
                  const user = memberProfile(member);
                  const isOwner = member.role === "Owner";
                  const isMe = member.userId === profile.id;
                  return (
                    <tr key={member.id} className="transition-colors hover:bg-secondary/25">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <MemberAvatar user={user} className="size-7" />
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 text-[11.5px] font-medium">
                              {user.name}
                              {isMe && (
                                <span className="rounded-[2px] bg-primary/10 px-1 font-mono text-[7.5px] uppercase text-primary">
                                  you
                                </span>
                              )}
                            </p>
                            <p className="truncate font-mono text-[8.5px] text-muted-foreground">{user.email}</p>
                            <p className="truncate text-[9.5px] text-muted-foreground/80">{user.affiliation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        {isOwner || !canManage ? (
                          <span className="text-[10.5px] text-muted-foreground">{member.role}</span>
                        ) : (
                          <Select
                            value={member.role}
                            onValueChange={(value) => {
                              void updateMemberRole(project.id, member.id, value as WorkspaceRole);
                              toast.success("Role updated", { description: `${user.name} is now ${value}.` });
                            }}
                          >
                            <SelectTrigger className="h-7 w-[110px] text-[10.5px]" aria-label={`Role for ${user.name}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Member">Member</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant={member.status === "active" ? "success" : "warning"}>
                          {member.status === "active" ? "Active" : "Invited"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[9.5px] text-muted-foreground">
                        {formatDate(member.joinedAt, { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-2 py-2.5">
                        {canManage && !isOwner && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setMemberToRemove(member)}
                            aria-label={`Remove ${user.name} from project`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground/60">
            Invitation emails are sent to the address provided.
          </p>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          {projectActivity.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No project activity recorded"
              description="Task moves, note edits, and member changes made in this session will appear here."
            />
          ) : (
            <ol className="relative space-y-3 border-l border-border pl-4">
              {projectActivity.map((item) => {
                const actor = usersById[item.actorId];
                const Icon =
                  item.kind === "paper"
                    ? BookOpen
                    : item.kind === "note"
                      ? NotebookPen
                      : item.kind === "task"
                        ? ListChecks
                        : item.kind === "milestone"
                          ? Flag
                          : item.kind === "member"
                            ? UserPlus
                            : FolderKanban;
                return (
                  <li key={item.id} className="relative">
                    <span className="absolute -left-[25px] top-1 flex size-4 items-center justify-center rounded-full border border-border bg-card">
                      <Icon className="size-2.5 text-muted-foreground" />
                    </span>
                    <div className="rounded border border-border bg-card px-3 py-2">
                      <p className="text-[11.5px] leading-relaxed">
                        <span className="font-medium">{actor?.name ?? "Someone"}</span> {item.action}{" "}
                        {item.href ? (
                          <Link href={item.href} className="text-primary hover:underline">
                            {item.target}
                          </Link>
                        ) : (
                          <span>{item.target}</span>
                        )}
                      </p>
                      <p className="mt-0.5 font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground/70">
                        {formatDate(item.createdAt, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        · {relativeTime(item.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </TabsContent>
      </Tabs>

      <ProjectFormDialog open={editOpen} onOpenChange={setEditOpen} project={project} />
      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} project={project} />
      <AddPapersDialog open={papersOpen} onOpenChange={setPapersOpen} project={project} />

      <AlertDialog open={Boolean(memberToRemove)} onOpenChange={(open) => !open && setMemberToRemove(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {memberToRemove ? memberProfile(memberToRemove).name : "this collaborator"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They will lose access to the project, its tasks, notes, and review workspace. Their authored content
              stays in place.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Keep member</AlertDialogCancel>
            <AlertDialogAction
              disabled={removing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault();
                void confirmRemoveMember();
              }}
            >
              {removing ? "Removing…" : "Remove member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded border border-border/70 bg-surface/35 px-2.5 py-2">
      <p className="font-mono text-[8.5px] uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 font-display text-[17px] font-semibold leading-none tabular-nums", tone)}>{value}</p>
    </div>
  );
}

function HealthRow({ label, value, progress }: { label: string; value: string; progress: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums text-foreground/70">{value}</span>
      </div>
      <Progress value={progress} className="mt-1 h-1" />
    </div>
  );
}
