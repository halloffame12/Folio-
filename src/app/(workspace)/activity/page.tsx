"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity as ActivityIcon,
  BookOpen,
  CalendarDays,
  Flag,
  FolderKanban,
  ListChecks,
  MessageSquare,
  NotebookPen,
  SearchX,
  UserPlus,
} from "lucide-react";
import type { ActivityItem } from "@/types";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { users, usersById } from "@/lib/client-registry";
import { formatDate, relativeTime, cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";
import { SearchInput } from "@/components/shared/search-input";
import { MemberAvatar, AvatarGroup } from "@/components/shared/member-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const kinds: { value: ActivityItem["kind"] | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paper", label: "Papers" },
  { value: "note", label: "Notes" },
  { value: "task", label: "Tasks" },
  { value: "milestone", label: "Milestones" },
  { value: "comment", label: "Comments" },
  { value: "project", label: "Projects" },
  { value: "member", label: "Members" },
];

const kindConfig: Record<
  ActivityItem["kind"],
  { icon: React.ComponentType<{ className?: string }>; label: string; classes: string }
> = {
  paper: { icon: BookOpen, label: "Paper", classes: "bg-primary/10 text-primary" },
  note: { icon: NotebookPen, label: "Note", classes: "bg-accent/12 text-accent" },
  task: { icon: ListChecks, label: "Task", classes: "bg-warning/12 text-warning" },
  milestone: { icon: Flag, label: "Milestone", classes: "bg-success/12 text-success" },
  comment: { icon: MessageSquare, label: "Comment", classes: "bg-secondary text-secondary-foreground" },
  project: { icon: FolderKanban, label: "Project", classes: "bg-primary/10 text-primary" },
  member: { icon: UserPlus, label: "Member", classes: "bg-accent/12 text-accent" },
};

