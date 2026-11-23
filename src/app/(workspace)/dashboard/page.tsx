"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  ChevronRight,
  Compass,
  FilePlus2,
  Flag,
  FolderPlus,
  NotebookPen,
  Pin,
  Plus,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AvatarGroup } from "@/components/shared/member-avatar";
import { ActivityChart, type ActivityWeek } from "@/features/dashboard/activity-chart";
import { ScholarlyQuickSearch } from "@/features/dashboard/scholarly-search";
import { GettingStartedChecklist } from "@/features/dashboard/getting-started-checklist";
import { ReadingPipeline } from "@/features/dashboard/reading-pipeline";
import { LiteratureReviewsWidget } from "@/features/dashboard/literature-reviews-widget";
import { ResearchGapWidget, type LatestGapSummary } from "@/features/dashboard/research-gap-widget";
import { InstantCitationTool } from "@/features/dashboard/instant-citation-tool";
import { QuickNoteDialog } from "@/features/dashboard/quick-note-dialog";
import { ManualPaperDialog } from "@/features/dashboard/manual-paper-dialog";
import { ProjectFormDialog } from "@/features/projects/project-form-dialog";
import { TaskFormDialog } from "@/features/tasks/task-form-dialog";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { papersById, usersById } from "@/lib/client-registry";
import { formatDate, initials, relativeTime, daysUntil, pluralize } from "@/lib/utils";
import { memberProfile } from "@/lib/members";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { Milestone, Task } from "@/types";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function deadlineItems(tasks: Task[], milestones: Milestone[]) {
  const taskItems = tasks
    .filter((t) => t.status !== "completed")
    .map((t) => ({
      id: t.id,
      title: t.title,
      kind: "Task" as const,
      date: t.dueDate,
      href: `/tasks?task=${t.id}`,
      projectId: t.projectId,
    }));
  const milestoneItems = milestones
    .filter((m) => m.status !== "completed")
    .map((m) => ({
      id: m.id,
      title: m.title,
      kind: "Milestone" as const,
      date: m.dueDate,
      href: `/milestones?milestone=${m.id}`,
      projectId: m.projectId,
    }));
  return [...taskItems, ...milestoneItems]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);
}

function DateStamp({ date }: { date: string }) {
  const d = new Date(date);
  const overdue = daysUntil(d) < 0;
  const soon = daysUntil(d) >= 0 && daysUntil(d) <= 7;
  return (
    <span
      className={cn(
        "flex w-9 shrink-0 flex-col items-center justify-center rounded-[3px] border py-1",
        overdue
          ? "border-destructive/25 bg-destructive/[0.05]"
          : soon
            ? "border-warning/25 bg-warning/[0.05]"
            : "border-border bg-surface/60"
      )}
    >
      <span className="font-mono text-[13px] font-medium leading-none tabular-nums">
        {d.getDate()}
      </span>
      <span className="mt-0.5 font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
        {d.toLocaleDateString("en-US", { month: "short" })}
      </span>
    </span>
  );
}

