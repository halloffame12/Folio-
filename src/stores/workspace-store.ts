/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { create } from "zustand";
import type {
  Collection,
  LiteratureReview,
  Milestone,
  Note,
  Project,
  ReadingStatus,
  ReviewSection,
  Task,
  TaskComment,
  TaskStatus,
  User,
  WorkspaceData,
  WorkspaceSettings,
} from "@/types";
import { apiFetch, apiMutate } from "@/lib/api-client";
import { syncWorkspace, registerTags } from "@/lib/client-registry";

const emptyData = (): WorkspaceData => ({
  library: [],
  collections: [],
  notes: [],
  projects: [],
  tasks: [],
  milestones: [],
  literatureReviews: [],
  notifications: [],
  activity: [],
});

const defaultSettings: WorkspaceSettings = {
  citationStyle: "apa",
  emailNotifications: true,
  projectUpdates: true,
  deadlineReminders: true,
  weeklyDigest: false,
  compactTables: false,
  reducedMotion: false,
};

interface WorkspaceState {
  data: WorkspaceData;
  profile: User;
  settings: WorkspaceSettings;
  sidebarCollapsed: boolean;
  hydrated: boolean;
  loading: boolean;

  hydrate: () => Promise<void>;
  setHydrated: (hydrated: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  savePaper: (paperId: string) => Promise<boolean>;
  removePaper: (paperId: string) => Promise<void>;
  updateReadingStatus: (paperId: string, status: ReadingStatus) => void;
  updateReadingProgress: (paperId: string, progress: number) => void;
  togglePaperTag: (paperId: string, tag: string) => void;
  markPaperOpened: (paperId: string) => void;

  createCollection: (input: { name: string; description: string; color: Collection["color"] }) => Promise<Collection>;
  updateCollection: (id: string, patch: Partial<Pick<Collection, "name" | "description" | "color">>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  addPaperToCollection: (collectionId: string, paperId: string) => Promise<void>;
  removePaperFromCollection: (collectionId: string, paperId: string) => void;

  createNote: (input: { title: string; content: string; tags: string[]; paperIds: string[]; projectId?: string }) => Promise<Note>;
  updateNote: (id: string, patch: Partial<Pick<Note, "title" | "content" | "tags" | "paperIds" | "projectId">>) => void;
  deleteNote: (id: string) => Promise<void>;
  toggleNotePin: (id: string) => void;

  createProject: (input: { title: string; description: string; deadline: string; tag: string; ownerId: string }) => Promise<Project>;
  updateProject: (id: string, patch: Partial<Pick<Project, "title" | "description" | "status" | "deadline" | "progress" | "tag" | "accent" | "paperIds">>) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  inviteMember: (input: { projectId: string; email: string; name?: string; role: "Admin" | "Member" }) => Promise<void>;
  updateMemberRole: (projectId: string, memberId: string, role: "Admin" | "Member" | "Owner") => Promise<void>;
  removeMember: (projectId: string, memberId: string) => Promise<void>;

  createTask: (input: { projectId: string; title: string; description: string; status: TaskStatus; priority: Task["priority"]; assigneeId: string; dueDate: string; paperIds: string[]; milestoneId?: string }) => Promise<Task>;
  updateTask: (id: string, patch: Partial<Pick<Task, "title" | "description" | "priority" | "assigneeId" | "dueDate" | "paperIds" | "milestoneId" | "projectId">>) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addTaskComment: (taskId: string, body: string) => Promise<TaskComment>;

  createMilestone: (input: { projectId: string; title: string; description: string; dueDate: string; assigneeIds: string[] }) => Promise<Milestone>;
  updateMilestone: (id: string, patch: Partial<Pick<Milestone, "title" | "description" | "dueDate" | "assigneeIds" | "progress" | "status">>) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;

  updateReviewSection: (reviewId: string, sectionId: string, content: string) => void;
  updateReviewSources: (reviewId: string, patch: { paperIds?: string[]; noteIds?: string[] }) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;

  updateProfile: (patch: Partial<Pick<User, "name" | "email" | "affiliation" | "title" | "researchInterests" | "orcid" | "initials">>) => void;
  updateSettings: (patch: Partial<WorkspaceSettings>) => void;
  resetWorkspace: () => void;
}

function mapSections(sections: ReviewSection[], sectionId: string, content: string): ReviewSection[] {
  return sections.map((section) => {
    if (section.id === sectionId) return { ...section, content };
    return { ...section, subsections: mapSections(section.subsections, sectionId, content) };
  });
}

export const useWorkspaceStore = create<WorkspaceState>()((set, get) => ({
  data: emptyData(),
  profile: {
    id: "",
    name: "",
    email: "",
    affiliation: "",
    title: "",
    researchInterests: [],
    initials: "",
    joinedAt: new Date().toISOString(),
  },
  settings: { ...defaultSettings },
  sidebarCollapsed: false,
  hydrated: false,
  loading: false,

  hydrate: async () => {
    set({ loading: true });
    try {
      const ws = await apiFetch<any>("/api/workspace");
      syncWorkspace({ papers: ws.papers, members: ws.members });
      try {
        const tags = await apiFetch<string[]>("/api/tags");
        registerTags(tags || []);
      } catch {}
      set({
        data: ws.data,
        profile: ws.profile,
        settings: { ...defaultSettings, ...(ws.settings || {}) },
        hydrated: true,
        loading: false,
      });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  setHydrated: (hydrated) => set({ hydrated }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  savePaper: async (paperId) => {
    const res = await apiMutate<any>("/api/library", "POST", { paperId });
    await get().hydrate();
    return true;
  },

  removePaper: async (paperId) => {
    // find entry id
    const entry = get().data.library.find((e) => e.paperId === paperId);
    if (entry) await apiMutate(`/api/library/${entry.id}`, "DELETE");
    await get().hydrate();
  },

  updateReadingStatus: (paperId, status) => {
    const entry = get().data.library.find((e) => e.paperId === paperId);
    if (!entry) return;
    set((s) => ({
      data: { ...s.data, library: s.data.library.map((e) => (e.paperId === paperId ? { ...e, status, readingProgress: status === "completed" ? 100 : e.readingProgress } : e)) },
    }));
    void apiMutate(`/api/library/${entry.id}`, "PATCH", { status }).then(() => get().hydrate()).catch(() => get().hydrate());
  },

  updateReadingProgress: (paperId, progress) => {
    const entry = get().data.library.find((e) => e.paperId === paperId);
    if (!entry) return;
    set((s) => ({
      data: { ...s.data, library: s.data.library.map((e) => (e.paperId === paperId ? { ...e, readingProgress: progress, status: progress >= 100 ? "completed" : progress > 0 ? "reading" : "unread" } : e)) },
    }));
    void apiMutate(`/api/library/${entry.id}`, "PATCH", { readingProgress: progress }).then(() => get().hydrate()).catch(() => get().hydrate());
  },

  togglePaperTag: (paperId, tag) => {
    const entry = get().data.library.find((e) => e.paperId === paperId);
    if (!entry) return;
    const newTags = entry.tags.includes(tag) ? entry.tags.filter((t) => t !== tag) : [...entry.tags, tag];
    set((s) => ({
      data: { ...s.data, library: s.data.library.map((e) => (e.paperId === paperId ? { ...e, tags: newTags } : e)) },
    }));
    void apiMutate(`/api/library/${entry.id}`, "PATCH", { tags: newTags }).then(() => get().hydrate()).catch(() => get().hydrate());
  },

  markPaperOpened: (paperId) => {
    const entry = get().data.library.find((e) => e.paperId === paperId);
    if (!entry) return;
    void apiMutate(`/api/library/${entry.id}`, "PATCH", { lastOpenedAt: new Date().toISOString() }).catch(() => {});
  },

  createCollection: async (input) => {
    const col = await apiMutate<Collection>("/api/collections", "POST", input);
    await get().hydrate();
    return col;
  },

  updateCollection: async (id, patch) => {
    await apiMutate(`/api/collections/${id}`, "PATCH", patch);
    await get().hydrate();
  },

  deleteCollection: async (id) => {
    await apiMutate(`/api/collections/${id}`, "DELETE");
    await get().hydrate();
  },

  addPaperToCollection: async (collectionId, paperId) => {
    await apiMutate(`/api/collections/${collectionId}/papers`, "POST", { paperId });
    await get().hydrate();
  },

  removePaperFromCollection: (collectionId, paperId) => {
    void apiMutate(`/api/collections/${collectionId}/papers?paperId=${encodeURIComponent(paperId)}`, "DELETE").then(() => get().hydrate()).catch(() => get().hydrate());
    // optimistic
    set((s) => ({
      data: { ...s.data, collections: s.data.collections.map((c) => (c.id === collectionId ? { ...c, paperIds: c.paperIds.filter((id) => id !== paperId) } : c)) },
    }));
  },

  createNote: async (input) => {
    const note = await apiMutate<Note>("/api/notes", "POST", input);
    await get().hydrate();
    return note;
  },

  updateNote: (id, patch) => {
    set((s) => ({
      data: { ...s.data, notes: s.data.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n)) },
    }));
    void apiMutate(`/api/notes/${id}`, "PATCH", patch).then(() => get().hydrate()).catch(() => get().hydrate());
  },

  deleteNote: async (id) => {
    await apiMutate(`/api/notes/${id}`, "DELETE");
    await get().hydrate();
  },

  toggleNotePin: (id) => {
    const note = get().data.notes.find((n) => n.id === id);
    if (!note) return;
    set((s) => ({ data: { ...s.data, notes: s.data.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)) } }));
    void apiMutate(`/api/notes/${id}`, "PATCH", { pinned: !note.pinned }).then(() => get().hydrate()).catch(() => get().hydrate());
  },

  createProject: async (input) => {
    const project = await apiMutate<Project>("/api/projects", "POST", { title: input.title, description: input.description, deadline: input.deadline, tag: input.tag });
    await get().hydrate();
    return project;
  },

  updateProject: async (id, patch) => {
    await apiMutate(`/api/projects/${id}`, "PATCH", patch);
    await get().hydrate();
  },

  archiveProject: async (id) => {
    await apiMutate(`/api/projects/${id}`, "PATCH", { status: "archived" });
    await get().hydrate();
  },

  inviteMember: async ({ projectId, email, name, role }) => {
    await apiMutate(`/api/projects/${projectId}/members`, "POST", { email, name, role });
    await get().hydrate();
  },

  updateMemberRole: async (projectId, memberId, role) => {
    await apiMutate(`/api/projects/${projectId}/members/${memberId}`, "PATCH", { role });
    await get().hydrate();
  },

  removeMember: async (projectId, memberId) => {
    await apiMutate(`/api/projects/${projectId}/members/${memberId}`, "DELETE");
    await get().hydrate();
  },

  createTask: async (input) => {
    const task = await apiMutate<Task>(`/api/projects/${input.projectId}/tasks`, "POST", {
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      assigneeId: input.assigneeId,
      dueDate: input.dueDate,
      paperIds: input.paperIds,
      milestoneId: input.milestoneId,
    });
    await get().hydrate();
    return task;
  },

  updateTask: async (id, patch) => {
    await apiMutate(`/api/tasks/${id}`, "PATCH", patch);
    await get().hydrate();
  },

  updateTaskStatus: async (id, status) => {
    await apiMutate(`/api/tasks/${id}`, "PATCH", { status });
    await get().hydrate();
  },

  deleteTask: async (id) => {
    await apiMutate(`/api/tasks/${id}`, "DELETE");
    await get().hydrate();
  },

  addTaskComment: async (taskId, body) => {
    const comment = await apiMutate<TaskComment>(`/api/tasks/${taskId}/comments`, "POST", { body });
    await get().hydrate();
    return comment;
  },

  createMilestone: async (input) => {
    const m = await apiMutate<Milestone>(`/api/projects/${input.projectId}/milestones`, "POST", {
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      assigneeIds: input.assigneeIds,
    });
    await get().hydrate();
    return m;
  },

  updateMilestone: async (id, patch) => {
    await apiMutate(`/api/milestones/${id}`, "PATCH", patch);
    await get().hydrate();
  },

  deleteMilestone: async (id) => {
    await apiMutate(`/api/milestones/${id}`, "DELETE");
    await get().hydrate();
  },

  updateReviewSection: (reviewId, sectionId, content) => {
    set((s) => ({
      data: { ...s.data, literatureReviews: s.data.literatureReviews.map((r) => (r.id === reviewId ? { ...r, sections: mapSections(r.sections, sectionId, content), updatedAt: new Date().toISOString() } : r)) },
    }));
    void apiMutate(`/api/literature-reviews/${reviewId}`, "PATCH", { sectionUpdate: { sectionId, content } }).then(() => get().hydrate()).catch(() => get().hydrate());
  },

  updateReviewSources: (reviewId, patch) => {
    set((s) => ({
      data: { ...s.data, literatureReviews: s.data.literatureReviews.map((r) => (r.id === reviewId ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r)) },
    }));
    void apiMutate(`/api/literature-reviews/${reviewId}`, "PATCH", patch).then(() => get().hydrate()).catch(() => get().hydrate());
  },

  markNotificationRead: (id) => {
    set((s) => ({ data: { ...s.data, notifications: s.data.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) } }));
    void apiMutate("/api/notifications", "PATCH", { id }).catch(() => {});
  },

  markAllNotificationsRead: () => {
    set((s) => ({ data: { ...s.data, notifications: s.data.notifications.map((n) => ({ ...n, read: true })) } }));
    void apiMutate("/api/notifications", "PATCH", { all: true }).catch(() => {});
  },

  deleteNotification: (id) => {
    set((s) => ({ data: { ...s.data, notifications: s.data.notifications.filter((n) => n.id !== id) } }));
  },

  updateProfile: (patch) => {
    set((s) => ({ profile: { ...s.profile, ...patch } }));
    const body: any = {};
    if (patch.name) body.name = patch.name;
    if (patch.email) body.email = patch.email;
    if (patch.affiliation) body.affiliation = patch.affiliation;
    if (patch.title) body.title = patch.title;
    if (patch.researchInterests) body.researchInterests = patch.researchInterests;
    if (patch.orcid) body.orcid = patch.orcid;
    void apiMutate("/api/users/me", "PATCH", body).then(() => get().hydrate()).catch(() => get().hydrate());
  },

  updateSettings: (patch) => {
    set((s) => ({ settings: { ...s.settings, ...patch } }));
    void apiMutate("/api/users/me", "PATCH", { settings: { ...get().settings } }).catch(() => {});
  },

  resetWorkspace: () => {
    set({ data: emptyData(), profile: get().profile, settings: { ...defaultSettings } });
  },
}));
