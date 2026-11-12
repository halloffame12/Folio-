/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Author, CitationStyle, Collection, LibraryEntry, LiteratureReview, ReviewSection, Milestone, MilestoneStatus, Note, Paper, Project, ProjectMember, ProjectStatus, ReadingStatus, Task, TaskComment, TaskPriority, TaskStatus, User, WorkspaceRole } from "@/types";

export function toUser(user: { id: string; name: string; email: string; createdAt: Date; profile?: { institution: string | null; role: string | null; department: string | null; researchInterests: string[]; orcid: string | null; avatarUrl: string | null } | null; settings?: unknown }): User {
  const p = user.profile;
  const settings = (user.settings ?? {}) as Record<string, unknown>;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    affiliation: p?.institution ?? "",
    title: p?.role ? p.role : "",
    researchInterests: p?.researchInterests ?? [],
    orcid: p?.orcid ?? undefined,
    initials: user.name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join(""),
    avatarUrl: p?.avatarUrl ?? undefined,
    joinedAt: user.createdAt.toISOString(),
  };
}

export function toPaper(paper: {
  id: string; title: string; abstract: string | null; year: number | null; venue: string | null; venueShort: string | null;
  publicationType: string; citationCount: number; keywords: string[]; pdfAvailable: boolean; sourceUrl: string | null;
  volume: string | null; issue: string | null; pages: string | null; publisher: string | null; openAccess: boolean;
  authors: { id: string; name: string; affiliation: string | null; orcid: string | null; position: number }[];
  identifiers: { type: string; value: string }[];
}): Paper {
  const pubType = paper.publicationType === "book_chapter" ? "book-chapter" : paper.publicationType;
  const doiIdent = paper.identifiers.find((i) => i.type === "doi");
  const sourceUrl = paper.sourceUrl ?? (doiIdent ? `https://doi.org/${doiIdent.value}` : "");
  return {
    id: paper.id,
    title: paper.title,
    authors: paper.authors
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((a) => ({ id: a.id, name: a.name, affiliation: a.affiliation ?? "", orcid: a.orcid ?? undefined })),
    abstract: paper.abstract ?? "",
    year: paper.year ?? 0,
    venue: paper.venue ?? "",
    venueShort: paper.venueShort ?? paper.venue ?? "",
    publicationType: (pubType as Paper["publicationType"]) ?? "journal",
    doi: doiIdent?.value ?? paper.identifiers.find((i) => i.type === "doi")?.value ?? "",
    citationCount: paper.citationCount,
    keywords: paper.keywords,
    pdfAvailable: paper.pdfAvailable,
    sourceUrl,
    volume: paper.volume ?? undefined,
    issue: paper.issue ?? undefined,
    pages: paper.pages ?? undefined,
    publisher: paper.publisher ?? undefined,
    openAccess: paper.openAccess,
  };
}

export function toLibraryEntry(e: { id: string; paperId: string; status: string; readingProgress: number; addedAt: Date; lastOpenedAt: Date | null; tags?: { tag: { name: string } }[] }): LibraryEntry {
  return {
    id: e.id,
    paperId: e.paperId,
    status: e.status as ReadingStatus,
    tags: e.tags?.map((t) => t.tag.name) ?? [],
    addedAt: e.addedAt.toISOString(),
    lastOpenedAt: e.lastOpenedAt?.toISOString(),
    readingProgress: e.readingProgress,
  };
}

