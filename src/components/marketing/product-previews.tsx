import {
  BookOpenCheck,
  BookmarkCheck,
  BookmarkPlus,
  ChevronRight,
  Compass,
  FileText,
  Flag,
  FolderKanban,
  LayoutDashboard,
  Library,
  ListChecks,
  NotebookPen,
  ScanSearch,
  Search,
} from "lucide-react";
import {
  collections,
  library,
  literatureReviews,
  notes,
  papersById,
  projects,
  researchTopics,
  tasks,
  usersById,
} from "@/mocks/data";
import { generateCitation } from "@/lib/citations";
import { cn, daysUntil, formatDate } from "@/lib/utils";
import { MiniAvatar, MiniBar, MiniTag, PreviewFrame, PreviewLabel } from "./preview-frame";

const dashboardNav = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Discover", icon: Compass },
  { label: "Library", icon: Library },
  { label: "Collections", icon: BookmarkCheck },
  { label: "Notes", icon: NotebookPen },
  { label: "Projects", icon: FolderKanban },
  { label: "Literature", icon: BookOpenCheck },
  { label: "Gap explorer", icon: ScanSearch },
  { label: "Tasks", icon: ListChecks },
];

function formatAuthors(paperId: string, count = 2) {
  const paper = papersById[paperId];
  if (!paper) return "";
  const names = paper.authors.slice(0, count).map((author) => author.name);
  return paper.authors.length > count ? `${names.join(", ")} et al.` : names.join(", ");
}