function dayKey(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dayLabel(value: string) {
  const date = new Date(value);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const that = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diff = Math.round((today - that) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return formatDate(date, { weekday: "long", month: "short", day: "numeric" });
}

export default function ActivityPage() {
  const activity = useWorkspaceStore((s) => s.data.activity);
  const projects = useWorkspaceStore((s) => s.data.projects);

  const [kind, setKind] = useState<ActivityItem["kind"] | "all">("all");
  const [projectId, setProjectId] = useState("all");
  const [actorId, setActorId] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const project = search.get("project");
    const requestedKind = search.get("kind");
    if (project) setProjectId(project);
    if (requestedKind && kinds.some((item) => item.value === requestedKind)) {
      setKind(requestedKind as ActivityItem["kind"]);
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...activity]
      .filter((item) => {
        if (kind !== "all" && item.kind !== kind) return false;
        if (projectId !== "all" && item.projectId !== projectId) return false;
        if (actorId !== "all" && item.actorId !== actorId) return false;
        if (!q) return true;
        return `${item.action} ${item.target} ${usersById[item.actorId]?.name ?? ""}`
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activity, kind, projectId, actorId, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, ActivityItem[]>();
    filtered.forEach((item) => {
      const key = dayKey(item.createdAt);
      map.set(key, [...(map.get(key) ?? []), item]);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const activePeople = useMemo(() => {
    const counts = new Map<string, number>();
    activity.forEach((item) => counts.set(item.actorId, (counts.get(item.actorId) ?? 0) + 1));
    return Array.from(counts.entries())
      .map(([id, count]) => ({ user: usersById[id], count }))
      .filter((item) => item.user)
      .sort((a, b) => b.count - a.count);
  }, [activity]);

  const projectCounts = useMemo(() => {
    const counts = new Map<string, number>();
    activity.forEach((item) => {
      if (item.projectId) counts.set(item.projectId, (counts.get(item.projectId) ?? 0) + 1);
    });
    return projects
      .map((project) => ({ project, count: counts.get(project.id) ?? 0 }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [activity, projects]);

  const weekCount = activity.filter(
    (item) => Date.now() - new Date(item.createdAt).getTime() <= 7 * 86_400_000
  ).length;
  const maxCount = Math.max(...projectCounts.map((item) => item.count), 1);
  const participants = users.filter((user) => activity.some((item) => item.actorId === user.id));

  return (
    <div>
      <PageHeader
        eyebrow="Management"
        title="Team activity"
        description="A shared record of what changed, who changed it, and where to find it. New actions from this session appear at the top."
        actions={
          <Badge variant="outline" className="h-7 px-2.5 normal-case tracking-normal">
            <ActivityIcon className="size-3 text-accent" /> {weekCount} updates this week
          </Badge>
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
          placeholder="Search activity…"
          aria-label="Search activity"
          wrapperClassName="w-full sm:w-[220px]"
        />
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="w-[190px]" aria-label="Filter by project">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={actorId} onValueChange={setActorId}>
          <SelectTrigger className="w-[160px]" aria-label="Filter by person">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Everyone</SelectItem>
            {participants.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex flex-wrap items-center gap-1">
          {kinds.slice(0, 5).map((item) => (
            <button
              key={item.value}
              onClick={() => setKind(item.value)}
              aria-pressed={kind === item.value}
              className={cn(
                "rounded border px-2 py-1 font-mono text-[8.5px] uppercase tracking-wide transition-colors",
                kind === item.value
                  ? "border-primary/35 bg-primary/[0.06] text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
          <Select value={kind} onValueChange={(value) => setKind(value as ActivityItem["kind"] | "all")}>
            <SelectTrigger className="h-7 w-[92px] text-[10px]" aria-label="All activity types">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {kinds.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {filtered.length === 0 ? (
            <EmptyState
              icon={query || kind !== "all" || projectId !== "all" || actorId !== "all" ? SearchX : ActivityIcon}
              title="No activity matches this view"
              description="Try a wider date, person, or project selection."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setKind("all");
                    setProjectId("all");
                    setActorId("all");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="space-y-5">
              {grouped.map(([key, items]) => (
                <section key={key} aria-label={dayLabel(items[0]!.createdAt)}>
                  <div className="mb-2 flex items-center gap-2">
                    <h2 className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                      {dayLabel(items[0]!.createdAt)}
                    </h2>
                    <span className="h-px flex-1 bg-border" />
                    <span className="font-mono text-[8.5px] text-muted-foreground/60">{items.length}</span>
                  </div>
                  <ol className="relative space-y-2 border-l border-border pl-4">
                    {items.map((item) => {
                      const actor = usersById[item.actorId];
                      const project = projects.find((p) => p.id === item.projectId);
                      const config = kindConfig[item.kind];
                      const Icon = config.icon;
                      return (
                        <li key={item.id} className="relative">
                          <span
                            className={cn(
                              "absolute -left-[27px] top-2 flex size-5 items-center justify-center rounded-full border border-border bg-card",
                              config.classes
                            )}
                          >
                            <Icon className="size-2.5" />
                          </span>
                          <div className="rounded border border-border bg-card px-3 py-2.5 transition-colors hover:border-foreground/20">
                            <div className="flex items-start gap-2.5">
                              <MemberAvatar
                                user={{ id: item.actorId, name: actor?.name ?? "Unknown" }}
                                className="mt-0.5 size-6"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-[11.5px] leading-relaxed text-foreground/85">
                                  <span className="font-medium">{actor?.name ?? "Someone"}</span>{" "}
                                  <span className="text-muted-foreground">{item.action}</span>{" "}
                                  {item.href ? (
                                    <Link href={item.href} className="font-medium text-primary hover:underline">
                                      {item.target}
                                    </Link>
                                  ) : (
                                    <span className="font-medium">{item.target}</span>
                                  )}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[8px] uppercase tracking-wide text-muted-foreground/75">
                                  <span>{relativeTime(item.createdAt)}</span>
                                  <span className="text-border">/</span>
                                  <span>{formatDate(item.createdAt, { hour: "numeric", minute: "2-digit" })}</span>
                                  {project && (
                                    <>
                                      <span className="text-border">/</span>
                                      <Link href={`/projects/${project.id}`} className="hover:text-primary">
                                        {project.tag}
                                      </Link>
                                    </>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline" className="shrink-0">
                                {config.label}
                              </Badge>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-3">
          <section className="rounded border border-border bg-card p-3.5">
            <h2 className="section-title">This week</h2>
            <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded border border-border/70 bg-surface/40 py-2">
                <p className="font-display text-[18px] font-semibold leading-none">{weekCount}</p>
                <p className="mt-1 font-mono text-[7.5px] uppercase tracking-wide text-muted-foreground">updates</p>
              </div>
              <div className="rounded border border-border/70 bg-surface/40 py-2">
                <p className="font-display text-[18px] font-semibold leading-none">{activePeople.length}</p>
                <p className="mt-1 font-mono text-[7.5px] uppercase tracking-wide text-muted-foreground">people</p>
              </div>
              <div className="rounded border border-border/70 bg-surface/40 py-2">
                <p className="font-display text-[18px] font-semibold leading-none">{projectCounts.length}</p>
                <p className="mt-1 font-mono text-[7.5px] uppercase tracking-wide text-muted-foreground">projects</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-border/70 pt-2.5">
              <AvatarGroup users={participants.map((user) => ({ id: user.id, name: user.name }))} max={6} size="size-5" />
              <span className="font-mono text-[8px] uppercase tracking-wide text-muted-foreground">
                {participants.length} contributors
              </span>
            </div>
          </section>

          <section className="rounded border border-border bg-card p-3.5">
            <h2 className="section-title">Most active</h2>
            <ul className="mt-2.5 space-y-1.5">
              {activePeople.slice(0, 5).map(({ user, count }) => (
                <li key={user!.id} className="flex items-center gap-2">
                  <MemberAvatar user={{ id: user!.id, name: user!.name }} className="size-5" />
                  <span className="min-w-0 flex-1 truncate text-[10.5px]">{user!.name}</span>
                  <span className="font-mono text-[8.5px] text-muted-foreground">{count} events</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded border border-border bg-card p-3.5">
            <h2 className="section-title">Where things changed</h2>
            <ul className="mt-2.5 space-y-2">
              {projectCounts.slice(0, 5).map(({ project, count }) => (
                <li key={project.id}>
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/projects/${project.id}`} className="truncate text-[10px] hover:text-primary">
                      {project.title}
                    </Link>
                    <span className="font-mono text-[8px] text-muted-foreground">{count}</span>
                  </div>
                  <Progress value={(count / maxCount) * 100} className="mt-1 h-1" />
                </li>
              ))}
              {projectCounts.length === 0 && (
                <li className="text-[10.5px] text-muted-foreground">Project-linked activity will appear here.</li>
              )}
            </ul>
            <Link
              href="/projects"
              className="mt-3 flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
            >
              <CalendarDays className="size-3" /> Browse project timelines
            </Link>
          </section>
        </aside>
      </div>

      <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground/60">
        {filtered.length} of {activity.length} events · activity log
      </p>
    </div>
  );
}