export default function DashboardPage() {
  const data = useWorkspaceStore((s) => s.data);
  const profile = useWorkspaceStore((s) => s.profile);

  // Dialog states for Quick Creation
  const [newNoteOpen, setNewNoteOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [manualPaperOpen, setManualPaperOpen] = useState(false);

  // Data for Gap Analysis & Citations
  const [latestGapAnalysis, setLatestGapAnalysis] = useState<LatestGapSummary | null>(null);
  const [hasGapAnalysis, setHasGapAnalysis] = useState(false);
  const [hasCitation, setHasCitation] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch<any[]>("/api/research-gaps")
      .then((gaps) => {
        if (!active) return;
        if (gaps && gaps.length > 0) {
          setHasGapAnalysis(true);
          setLatestGapAnalysis(gaps[0]);
        }
      })
      .catch(() => {});

    apiFetch<any[]>("/api/citations")
      .then((cits) => {
        if (!active) return;
        if (cits && cits.length > 0) {
          setHasCitation(true);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const saved = data.library.length;
  const activeProjects = data.projects.filter((p) => p.status === "active");
  const openTasks = data.tasks.filter((t) => t.status !== "completed");
  const overdue = openTasks.filter((t) => daysUntil(t.dueDate) < 0).length;

  const recentPapers = [...data.library]
    .filter((entry) => entry.status !== "unread")
    .sort(
      (a, b) =>
        new Date(b.lastOpenedAt ?? b.addedAt).getTime() -
        new Date(a.lastOpenedAt ?? a.addedAt).getTime()
    )
    .slice(0, 3);

  const recentNotes = [...data.notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const deadlines = deadlineItems(data.tasks, data.milestones);
  const activity = [...data.activity]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const totalWords = data.notes.reduce((acc, note) => {
    const text = note.content.replace(/<[^>]*>/g, " ").trim();
    return acc + (text ? text.split(/\s+/).length : 0);
  }, 0);

  // Build last 8 weeks of real activity.
  const now = new Date();
  const weekLabels: string[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i * 7);
    weekLabels.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
  }
  const chartData: ActivityWeek[] = weekLabels.map((week) => ({ week, notes: 0, completed: 0 }));
  const weekIndex = (dateStr: string) => {
    const d = new Date(dateStr);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0 || diffDays > 55) return -1;
    return 7 - Math.floor(diffDays / 7);
  };
  data.notes.forEach((n) => {
    const idx = weekIndex(n.createdAt);
    if (idx >= 0 && idx < chartData.length) chartData[idx].notes += 1;
  });
  data.library
    .filter((e) => e.status === "completed")
    .forEach((e) => {
      const idx = weekIndex(e.lastOpenedAt ?? e.addedAt);
      if (idx >= 0 && idx < chartData.length) chartData[idx].completed += 1;
    });

  return (
    <div className="space-y-6">
      {/* Page Header with Greeting and Direct Quick Actions */}
      <PageHeader
        eyebrow={formatDate(new Date(), { weekday: "long", month: "long", day: "numeric" })}
        title={`${greeting()}, ${profile.name ? profile.name.split(" ")[0] : "Researcher"}.`}
        description={`You have ${pluralize(openTasks.length, "open task")}, ${pluralize(data.notes.length, "note")}, and ${pluralize(activeProjects.length, "active project")}. Here is your academic command center.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setManualPaperOpen(true)}>
              <BookOpen className="size-3.5 mr-1" /> Add Paper
            </Button>
            <Button variant="outline" size="sm" onClick={() => setNewProjectOpen(true)}>
              <FolderPlus className="size-3.5 mr-1" /> New Project
            </Button>
            <Button size="sm" onClick={() => setNewNoteOpen(true)}>
              <FilePlus2 className="size-3.5 mr-1" /> New Note
            </Button>
          </div>
        }
      />

      {/* Phase 3: Scholarly Quick Search Hero */}
      <ScholarlyQuickSearch />

      {/* Phase 4: Getting Started Checklist */}
      <GettingStartedChecklist
        hasGapAnalysis={hasGapAnalysis}
        hasCitation={hasCitation}
        onOpenNewProject={() => setNewProjectOpen(true)}
        onOpenNewNote={() => setNewNoteOpen(true)}
      />

      {/* Phase 7: Reading Pipeline & Core Metrics */}
      <ReadingPipeline />

      {/* Main Grid: Research Content & Activity */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <div className="space-y-6 min-w-0">
          {/* Activity Chart */}
          <section className="overflow-hidden rounded-md border border-border bg-card">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-3.5">
              <div>
                <h2 className="section-title">Research rhythm</h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Notes written and papers completed, last eight weeks
                </p>
              </div>
              <div className="flex items-center gap-4 pt-1">
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="size-2 rounded-[1px] border border-primary bg-primary/15" />
                  Notes
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="h-[2px] w-3 bg-accent" />
                  Completed
                </span>
              </div>
            </div>
            <div className="px-3 pb-3 pt-4 sm:px-4">
              <ActivityChart data={chartData} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-surface/30 px-5 py-2.5 text-[10px] text-muted-foreground">
              <span>
                {pluralize(data.notes.length, "note")} · {totalWords.toLocaleString()} words captured
              </span>
              <Link href="/notes" className="inline-flex items-center gap-1 text-primary hover:underline">
                All notes <ChevronRight className="size-3" />
              </Link>
            </div>
          </section>

          {/* Continue Reading with Contextual Empty State */}
          <section className="overflow-hidden rounded-md border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div>
                <h2 className="section-title">Continue reading</h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Recently opened papers from your library
                </p>
              </div>
              <Button variant="ghost" size="xs" asChild>
                <Link href="/library">
                  Library <ChevronRight className="size-3" />
                </Link>
              </Button>
            </div>
            {recentPapers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <span className="flex size-9 items-center justify-center rounded-[3px] border border-border bg-card text-muted-foreground">
                  <BookOpen className="size-4" />
                </span>
                <h3 className="mt-3 text-[13px] font-medium text-foreground">
                  Your research library is waiting.
                </h3>
                <p className="mt-1 max-w-xs text-[11.5px] leading-relaxed text-muted-foreground">
                  Discover scholarly papers and start building your reading collection.
                </p>
                <div className="mt-3.5 flex items-center gap-2">
                  <Button size="sm" className="h-8 text-[12px]" asChild>
                    <Link href="/discover">
                      <Compass className="size-3.5 mr-1" /> Search Literature
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={() => setManualPaperOpen(true)}>
                    Add Manually
                  </Button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/70">
                {recentPapers.map((entry) => {
                  const paper = papersById[entry.paperId];
                  if (!paper) return null;
                  return (
                    <Link
                      key={entry.id}
                      href={`/discover/${paper.id}`}
                      className="group flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-secondary/30"
                    >
                      <span className="mt-0.5 font-mono text-[10px] tabular-nums text-muted-foreground/60">
                        {paper.year}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="paper-title block text-[14px] leading-snug transition-colors group-hover:text-primary">
                          {paper.title}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] text-muted-foreground">
                          <span className="truncate">{paper.authors.map((a) => a.name).join(", ")}</span>
                          <span className="text-border">/</span>
                          <span className="font-mono text-[9.5px]">{paper.venueShort}</span>
                        </span>
                        {typeof entry.readingProgress === "number" && entry.readingProgress > 0 && (
                          <span className="mt-2 flex items-center gap-2">
                            <Progress value={entry.readingProgress} className="h-1 max-w-[180px]" />
                            <span className="font-mono text-[9px] text-muted-foreground">
                              {entry.readingProgress}%
                            </span>
                          </span>
                        )}
                      </span>
                      <Badge
                        variant={entry.status === "completed" ? "success" : "warning"}
                        className="mt-0.5 shrink-0"
                      >
                        {entry.status === "completed" ? "Read" : "Reading"}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Phase 5: Literature Reviews Widget */}
          <LiteratureReviewsWidget />

          {/* Active Projects with Contextual Empty State */}
          <section className="overflow-hidden rounded-md border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div>
                <h2 className="section-title">Active projects</h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Progress across your current research
                </p>
              </div>
              <Button variant="ghost" size="xs" asChild>
                <Link href="/projects">
                  All projects <ChevronRight className="size-3" />
                </Link>
              </Button>
            </div>
            {activeProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <span className="flex size-9 items-center justify-center rounded-[3px] border border-border bg-card text-muted-foreground">
                  <FolderPlus className="size-4" />
                </span>
                <h3 className="mt-3 text-[13px] font-medium text-foreground">
                  No research projects yet.
                </h3>
                <p className="mt-1 max-w-xs text-[11.5px] leading-relaxed text-muted-foreground">
                  Create a workspace to organize research, collaborators and milestones.
                </p>
                <Button size="sm" className="mt-3.5 h-8 text-[12px]" onClick={() => setNewProjectOpen(true)}>
                  <Plus className="size-3.5 mr-1" /> Create Project
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/70">
                {activeProjects.map((project) => {
                  const members = project.members.map(memberProfile);
                  const projectTasks = data.tasks.filter(
                    (t) => t.projectId === project.id && t.status !== "completed"
                  );
                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="group block px-5 py-4 transition-colors hover:bg-secondary/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[13px] font-medium transition-colors group-hover:text-primary">
                              {project.title}
                            </h3>
                            <Badge variant="outline">{project.tag}</Badge>
                          </div>
                          <p className="mt-1 text-[10.5px] text-muted-foreground">
                            {pluralize(projectTasks.length, "open task")} · due{" "}
                            {formatDate(project.deadline, { month: "short", day: "numeric" })}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <AvatarGroup users={members} max={3} size="size-6" />
                          <span className="w-9 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                            {project.progress}%
                          </span>
                        </div>
                      </div>
                      <Progress value={project.progress} className="mt-2.5 h-1" />
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Deadlines, Notes, Gaps, Citations, Activity */}
        <div className="space-y-6 min-w-0">
          {/* Phase 6: Research Gap Analysis Widget */}
          <ResearchGapWidget latestAnalysis={latestGapAnalysis} />

          {/* Phase 8: Instant Citation Tool */}
          <InstantCitationTool
            onCitationGenerated={() => {
              setHasCitation(true);
            }}
          />

          {/* Deadlines with Contextual Empty State */}
          <section className="overflow-hidden rounded-md border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <div className="flex items-center gap-2">
                <Flag className="size-3.5 text-muted-foreground" />
                <h2 className="section-title text-[14px]">Upcoming</h2>
              </div>
              <Badge variant={overdue ? "destructive" : "outline"}>
                {overdue ? `${overdue} overdue` : "On track"}
              </Badge>
            </div>
            {deadlines.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <span className="flex size-9 items-center justify-center rounded-[3px] border border-border bg-card text-muted-foreground">
                  <Flag className="size-4" />
                </span>
                <h3 className="mt-3 text-[13px] font-medium text-foreground">
                  Nothing scheduled yet.
                </h3>
                <p className="mt-1 max-w-xs text-[11.5px] leading-relaxed text-muted-foreground">
                  Add tasks and milestones to keep your research moving.
                </p>
                <Button size="sm" className="mt-3.5 h-8 text-[12px]" onClick={() => setNewTaskOpen(true)}>
                  <Plus className="size-3.5 mr-1" /> Create Task
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/70">
                {deadlines.map((item) => {
                  const project = data.projects.find((p) => p.id === item.projectId);
                  const days = daysUntil(item.date);
                  return (
                    <Link
                      key={`${item.kind}-${item.id}`}
                      href={item.href}
                      className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-secondary/30"
                    >
                      <DateStamp date={item.date} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11.5px] font-medium leading-snug transition-colors group-hover:text-primary">
                          {item.title}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                          <span className="font-mono uppercase tracking-wide">{item.kind}</span>
                          <span className="text-border">/</span>
                          <span className="truncate">{project?.title}</span>
                        </span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 pt-0.5 font-mono text-[9px] uppercase tracking-wide",
                          days < 0
                            ? "text-destructive"
                            : days <= 7
                              ? "text-warning"
                              : "text-muted-foreground"
                        )}
                      >
                        {days < 0 ? `${Math.abs(days)}d late` : days === 0 ? "Today" : `${days}d`}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
            <div className="border-t border-border px-4 py-2">
              <Link href="/milestones" className="flex items-center justify-between text-[10.5px] text-muted-foreground hover:text-foreground">
                View milestones
                <ChevronRight className="size-3" />
              </Link>
            </div>
          </section>

          {/* Recent Notes with Contextual Empty State */}
          <section className="overflow-hidden rounded-md border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <div className="flex items-center gap-2">
                <NotebookPen className="size-3.5 text-muted-foreground" />
                <h2 className="section-title text-[14px]">Recent notes</h2>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setNewNoteOpen(true)}
                aria-label="New note"
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
            {recentNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <span className="flex size-9 items-center justify-center rounded-[3px] border border-border bg-card text-muted-foreground">
                  <NotebookPen className="size-4" />
                </span>
                <h3 className="mt-3 text-[13px] font-medium text-foreground">
                  No research notes yet.
                </h3>
                <p className="mt-1 max-w-xs text-[11.5px] leading-relaxed text-muted-foreground">
                  Capture reading observations, methodology insights and literature summaries.
                </p>
                <Button size="sm" className="mt-3.5 h-8 text-[12px]" onClick={() => setNewNoteOpen(true)}>
                  <Plus className="size-3.5 mr-1" /> Write Note
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/70">
                {recentNotes.map((note) => {
                  const paper = note.paperIds[0] ? papersById[note.paperIds[0]] : undefined;
                  return (
                    <Link
                      key={note.id}
                      href={`/notes?note=${note.id}`}
                      className="group block px-4 py-3 transition-colors hover:bg-secondary/30"
                    >
                      <div className="flex items-start gap-2">
                        {note.pinned && <Pin className="mt-0.5 size-3 shrink-0 text-accent" />}
                        <div className="min-w-0">
                          <h3 className="line-clamp-1 text-[11.5px] font-medium transition-colors group-hover:text-primary">
                            {note.title}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-[10.5px] leading-relaxed text-muted-foreground">
                            {note.content.replace(/<[^>]*>/g, " ").slice(0, 120)}…
                          </p>
                          <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wide text-muted-foreground/70">
                            {relativeTime(note.updatedAt)}
                            {paper && (
                              <>
                                <span className="text-border">/</span>
                                <span className="truncate normal-case tracking-normal">{paper.venueShort}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Team Activity with Contextual Empty State */}
          <section className="overflow-hidden rounded-md border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <div className="flex items-center gap-2">
                <Bell className="size-3.5 text-muted-foreground" />
                <h2 className="section-title text-[14px]">Team activity</h2>
              </div>
              <Link href="/activity" className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground hover:text-foreground">
                All
              </Link>
            </div>
            {activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <span className="flex size-9 items-center justify-center rounded-[3px] border border-border bg-card text-muted-foreground">
                  <Users className="size-4" />
                </span>
                <h3 className="mt-3 text-[13px] font-medium text-foreground">
                  Your research workspace is quiet.
                </h3>
                <p className="mt-1 max-w-xs text-[11.5px] leading-relaxed text-muted-foreground">
                  Invite collaborators to start building something together.
                </p>
                <Button size="sm" variant="outline" className="mt-3.5 h-8 text-[12px]" asChild>
                  <Link href="/projects">
                    Invite Collaborators
                  </Link>
                </Button>
              </div>
            ) : (
              <ol className="px-4 py-2">
                {activity.map((item, index) => {
                  const actor = usersById[item.actorId];
                  return (
                    <li key={item.id} className="relative flex gap-2.5 py-2">
                      {index < activity.length - 1 && (
                        <span className="absolute left-[11px] top-8 h-[calc(100%-20px)] w-px bg-border" aria-hidden />
                      )}
                      <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-card font-mono text-[8px] text-muted-foreground">
                        {actor ? initials(actor.name) : "??"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10.5px] leading-relaxed">
                          <span className="font-medium">{actor?.name ?? "Someone"}</span>{" "}
                          <span className="text-muted-foreground">{item.action}</span>{" "}
                          {item.href ? (
                            <Link href={item.href} className="underline decoration-border underline-offset-2 hover:text-primary">
                              {item.target}
                            </Link>
                          ) : (
                            <span>{item.target}</span>
                          )}
                        </p>
                        <p className="mt-0.5 font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground/60">
                          {relativeTime(item.createdAt)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      </div>

      {/* Phase 9: Quick Creation Dialog Modals */}
      <QuickNoteDialog
        open={newNoteOpen}
        onOpenChange={setNewNoteOpen}
      />
      <ManualPaperDialog
        open={manualPaperOpen}
        onOpenChange={setManualPaperOpen}
      />
      <ProjectFormDialog
        open={newProjectOpen}
        onOpenChange={setNewProjectOpen}
      />
      <TaskFormDialog
        open={newTaskOpen}
        onOpenChange={setNewTaskOpen}
      />

      <div className="sr-only" aria-live="polite">
        {openTasks.length} open tasks, {saved} saved papers.
      </div>
    </div>
  );
}