export function toCollection(c: { id: string; name: string; description: string; color: string; createdAt: Date; updatedAt: Date; papers?: { paperId: string }[] }): Collection {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    paperIds: c.papers?.map((p) => p.paperId) ?? [],
    color: c.color as Collection["color"],
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export function toProject(p: {
  id: string; title: string; description: string; status: string; ownerId: string; progress: number;
  deadline: Date | null; tag: string; accent: string; createdAt: Date; updatedAt: Date;
  members: { id: string; userId: string | null; role: string; status: string; joinedAt: Date; invitedName: string | null; invitedEmail: string | null }[];
  papers?: { paperId: string }[];
}): Project {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    status: p.status as ProjectStatus,
    ownerId: p.ownerId,
    members: p.members.map((m) => ({
      id: m.id,
      userId: m.userId ?? m.invitedEmail ?? m.id,
      role: m.role as WorkspaceRole,
      status: m.status as "active" | "invited",
      joinedAt: m.joinedAt.toISOString(),
      name: m.invitedName ?? undefined,
      email: m.invitedEmail ?? undefined,
    })),
    progress: p.progress,
    deadline: p.deadline?.toISOString() ?? "",
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    paperIds: p.papers?.map((x) => x.paperId) ?? [],
    tag: p.tag,
    accent: p.accent as Project["accent"],
  };
}

export function toTask(t: {
  id: string; projectId: string; title: string; description: string; status: string; priority: string;
  assigneeId: string | null; dueDate: Date | null; createdAt: Date; updatedAt: Date;
  paperIds?: string[]; milestoneId?: string | null;
  comments: { id: string; authorId: string; body: string; createdAt: Date }[];
  papers?: { paperId: string }[];
  milestone?: { milestoneId: string } | null;
}): Task {
  return {
    id: t.id,
    projectId: t.projectId,
    title: t.title,
    description: t.description,
    status: t.status.replace("_", "-") as TaskStatus,
    priority: t.priority as TaskPriority,
    assigneeId: t.assigneeId ?? "",
    dueDate: t.dueDate?.toISOString() ?? "",
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    paperIds: t.papers?.map((x) => x.paperId) ?? [],
    milestoneId: t.milestone?.milestoneId,
    comments: t.comments.map((c) => ({ id: c.id, authorId: c.authorId, body: c.body, createdAt: c.createdAt.toISOString() })),
  };
}

export function toMilestone(m: { id: string; projectId: string; title: string; description: string; dueDate: Date | null; status: string; progress: number; assignees?: { userId: string }[] }): Milestone {
  return {
    id: m.id,
    projectId: m.projectId,
    title: m.title,
    description: m.description,
    dueDate: m.dueDate?.toISOString() ?? "",
    status: m.status.replace("_", "-") as MilestoneStatus,
    progress: m.progress,
    assigneeIds: m.assignees?.map((a) => a.userId) ?? [],
  };
}

export function toNote(n: { id: string; title: string; content: string; pinned: boolean; projectId: string | null; createdAt: Date; updatedAt: Date; papers?: { paperId: string }[]; tags?: { tag: { name: string } }[] }): Note {
  return {
    id: n.id,
    title: n.title,
    content: n.content,
    tags: n.tags?.map((t) => t.tag.name) ?? [],
    pinned: n.pinned,
    paperIds: n.papers?.map((p) => p.paperId) ?? [],
    projectId: n.projectId ?? undefined,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  };
}

export function toLitReviewSection(s: { id: string; title: string; content: string; position: number; children?: any[]; papers?: { paperId: string }[]; noteLinks?: { noteId: string }[] }): ReviewSection {
  return {
    id: s.id,
    title: s.title,
    content: s.content,
    subsections: (s.children ?? []).map((c) => toLitReviewSection(c)),
    paperIds: s.papers?.map((p) => p.paperId) ?? [],
    noteIds: s.noteLinks?.map((n) => n.noteId) ?? [],
  };
}

export function toLitReview(r: { id: string; projectId: string | null; title: string; researchQuestion: string; progress: number; createdAt: Date; updatedAt: Date; sections: any[]; papers?: { paperId: string }[]; notes?: { noteId: string }[] }): LiteratureReview {
  return {
    id: r.id,
    projectId: r.projectId ?? "",
    title: r.title,
    researchQuestion: r.researchQuestion,
    sections: r.sections.map((s) => toLitReviewSection(s)),
    paperIds: r.papers?.map((p) => p.paperId) ?? [],
    noteIds: r.notes?.map((n) => n.noteId) ?? [],
    progress: r.progress,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export function toCitationStyle(s: string): CitationStyle {
  return s as CitationStyle;
}