export function DashboardPreview({ className }: { className?: string }) {
  const reading = ["p1", "p11", "p4"].map((id) => papersById[id]).filter(Boolean);
  const openTasks = tasks.filter((task) => task.status !== "completed");
  const activeProjects = projects.filter((project) => project.status === "active");
  const upcoming = tasks
    .filter((task) => task.status !== "completed")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <PreviewFrame
      path="/dashboard"
      className={className}
      description="Folio dashboard showing saved papers, reading progress, active projects, and upcoming research tasks."
    >
      <div className="grid grid-cols-[84px_minmax(0,1fr)] sm:grid-cols-[126px_minmax(0,1fr)]">
        <aside className="border-r border-border bg-sidebar/70 p-2 sm:p-2.5">
          <div className="rounded-[3px] border border-border bg-card p-1.5">
            <div className="flex items-center gap-1.5">
              <span className="flex size-4 shrink-0 items-center justify-center rounded-[2px] border border-border bg-secondary font-mono text-[5px] font-medium">
                NB
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[6px] font-semibold leading-tight">
                  Northbridge
                </span>
                <span className="block truncate text-[5px] leading-tight text-muted-foreground">
                  Information Science
                </span>
              </span>
            </div>
          </div>

          <p className="mt-3 px-1 font-mono text-[5px] uppercase tracking-[0.16em] text-muted-foreground">
            Workspace
          </p>
          <ul className="mt-1 space-y-px">
            {dashboardNav.slice(0, 6).map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <span
                    className={cn(
                      "flex items-center gap-1.5 rounded-[2px] px-1 py-[3px] text-[6px] sm:text-[7px]",
                      item.active
                        ? "bg-primary/[0.08] font-medium text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <Icon className="size-2 sm:size-2.5" />
                    <span className="truncate">{item.label}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 px-1 font-mono text-[5px] uppercase tracking-[0.16em] text-muted-foreground">
            Research
          </p>
          <ul className="mt-1 space-y-px">
            {dashboardNav.slice(6).map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <span className="flex items-center gap-1.5 rounded-[2px] px-1 py-[3px] text-[6px] text-muted-foreground sm:text-[7px]">
                    <Icon className="size-2 sm:size-2.5" />
                    <span className="truncate">{item.label}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-2">
            <MiniAvatar initials="MS" />
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-[5.5px] font-medium">Mira Srinivasan</span>
              <span className="block truncate text-[4.5px] text-muted-foreground">PhD Candidate</span>
            </span>
          </div>
        </aside>

        <div className="min-w-0 bg-background">
          <div className="flex items-start justify-between gap-2 border-b border-border px-2.5 py-2 sm:px-3.5 sm:py-2.5">
            <div className="min-w-0">
              <p className="font-mono text-[5.5px] uppercase tracking-[0.14em] text-muted-foreground">
                Wednesday, November 12
              </p>
              <h3 className="mt-0.5 truncate font-display text-[10px] font-semibold tracking-[-0.02em] sm:text-[13px]">
                Good morning, Mira.
              </h3>
              <p className="mt-0.5 hidden truncate text-[6px] text-muted-foreground sm:block">
                {openTasks.length} open tasks · 2 notes in progress · {activeProjects.length} active
                projects
              </p>
            </div>
            <span className="shrink-0 rounded-[2px] bg-primary px-1.5 py-1 text-[5.5px] font-medium text-primary-foreground">
              New note
            </span>
          </div>

          <div className="p-2 sm:p-3">
            <div className="grid grid-cols-2 overflow-hidden rounded-[3px] border border-border bg-card sm:grid-cols-4">
              {[
                { label: "Saved papers", value: "16", sub: "5 collections", tone: "" },
                { label: "Active projects", value: String(activeProjects.length), sub: "1 planning", tone: "" },
                { label: "Open tasks", value: String(openTasks.length), sub: "2 overdue", tone: "text-destructive" },
                { label: "Library read", value: "63%", sub: "10 of 16", tone: "" },
              ].map((metric, index) => (
                <div
                  key={metric.label}
                  className={cn(
                    "px-2 py-1.5 sm:px-2.5 sm:py-2",
                    index % 2 === 1 && "border-l border-border",
                    index >= 2 && "border-t border-border sm:border-t-0",
                    index === 2 && "sm:border-l"
                  )}
                >
                  <p className="font-mono text-[4.5px] uppercase tracking-[0.1em] text-muted-foreground sm:text-[5px]">
                    {metric.label}
                  </p>
                  <p className="mt-0.5 flex items-baseline gap-1">
                    <span className="font-display text-[11px] font-semibold leading-none tabular-nums sm:text-[14px]">
                      {metric.value}
                    </span>
                    <span className={cn("truncate text-[4.5px] text-muted-foreground sm:text-[5px]", metric.tone)}>
                      {metric.sub}
                    </span>
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
              <div className="space-y-2">
                <div className="overflow-hidden rounded-[3px] border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
                    <span className="text-[6.5px] font-semibold">Continue reading</span>
                    <span className="flex items-center gap-0.5 font-mono text-[4.5px] uppercase text-muted-foreground">
                      Library <ChevronRight className="size-1.5" />
                    </span>
                  </div>
                  <ul className="divide-y divide-border/60">
                    {reading.map((paper) => {
                      if (!paper) return null;
                      const entry = library.find((item) => item.paperId === paper.id);
                      return (
                        <li key={paper.id} className="flex items-start gap-1.5 px-2 py-1.5">
                          <span className="mt-px font-mono text-[4.5px] tabular-nums text-muted-foreground">
                            {paper.year}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="line-clamp-1 font-serif text-[6.5px] font-medium leading-tight sm:text-[7.5px]">
                              {paper.title}
                            </span>
                            <span className="mt-0.5 flex items-center gap-1">
                              <span className="truncate font-mono text-[4.5px] uppercase tracking-wide text-muted-foreground">
                                {paper.venueShort}
                              </span>
                              <MiniBar value={entry?.readingProgress ?? 0} className="h-[2px] max-w-[48px]" />
                              <span className="font-mono text-[4.5px] text-muted-foreground">
                                {entry?.readingProgress ?? 0}%
                              </span>
                            </span>
                          </span>
                          <MiniTag tone={entry?.status === "completed" ? "success" : "warning"}>
                            {entry?.status === "completed" ? "Read" : "Reading"}
                          </MiniTag>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="rounded-[3px] border border-border bg-card p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[6.5px] font-semibold">Research rhythm</span>
                    <span className="font-mono text-[4.5px] uppercase text-muted-foreground">
                      Last 8 weeks
                    </span>
                  </div>
                  <div className="mt-1.5 flex h-8 items-end gap-1">
                    {[38, 58, 42, 72, 54, 84, 62, 92, 76, 100, 68, 88].map((height, index) => (
                      <span
                        key={index}
                        className={cn("flex-1 rounded-t-[1px]", index % 3 === 0 ? "bg-accent/60" : "bg-primary/25")}
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-1 flex justify-between font-mono text-[4px] uppercase text-muted-foreground">
                    <span>Sep</span>
                    <span>Oct</span>
                    <span>Nov</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="overflow-hidden rounded-[3px] border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
                    <span className="flex items-center gap-1 text-[6.5px] font-semibold">
                      <Flag className="size-2 text-muted-foreground" /> Upcoming
                    </span>
                    <MiniTag tone="warning">2 due</MiniTag>
                  </div>
                  <ul className="divide-y divide-border/60">
                    {upcoming.map((task) => {
                      const days = daysUntil(task.dueDate);
                      return (
                        <li key={task.id} className="flex items-start gap-1.5 px-2 py-1.5">
                          <span className="mt-px flex size-3.5 shrink-0 flex-col items-center justify-center rounded-[2px] border border-border bg-surface/60 font-mono text-[4.5px] leading-none">
                            {new Date(task.dueDate).getDate()}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="line-clamp-1 text-[5.5px] font-medium leading-tight sm:text-[6.5px]">
                              {task.title}
                            </span>
                            <span className="mt-0.5 block font-mono text-[4.5px] uppercase tracking-wide text-muted-foreground">
                              {days < 0 ? `${Math.abs(days)}d late` : days === 0 ? "Today" : `${days}d`}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="overflow-hidden rounded-[3px] border border-border bg-card">
                  <div className="border-b border-border px-2 py-1.5 text-[6.5px] font-semibold">
                    Active project
                  </div>
                  <div className="p-2">
                    <p className="line-clamp-1 text-[6px] font-medium">{projects[0]?.title}</p>
                    <p className="mt-0.5 font-mono text-[4.5px] uppercase text-muted-foreground">
                      4 members · due {formatDate(projects[0]?.deadline ?? "", { month: "short", day: "numeric" })}
                    </p>
                    <MiniBar value={projects[0]?.progress ?? 0} className="mt-1.5" />
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex -space-x-1">
                        {["MS", "EH", "PR", "JW"].map((initials) => (
                          <MiniAvatar key={initials} initials={initials} />
                        ))}
                      </div>
                      <span className="font-mono text-[5px] tabular-nums text-muted-foreground">
                        {projects[0]?.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PreviewFrame>
  );
}

export function DiscoveryPreview({ className }: { className?: string }) {
  const results = ["p4", "p12", "p20"].map((id) => papersById[id]).filter(Boolean);

  return (
    <PreviewFrame
      path="/discover"
      className={className}
      description="Paper discovery screen with a scholarly search, filters, and realistic academic results."
    >
      <div className="p-2.5 sm:p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <PreviewLabel>Discovery</PreviewLabel>
            <h3 className="mt-0.5 font-display text-[10px] font-semibold sm:text-[12px]">Discover papers</h3>
            <p className="mt-0.5 text-[5.5px] text-muted-foreground sm:text-[6.5px]">
              Search Crossref and OpenAlex for scholarly records.
            </p>
          </div>
          <MiniTag tone="forest">20 records</MiniTag>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 rounded-[3px] border border-input bg-card px-2 py-1.5 shadow-xs">
          <Search className="size-2.5 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate text-[6.5px] text-foreground/80">
            research gap methodology
          </span>
          <span className="rounded-[2px] bg-secondary px-1.5 py-0.5 font-mono text-[4.5px] uppercase text-muted-foreground">
            All fields
          </span>
        </div>

        <div className="mt-1.5 flex flex-wrap gap-1">
          {["Open access", "2020–2026", "Journal article", "Sort: relevance"].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-border bg-card px-1.5 py-0.5 font-mono text-[4.5px] uppercase tracking-wide text-muted-foreground"
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="mt-2.5 grid gap-2.5 sm:grid-cols-[86px_minmax(0,1fr)]">
          <aside className="hidden space-y-2.5 border-r border-border pr-2.5 sm:block">
            <div>
              <p className="font-mono text-[4.5px] uppercase tracking-[0.12em] text-muted-foreground">
                Publication type
              </p>
              <ul className="mt-1 space-y-0.5">
                {["Journal article", "Conference paper", "Preprint", "Book chapter"].map((type) => (
                  <li key={type} className="flex items-center gap-1 text-[5.5px] text-muted-foreground">
                    <span className="size-1.5 rounded-[1px] border border-border bg-card" />
                    {type}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[4.5px] uppercase tracking-[0.12em] text-muted-foreground">
                Publication year
              </p>
              <p className="mt-1 text-[5.5px] text-muted-foreground">2020 — 2026</p>
              <div className="mt-1 h-[2px] rounded-full bg-secondary">
                <div className="h-full w-2/3 rounded-full bg-primary/50" />
              </div>
            </div>
            <div>
              <p className="font-mono text-[4.5px] uppercase tracking-[0.12em] text-muted-foreground">
                Access
              </p>
              <p className="mt-1 flex items-center gap-1 text-[5.5px] text-muted-foreground">
                <span className="size-1.5 rounded-[1px] border border-primary bg-primary" />
                Open access only
              </p>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex items-center justify-between border-b border-border pb-1">
              <span className="font-mono text-[4.5px] uppercase tracking-[0.12em] text-muted-foreground">
                3 of 20 results
              </span>
              <span className="font-mono text-[4.5px] uppercase tracking-[0.12em] text-muted-foreground">
                Relevance
              </span>
            </div>
            <ul className="divide-y divide-border/70">
              {results.map((paper, index) => {
                if (!paper) return null;
                return (
                  <li key={paper.id} className="flex items-start gap-2 py-1.5">
                    <span className="mt-0.5 font-mono text-[4.5px] tabular-nums text-muted-foreground">
                      0{index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1 font-mono text-[4.5px] uppercase tracking-[0.06em] text-muted-foreground">
                        <span className="text-foreground/75">{paper.publicationType}</span>
                        <span>/</span>
                        <span>{paper.year}</span>
                        <span>/</span>
                        <span className="normal-case">{paper.venueShort}</span>
                        {paper.openAccess ? (
                          <>
                            <span>/</span>
                            <span className="text-success">Open access</span>
                          </>
                        ) : null}
                      </div>
                      <p className="mt-0.5 line-clamp-2 font-serif text-[7px] font-medium leading-snug sm:text-[8.5px]">
                        {paper.title}
                      </p>
                      <p className="mt-0.5 truncate text-[5px] text-muted-foreground sm:text-[5.5px]">
                        {paper.authors.map((author) => author.name).join(", ")}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-[4.8px] leading-relaxed text-muted-foreground sm:text-[5.5px]">
                        {paper.abstract}
                      </p>
                    </div>
                    <span className="mt-1 flex shrink-0 items-center gap-0.5 rounded-[2px] border border-border bg-card px-1 py-0.5 font-mono text-[4.5px] text-muted-foreground">
                      <BookmarkPlus className="size-1.5" /> Save
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </PreviewFrame>
  );
}

export function LibraryPreview({ className }: { className?: string }) {
  const entries = ["p1", "p2", "p4", "p7", "p10"].map((id) => library.find((entry) => entry.paperId === id)).filter(Boolean);

  return (
    <PreviewFrame
      path="/library"
      className={className}
      description="Personal research library with collections, tags, reading status, and reading progress."
    >
      <div className="p-2.5 sm:p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <PreviewLabel>Workspace</PreviewLabel>
            <h3 className="mt-0.5 font-display text-[10px] font-semibold sm:text-[12px]">My Library</h3>
            <p className="mt-0.5 text-[5.5px] text-muted-foreground sm:text-[6.5px]">
              16 saved papers · 5 collections · 9 tags
            </p>
          </div>
          <span className="rounded-[2px] bg-primary px-1.5 py-1 text-[5px] font-medium text-primary-foreground">
            Add paper
          </span>
        </div>

        <div className="mt-2.5 flex gap-1 border-b border-border pb-1">
          {["All papers", "Reading", "Completed", "Unread"].map((tab, index) => (
            <span
              key={tab}
              className={cn(
                "border-b px-1.5 pb-1 text-[5.5px] sm:text-[6.5px]",
                index === 0
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground"
              )}
            >
              {tab}
            </span>
          ))}
        </div>

        <div className="mt-2 flex gap-1.5 overflow-hidden">
          {collections.slice(0, 3).map((collection, index) => (
            <span
              key={collection.id}
              className={cn(
                "flex min-w-0 flex-1 items-center gap-1 rounded-[2px] border border-border bg-card px-1.5 py-1",
                index === 2 && "hidden sm:flex"
              )}
            >
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-[1px]",
                  index === 0 ? "bg-primary" : index === 1 ? "bg-accent" : "bg-warning"
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[5px] font-medium sm:text-[5.5px]">
                  {collection.name}
                </span>
                <span className="block font-mono text-[4px] uppercase text-muted-foreground">
                  {collection.paperIds.length} papers
                </span>
              </span>
            </span>
          ))}
        </div>

        <ul className="mt-2.5 divide-y divide-border/70 border-t border-border">
          {entries.map((entry) => {
            if (!entry) return null;
            const paper = papersById[entry.paperId];
            if (!paper) return null;
            return (
              <li key={entry.id} className="flex items-start gap-2 py-1.5">
                <span className="mt-0.5 w-5 shrink-0 font-mono text-[4.5px] tabular-nums text-muted-foreground">
                  {paper.year}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-serif text-[6.5px] font-medium leading-tight sm:text-[8px]">
                    {paper.title}
                  </p>
                  <p className="mt-0.5 truncate text-[4.8px] text-muted-foreground sm:text-[5.5px]">
                    {formatAuthors(paper.id, 2)} · {paper.venueShort}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1">
                    {entry.tags.slice(0, 2).map((tag) => (
                      <MiniTag key={tag}>{tag}</MiniTag>
                    ))}
                  </div>
                </div>
                <div className="flex w-[64px] shrink-0 flex-col items-end gap-1 sm:w-[82px]">
                  <MiniTag
                    tone={
                      entry.status === "completed"
                        ? "success"
                        : entry.status === "reading"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {entry.status}
                  </MiniTag>
                  {entry.status !== "unread" ? (
                    <span className="flex w-full items-center gap-1">
                      <MiniBar value={entry.readingProgress ?? 0} className="h-[2px]" />
                      <span className="font-mono text-[4.5px] tabular-nums text-muted-foreground">
                        {entry.readingProgress ?? 0}%
                      </span>
                    </span>
                  ) : (
                    <span className="font-mono text-[4px] uppercase text-muted-foreground">
                      Not opened
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </PreviewFrame>
  );
}

export function NotesPreview({ className }: { className?: string }) {
  const note = notes[0]!;

  return (
    <PreviewFrame
      path="/notes"
      className={className}
      description="Research notes editor with a note list, rich text, and a linked source paper."
    >
      <div className="grid grid-cols-[82px_minmax(0,1fr)] sm:grid-cols-[128px_minmax(0,1fr)]">
        <aside className="border-r border-border bg-sidebar/50 p-1.5 sm:p-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[6px] font-semibold sm:text-[7px]">Notes</span>
            <span className="font-mono text-[4.5px] text-muted-foreground">9</span>
          </div>
          <div className="mt-1 flex items-center gap-1 rounded-[2px] border border-border bg-card px-1 py-0.5">
            <Search className="size-1.5 text-muted-foreground" />
            <span className="text-[4.5px] text-muted-foreground">Search notes</span>
          </div>
          <ul className="mt-1.5 space-y-0.5">
            {notes.slice(0, 5).map((item, index) => (
              <li key={item.id}>
                <span
                  className={cn(
                    "block rounded-[2px] border-l px-1 py-1",
                    index === 0
                      ? "border-accent bg-card"
                      : "border-transparent text-muted-foreground"
                  )}
                >
                  <span className="line-clamp-2 text-[5px] font-medium leading-tight sm:text-[6px]">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block font-mono text-[4px] uppercase tracking-wide text-muted-foreground">
                    {index === 0 ? "2h ago" : "6h ago"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-w-0 bg-card">
          <div className="flex items-center justify-between border-b border-border px-2 py-1">
            <span className="font-mono text-[4.5px] uppercase tracking-wide text-muted-foreground">
              Research notes / Reading memo
            </span>
            <span className="font-mono text-[4px] uppercase text-success">Saved</span>
          </div>
          <div className="p-2 sm:p-2.5">
            <h3 className="font-serif text-[8px] font-medium leading-tight sm:text-[11px]">
              {note.title}
            </h3>
            <p className="mt-0.5 font-mono text-[4.5px] uppercase tracking-wide text-muted-foreground">
              Updated 2 hours ago · 2 linked papers
            </p>
            <div className="mt-1.5 flex items-center gap-1 border-y border-border py-1">
              {["B", "I", "U"].map((format) => (
                <span
                  key={format}
                  className={cn(
                    "flex size-3 items-center justify-center rounded-[1px] border border-border font-serif text-[5px]",
                    format === "I" && "italic"
                  )}
                >
                  {format}
                </span>
              ))}
              <span className="flex size-3 items-center justify-center rounded-[1px] border border-border">
                <ListChecks className="size-1.5 text-muted-foreground" />
              </span>
              <span className="ml-auto font-mono text-[4px] uppercase text-muted-foreground">
                Autosaved
              </span>
            </div>
            <div className="mt-1.5 space-y-1 text-[5px] leading-[1.65] text-foreground/80 sm:text-[6px]">
              <p>
                Fischer et al. describe four modes of negotiation:{" "}
                <strong className="font-semibold">delegation, verification, translation, refusal</strong>.
                Refusal is treated as a design resource rather than a failure of adoption.
              </p>
              <p className="font-serif text-[6px] font-medium sm:text-[7px]">Quotes to carry forward</p>
              <blockquote className="border-l border-accent/60 pl-1.5 font-serif text-[5.5px] italic text-muted-foreground sm:text-[6.5px]">
                Trust is produced through small, often invisible acts of checking.
              </blockquote>
              <p>
                This connects to the provenance literature and to my earlier note on verification
                labour. Need to distinguish between <em>checking a summary</em> and{" "}
                <em>checking a source</em>.
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1 border-t border-border pt-1.5">
              {note.tags.map((tag) => (
                <MiniTag key={tag} tone="terracotta">
                  {tag}
                </MiniTag>
              ))}
              <span className="ml-auto flex items-center gap-1 rounded-[2px] border border-border bg-surface/50 px-1 py-0.5 text-[4.5px] text-muted-foreground">
                <FileText className="size-1.5" /> Fischer et al. (2024)
              </span>
            </div>
          </div>
        </div>
      </div>
    </PreviewFrame>
  );
}

export function ProjectsPreview({ className }: { className?: string }) {
  const project = projects[0]!;
  const projectTasks = tasks.filter((task) => task.projectId === project.id).slice(0, 4);
  const statusTone: Record<string, string> = {
    todo: "bg-muted-foreground/40",
    "in-progress": "bg-primary",
    "in-review": "bg-warning",
    completed: "bg-success",
  };

  return (
    <PreviewFrame
      path={`/projects/${project.id}`}
      className={className}
      description="Research project workspace with collaborators, tasks, progress, and milestones."
    >
      <div className="p-2.5 sm:p-3.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1">
              <MiniTag tone="forest">{project.tag}</MiniTag>
              <span className="font-mono text-[4.5px] uppercase tracking-wide text-muted-foreground">
                Project · {project.status}
              </span>
            </div>
            <h3 className="mt-1 line-clamp-1 font-display text-[10px] font-semibold sm:text-[12px]">
              {project.title}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-[5.5px] text-muted-foreground">
              {project.description}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1">
              {project.members.slice(0, 4).map((member) => {
                const user = usersById[member.userId];
                return <MiniAvatar key={member.id} initials={user?.initials ?? "??"} />;
              })}
            </div>
            <span className="rounded-[2px] border border-border bg-card px-1 py-0.5 font-mono text-[4.5px] uppercase text-muted-foreground">
              Invite
            </span>
          </div>
        </div>

        <div className="mt-2.5 rounded-[3px] border border-border bg-card p-2">
          <div className="flex items-center justify-between font-mono text-[4.5px] uppercase tracking-wide text-muted-foreground">
            <span>Overall progress</span>
            <span className="tabular-nums text-foreground/70">{project.progress}%</span>
          </div>
          <MiniBar value={project.progress} className="mt-1" />
          <div className="mt-1 flex justify-between font-mono text-[4.5px] text-muted-foreground">
            <span>{projectTasks.length} open tasks</span>
            <span>Due {formatDate(project.deadline, { month: "short", day: "numeric" })}</span>
          </div>
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="overflow-hidden rounded-[3px] border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
              <span className="text-[6.5px] font-semibold">Tasks</span>
              <span className="font-mono text-[4.5px] uppercase text-muted-foreground">Board</span>
            </div>
            <ul className="divide-y divide-border/60">
              {projectTasks.map((task) => {
                const assignee = usersById[task.assigneeId];
                return (
                  <li key={task.id} className="flex items-center gap-1.5 px-2 py-1.5">
                    <span className={cn("size-1.5 shrink-0 rounded-full", statusTone[task.status])} />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-[5.5px] font-medium leading-tight sm:text-[6.5px]">
                        {task.title}
                      </span>
                      <span className="font-mono text-[4px] uppercase tracking-wide text-muted-foreground">
                        {task.status.replace("-", " ")}
                      </span>
                    </span>
                    <MiniAvatar initials={assignee?.initials ?? "??"} />
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="overflow-hidden rounded-[3px] border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
              <span className="text-[6.5px] font-semibold">Milestones</span>
              <Flag className="size-2 text-muted-foreground" />
            </div>
            <ul className="divide-y divide-border/60">
              {[
                { title: "Screening & coding complete", progress: 55, due: "10d" },
                { title: "Interviews completed", progress: 30, due: "21d" },
                { title: "Provenance rubric validated", progress: 20, due: "30d", risk: true },
              ].map((milestone) => (
                <li key={milestone.title} className="px-2 py-1.5">
                  <div className="flex items-start justify-between gap-1">
                    <span className="line-clamp-1 text-[5.5px] font-medium leading-tight sm:text-[6.5px]">
                      {milestone.title}
                    </span>
                    {milestone.risk ? <MiniTag tone="warning">Risk</MiniTag> : null}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <MiniBar
                      value={milestone.progress}
                      className="h-[2px]"
                      tone={milestone.risk ? "bg-warning" : "bg-primary"}
                    />
                    <span className="font-mono text-[4px] tabular-nums text-muted-foreground">
                      {milestone.progress}%
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[4px] uppercase text-muted-foreground">
                    Due in {milestone.due}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PreviewFrame>
  );
}

export function LiteraturePreview({ className }: { className?: string }) {
  const review = literatureReviews[0]!;
  const sections = review.sections.slice(0, 6);
  const evidence = ["p1", "p11", "p18"].map((id) => papersById[id]).filter(Boolean);

  return (
    <PreviewFrame
      path="/literature"
      className={className}
      description="Literature review workspace with a section outline, linked evidence, and review progress."
    >
      <div className="grid grid-cols-[82px_minmax(0,1fr)] sm:grid-cols-[126px_minmax(0,1fr)]">
        <aside className="border-r border-border bg-sidebar/50 p-1.5 sm:p-2">
          <p className="px-1 font-mono text-[4.5px] uppercase tracking-[0.12em] text-muted-foreground">
            Review outline
          </p>
          <p className="mt-1 line-clamp-2 px-1 font-serif text-[6px] font-medium leading-tight sm:text-[7px]">
            {review.title}
          </p>
          <div className="mt-1.5 px-1">
            <MiniBar value={review.progress} className="h-[2px]" />
            <p className="mt-0.5 font-mono text-[4px] uppercase text-muted-foreground">
              {review.progress}% drafted
            </p>
          </div>
          <ul className="mt-2 space-y-px">
            {sections.map((section, index) => (
              <li key={section.id}>
                <span
                  className={cn(
                    "flex items-start gap-1 rounded-[2px] border-l px-1 py-1 text-[5px] leading-tight sm:text-[5.5px]",
                    index === 3
                      ? "border-accent bg-card font-medium text-foreground"
                      : "border-transparent text-muted-foreground"
                  )}
                >
                  <span className="font-mono text-[4px] tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="line-clamp-2">{section.title}</span>
                </span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-w-0 bg-card">
          <div className="flex items-center justify-between border-b border-border px-2 py-1">
            <span className="font-mono text-[4.5px] uppercase tracking-wide text-muted-foreground">
              Literature / {review.title.slice(0, 28)}…
            </span>
            <span className="font-mono text-[4px] uppercase text-success">Draft</span>
          </div>
          <div className="grid sm:grid-cols-[minmax(0,1fr)_108px]">
            <div className="min-w-0 p-2 sm:p-2.5">
              <h3 className="font-serif text-[8px] font-medium leading-tight sm:text-[10px]">
                4. Findings
              </h3>
              <p className="mt-0.5 font-mono text-[4px] uppercase tracking-wide text-muted-foreground">
                3 linked papers · 1 note · updated today
              </p>
              <div className="mt-1.5 space-y-1 text-[5px] leading-[1.7] text-foreground/80 sm:text-[5.8px]">
                <p className="font-serif text-[6px] font-medium text-foreground sm:text-[6.8px]">
                  Assistance patterns
                </p>
                <p>
                  Across the included studies, four assistance patterns recur: orientation,
                  condensation, comparison, and composition. Evidence is strongest for orientation
                  and weakest for comparison, where the risk of misrepresentation is highest.
                </p>
                <p className="font-serif text-[6px] font-medium text-foreground sm:text-[6.8px]">
                  Documented risks
                </p>
                <p>
                  The most frequently documented risk is fabricated or distorted citation. A second
                  cluster concerns the loss of nuance when findings are condensed.
                </p>
                <blockquote className="border-l border-accent/60 pl-1.5 font-serif text-[5.5px] italic text-muted-foreground sm:text-[6.2px]">
                  Make the path back to the source short, visible, and dependable.
                </blockquote>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1 border-t border-border pt-1.5">
                {["p1", "p11", "p18"].map((id) => {
                  const paper = papersById[id];
                  return paper ? (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 rounded-[2px] border border-border bg-surface/40 px-1 py-0.5 font-mono text-[4px] uppercase text-muted-foreground"
                    >
                      <FileText className="size-1.5" /> {paper.authors[0]?.name.split(" ").slice(-1)}
                    </span>
                  ) : null;
                })}
              </div>
            </div>

            <aside className="hidden border-l border-border p-2 sm:block">
              <p className="font-mono text-[4.5px] uppercase tracking-[0.12em] text-muted-foreground">
                Evidence
              </p>
              <ul className="mt-1 space-y-1.5">
                {evidence.map((paper) => {
                  if (!paper) return null;
                  return (
                    <li key={paper.id}>
                      <p className="line-clamp-2 font-serif text-[5.5px] font-medium leading-tight">
                        {paper.title}
                      </p>
                      <p className="mt-0.5 font-mono text-[4px] uppercase text-muted-foreground">
                        {paper.authors[0]?.name} · {paper.year}
                      </p>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-2 border-t border-border pt-1.5">
                <p className="font-mono text-[4px] uppercase text-muted-foreground">Sections</p>
                <p className="mt-0.5 font-display text-[9px] font-semibold tabular-nums">6</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </PreviewFrame>
  );
}

export function GapPreview({ className }: { className?: string }) {
  const topics = ["rt1", "rt2", "rt3", "rt6", "rt7"]
    .map((id) => researchTopics.find((topic) => topic.id === id))
    .filter(Boolean);
  const selected = researchTopics.find((topic) => topic.id === "rt6")!;
  const max = Math.max(...topics.map((topic) => topic?.paperCount ?? 0));
  const evidence = selected.paperIds.map((id) => papersById[id]).filter(Boolean);

  return (
    <PreviewFrame
      path="/research-gaps"
      className={className}
      description="Research gap explorer showing topic distribution, a potential opportunity, and its supporting evidence with a caution that absence is not proof of a gap."
    >
      <div className="p-2.5 sm:p-3.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <PreviewLabel>Research intelligence</PreviewLabel>
            <h3 className="mt-0.5 font-display text-[10px] font-semibold sm:text-[12px]">
              Research gap explorer
            </h3>
            <p className="mt-0.5 text-[5.5px] text-muted-foreground sm:text-[6.5px]">
              Topic density and momentum across your saved corpus.
            </p>
          </div>
          <MiniTag tone="forest">Corpus analysis</MiniTag>
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px]">
          <div className="overflow-hidden rounded-[3px] border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
              <span className="text-[6.5px] font-semibold">Output by topic</span>
              <span className="font-mono text-[4.5px] uppercase text-muted-foreground">
                Total / recent
              </span>
            </div>
            <ul className="space-y-1.5 p-2">
              {topics.map((topic) => {
                if (!topic) return null;
                const isSelected = topic.id === selected.id;
                return (
                  <li key={topic.id}>
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={cn(
                          "truncate text-[5px] sm:text-[5.8px]",
                          isSelected ? "font-medium text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {topic.name}
                      </span>
                      <span className="shrink-0 font-mono text-[4.5px] tabular-nums text-muted-foreground">
                        {topic.paperCount} / {topic.recentCount}
                      </span>
                    </div>
                    <div className="mt-0.5 flex gap-0.5">
                      <span className="h-1.5 rounded-[1px] bg-primary/70" style={{ width: `${(topic.paperCount / max) * 72}%` }} />
                      <span className="h-1.5 rounded-[1px] bg-accent/60" style={{ width: `${(topic.recentCount / max) * 40}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-border bg-warning/[0.05] px-2 py-1.5">
              <p className="text-[4.8px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-warning">Potential opportunity is not a verified gap.</span>{" "}
                Low output may reflect method, funding, ethics, or deliberate exclusion.
              </p>
            </div>
          </div>

          <aside className="rounded-[3px] border border-border bg-card p-2">
            <div className="flex items-center justify-between gap-1">
              <MiniTag tone="warning">Potential opportunity</MiniTag>
              <span className="font-mono text-[4.5px] text-success">+{selected.momentum}%</span>
            </div>
            <h4 className="mt-1 font-display text-[7px] font-semibold leading-tight sm:text-[8px]">
              {selected.name}
            </h4>
            <p className="mt-0.5 font-mono text-[4px] uppercase text-muted-foreground">
              {selected.cluster}
            </p>
            <p className="mt-1 line-clamp-3 text-[5px] leading-relaxed text-muted-foreground sm:text-[5.5px]">
              {selected.description}
            </p>
            <div className="mt-1.5 grid grid-cols-3 gap-1 border-y border-border py-1 text-center">
              {[
                { label: "Papers", value: selected.paperCount },
                { label: "Recent", value: selected.recentCount },
                { label: "Momentum", value: `+${selected.momentum}%` },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-mono text-[3.5px] uppercase text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-[6.5px] font-semibold tabular-nums">{stat.value}</p>
                </div>
              ))}
            </div>
            <p className="mt-1 font-mono text-[4px] uppercase tracking-wide text-muted-foreground">
              Evidence
            </p>
            <ul className="mt-0.5 space-y-0.5">
              {evidence.map((paper) => {
                if (!paper) return null;
                return (
                  <li key={paper.id} className="line-clamp-1 text-[4.8px] text-muted-foreground">
                    {paper.authors[0]?.name} ({paper.year}) · {paper.venueShort}
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </div>
    </PreviewFrame>
  );
}

export function CitationPreview({ className }: { className?: string }) {
  const paper = papersById["p1"]!;
  const styles = [
    { id: "apa", label: "APA 7" },
    { id: "mla", label: "MLA 9" },
    { id: "ieee", label: "IEEE" },
    { id: "chicago", label: "Chicago 17" },
  ] as const;

  return (
    <PreviewFrame
      path="/citations"
      className={className}
      description="Citation generator showing the same paper formatted in APA, MLA, IEEE, and Chicago styles."
    >
      <div className="p-2.5 sm:p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <PreviewLabel>Writing</PreviewLabel>
            <h3 className="mt-0.5 font-display text-[10px] font-semibold sm:text-[12px]">
              Citation generator
            </h3>
            <p className="mt-0.5 line-clamp-1 text-[5.5px] text-muted-foreground">
              {paper.title}
            </p>
          </div>
          <MiniTag tone="forest">4 styles</MiniTag>
        </div>

        <div className="mt-2 flex gap-1 border-b border-border pb-1">
          {styles.map((style, index) => (
            <span
              key={style.id}
              className={cn(
                "rounded-[2px] px-1.5 py-0.5 font-mono text-[4.8px] uppercase tracking-wide",
                index === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              {style.label}
            </span>
          ))}
        </div>

        <ul className="mt-2 space-y-1.5">
          {styles.map((style) => (
            <li key={style.id} className="rounded-[3px] border border-border bg-card p-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[4.5px] uppercase tracking-[0.1em] text-muted-foreground">
                  {style.label}
                </span>
                <span className="font-mono text-[4px] uppercase text-primary">Copy</span>
              </div>
              <p className="mt-1 text-[5px] leading-[1.65] text-foreground/80 sm:text-[5.8px]">
                {generateCitation(paper, style.id)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-1.5 flex flex-wrap items-center gap-1 border-t border-border pt-1.5 font-mono text-[4px] uppercase tracking-wide text-muted-foreground">
          <span>DOI {paper.doi}</span>
          <span className="text-border">/</span>
          <span>{paper.venueShort}</span>
          <span className="ml-auto flex items-center gap-1 text-success">
            <BookmarkCheck className="size-1.5" /> Reference saved
          </span>
        </div>
      </div>
    </PreviewFrame>
  );
}
