import type {
  Author,
  CitationStyle,
  Collection,
  LibraryEntry,
  Milestone,
  Note,
  Paper,
  PaperSearchFilters,
  Project,
  Task,
  User,
} from "@/types";
import { papers, papersById } from "@/mocks/data";

export function simulateLatency(ms = 320) {
  return new Promise<void>((resolve) => {
    if (typeof window === "undefined") return resolve();
    window.setTimeout(resolve, ms);
  });
}

export function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function getPapers(): Paper[] {
  return papers;
}

export function getPaperById(id: string): Paper | undefined {
  return papersById[id];
}

export function getAuthors(): Author[] {
  const map = new Map<string, Author>();
  papers.forEach((paper) =>
    paper.authors.forEach((author) => map.set(author.id, author))
  );
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function getPaperYears(): number[] {
  return Array.from(new Set(papers.map((p) => p.year))).sort((a, b) => b - a);
}

function relevanceScore(paper: Paper, query: string) {
  const q = query.toLowerCase();
  let score = 0;
  if (paper.title.toLowerCase().startsWith(q)) score += 12;
  if (paper.title.toLowerCase().includes(q)) score += 8;
  if (paper.authors.some((a) => a.name.toLowerCase().includes(q))) score += 6;
  if (paper.keywords.some((k) => k.toLowerCase().includes(q))) score += 5;
  if (paper.doi.toLowerCase().includes(q)) score += 7;
  if (paper.abstract.toLowerCase().includes(q)) score += 2;
  if (paper.venue.toLowerCase().includes(q)) score += 3;
  return score;
}

export function filterPapers(filters: PaperSearchFilters): Paper[] {
  const q = filters.query?.trim() ?? "";
  const authorQuery = filters.author?.trim().toLowerCase() ?? "";
  let results = [...papers];

  if (q) {
    const lower = q.toLowerCase();
    const scope = filters.scope ?? "all";
    results = results.filter((paper) => {
      if (scope === "title") return paper.title.toLowerCase().includes(lower);
      if (scope === "author")
        return paper.authors.some((a) => a.name.toLowerCase().includes(lower));
      if (scope === "doi") return paper.doi.toLowerCase().includes(lower);
      if (scope === "keyword")
        return paper.keywords.some((k) => k.toLowerCase().includes(lower));
      const haystack = [
        paper.title,
        paper.abstract,
        paper.doi,
        paper.venue,
        paper.keywords.join(" "),
        paper.authors.map((a) => a.name).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(lower);
    });
  }

  if (authorQuery) {
    results = results.filter((paper) =>
      paper.authors.some((author) =>
        author.name.toLowerCase().includes(authorQuery)
      )
    );
  }

  if (filters.yearFrom) {
    const from = Number(filters.yearFrom);
    if (!Number.isNaN(from)) results = results.filter((p) => p.year >= from);
  }
  if (filters.yearTo) {
    const to = Number(filters.yearTo);
    if (!Number.isNaN(to)) results = results.filter((p) => p.year <= to);
  }
  if (filters.type && filters.type !== "all") {
    results = results.filter((p) => p.publicationType === filters.type);
  }
  if (filters.openAccessOnly) {
    results = results.filter((p) => p.openAccess);
  }

  switch (filters.sort) {
    case "citations":
      results.sort((a, b) => b.citationCount - a.citationCount);
      break;
    case "newest":
      results.sort((a, b) => b.year - a.year);
      break;
    case "oldest":
      results.sort((a, b) => a.year - b.year);
      break;
    default:
      if (q) {
        results.sort(
          (a, b) =>
            relevanceScore(b, q) - relevanceScore(a, q) ||
            b.citationCount - a.citationCount
        );
      } else {
        results.sort((a, b) => b.citationCount - a.citationCount);
      }
  }

  return results;
}

export async function searchPapers(filters: PaperSearchFilters) {
  await simulateLatency(420);
  return filterPapers(filters);
}

export async function fetchPaper(id: string) {
  await simulateLatency(180);
  return getPaperById(id);
}

// ---- Record factories (the mock write boundary) ---------------------------

export async function savePaperRecord(paperId: string): Promise<LibraryEntry> {
  await simulateLatency(260);
  return {
    id: makeId("l"),
    paperId,
    status: "unread",
    tags: [],
    addedAt: new Date().toISOString(),
    lastOpenedAt: new Date().toISOString(),
    readingProgress: 0,
  };
}

export async function createCollectionRecord(input: {
  name: string;
  description: string;
  color: Collection["color"];
}): Promise<Collection> {
  await simulateLatency(300);
  const iso = new Date().toISOString();
  return {
    id: makeId("c"),
    name: input.name,
    description: input.description,
    paperIds: [],
    color: input.color,
    createdAt: iso,
    updatedAt: iso,
  };
}

export async function createNoteRecord(input: {
  title: string;
  content: string;
  tags: string[];
  paperIds: string[];
  projectId?: string;
}): Promise<Note> {
  await simulateLatency(320);
  const iso = new Date().toISOString();
  return {
    id: makeId("n"),
    title: input.title,
    content: input.content,
    tags: input.tags,
    pinned: false,
    paperIds: input.paperIds,
    projectId: input.projectId,
    createdAt: iso,
    updatedAt: iso,
  };
}

export async function createProjectRecord(input: {
  title: string;
  description: string;
  deadline: string;
  ownerId: string;
  tag: string;
}): Promise<Project> {
  await simulateLatency(360);
  const iso = new Date().toISOString();
  return {
    id: makeId("pr"),
    title: input.title,
    description: input.description,
    status: "planning",
    ownerId: input.ownerId,
    members: [
      {
        id: makeId("pm"),
        userId: input.ownerId,
        role: "Owner",
        status: "active",
        joinedAt: iso,
      },
    ],
    progress: 0,
    deadline: input.deadline,
    createdAt: iso,
    updatedAt: iso,
    paperIds: [],
    tag: input.tag,
    accent: "forest",
  };
}

export async function createTaskRecord(input: {
  projectId: string;
  title: string;
  description: string;
  status: Task["status"];
  priority: Task["priority"];
  assigneeId: string;
  dueDate: string;
  paperIds: string[];
  milestoneId?: string;
}): Promise<Task> {
  await simulateLatency(300);
  const iso = new Date().toISOString();
  return {
    id: makeId("t"),
    projectId: input.projectId,
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    assigneeId: input.assigneeId,
    dueDate: input.dueDate,
    createdAt: iso,
    updatedAt: iso,
    paperIds: input.paperIds,
    milestoneId: input.milestoneId,
    comments: [],
  };
}

export async function createMilestoneRecord(input: {
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  assigneeIds: string[];
}): Promise<Milestone> {
  await simulateLatency(300);
  return {
    id: makeId("m"),
    projectId: input.projectId,
    title: input.title,
    description: input.description,
    dueDate: input.dueDate,
    status: "upcoming",
    progress: 0,
    assigneeIds: input.assigneeIds,
  };
}

export async function inviteMemberRecord(input: {
  userId: string;
  role: "Admin" | "Member";
  name?: string;
  email?: string;
}) {
  await simulateLatency(280);
  return {
    id: makeId("pm"),
    userId: input.userId,
    role: input.role,
    status: "invited" as const,
    joinedAt: new Date().toISOString(),
    name: input.name,
    email: input.email,
  };
}

// ---- Local search index used by the command palette ----------------------

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  group: "Pages" | "Papers" | "Projects" | "Notes" | "Collections";
  href: string;
}

export function buildSearchIndex(input: {
  projects: Project[];
  notes: Note[];
  collections: Collection[];
}): SearchResult[] {
  const pages: SearchResult[] = [
    { id: "page-overview", title: "Overview", subtitle: "Workspace dashboard", group: "Pages", href: "/dashboard" },
    { id: "page-discover", title: "Discover papers", subtitle: "Search scholarly literature", group: "Pages", href: "/discover" },
    { id: "page-library", title: "My Library", subtitle: "Saved papers", group: "Pages", href: "/library" },
    { id: "page-collections", title: "Collections", subtitle: "Curated reading lists", group: "Pages", href: "/collections" },
    { id: "page-notes", title: "Research Notes", subtitle: "Notes and writing", group: "Pages", href: "/notes" },
    { id: "page-projects", title: "Projects", subtitle: "Research projects", group: "Pages", href: "/projects" },
    { id: "page-literature", title: "Literature Review", subtitle: "Review writing workspace", group: "Pages", href: "/literature" },
    { id: "page-gaps", title: "Research Gap Explorer", subtitle: "Topic analysis", group: "Pages", href: "/research-gaps" },
    { id: "page-tasks", title: "Tasks", subtitle: "Task board and list", group: "Pages", href: "/tasks" },
    { id: "page-milestones", title: "Milestones", subtitle: "Project milestones", group: "Pages", href: "/milestones" },
    { id: "page-activity", title: "Team Activity", subtitle: "Recent workspace activity", group: "Pages", href: "/activity" },
    { id: "page-citations", title: "Citation Generator", subtitle: "Generate and export citations", group: "Pages", href: "/citations" },
    { id: "page-notifications", title: "Notifications", subtitle: "Workspace updates", group: "Pages", href: "/notifications" },
    { id: "page-settings", title: "Settings", subtitle: "Profile and preferences", group: "Pages", href: "/settings" },
  ];

  return [
    ...pages,
    ...papers.map((p) => ({
      id: `paper-${p.id}`,
      title: p.title,
      subtitle: `${p.authors[0]?.name ?? "Unknown"} · ${p.year} · ${p.venueShort}`,
      group: "Papers" as const,
      href: `/discover/${p.id}`,
    })),
    ...input.projects.map((p) => ({
      id: `project-${p.id}`,
      title: p.title,
      subtitle: `${p.status} project · ${p.tag}`,
      group: "Projects" as const,
      href: `/projects/${p.id}`,
    })),
    ...input.notes.map((n) => ({
      id: `note-${n.id}`,
      title: n.title,
      subtitle: n.tags.slice(0, 2).join(" · ") || "Research note",
      group: "Notes" as const,
      href: `/notes?note=${n.id}`,
    })),
    ...input.collections.map((c) => ({
      id: `collection-${c.id}`,
      title: c.name,
      subtitle: `${c.paperIds.length} papers`,
      group: "Collections" as const,
      href: `/collections/${c.id}`,
    })),
  ];
}

export function seedCitation(paper: Paper, style: CitationStyle) {
  return { paperId: paper.id, style, text: "", generatedAt: new Date().toISOString() };
}

export function userInitials(user: Pick<User, "name">) {
  return user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}
