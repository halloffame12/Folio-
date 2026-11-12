export type WorkspaceRole = "Owner" | "Admin" | "Member";

export interface User {
  id: string;
  name: string;
  email: string;
  affiliation: string;
  title: string;
  researchInterests: string[];
  orcid?: string;
  initials: string;
  avatarUrl?: string;
  joinedAt: string;
}

export interface Author {
  id: string;
  name: string;
  affiliation: string;
  orcid?: string;
}

export type PublicationType = "journal" | "conference" | "preprint" | "book-chapter";

export interface Paper {
  id: string;
  title: string;
  authors: Author[];
  abstract: string;
  year: number;
  venue: string;
  venueShort: string;
  publicationType: PublicationType;
  doi: string;
  citationCount: number;
  keywords: string[];
  pdfAvailable: boolean;
  sourceUrl: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  openAccess?: boolean;
}

export type ReadingStatus = "unread" | "reading" | "completed";

export interface LibraryEntry {
  id: string;
  paperId: string;
  status: ReadingStatus;
  tags: string[];
  addedAt: string;
  lastOpenedAt?: string;
  readingProgress?: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  paperIds: string[];
  color: "forest" | "terracotta" | "sand" | "sage" | "ink";
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = "active" | "planning" | "completed" | "archived";

export interface ProjectMember {
  id: string;
  userId: string;
  role: WorkspaceRole;
  status: "active" | "invited";
  joinedAt: string;
  /** Captured for invitations to people outside the current workspace directory. */
  name?: string;
  email?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  ownerId: string;
  members: ProjectMember[];
  progress: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  paperIds: string[];
  tag: string;
  accent: "forest" | "terracotta" | "sand" | "sage";
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  paperIds: string[];
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "todo" | "in-progress" | "in-review" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface TaskComment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  paperIds: string[];
  milestoneId?: string;
  comments: TaskComment[];
}

export type MilestoneStatus = "upcoming" | "in-progress" | "at-risk" | "completed";

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  status: MilestoneStatus;
  progress: number;
  assigneeIds: string[];
}

export interface ReviewSection {
  id: string;
  title: string;
  content: string;
  subsections: ReviewSection[];
  paperIds: string[];
  noteIds: string[];
}

export interface LiteratureReview {
  id: string;
  projectId: string;
  title: string;
  researchQuestion: string;
  sections: ReviewSection[];
  paperIds: string[];
  noteIds: string[];
  progress: number;
  updatedAt: string;
  createdAt: string;
}

export interface ResearchTopic {
  id: string;
  name: string;
  cluster: string;
  paperCount: number;
  recentCount: number;
  momentum: number;
  keywords: string[];
  paperIds: string[];
  description: string;
  opportunity: "established" | "emerging" | "underrepresented";
  /** Illustrative annual output for 2020–2026 in the demo index. */
  trend?: number[];
}

export interface Notification {
  id: string;
  type: "invitation" | "assignment" | "deadline" | "milestone" | "mention" | "system";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
  actorId?: string;
  projectId?: string;
}

export interface ActivityItem {
  id: string;
  actorId: string;
  action: string;
  target: string;
  href?: string;
  createdAt: string;
  projectId?: string;
  kind: "paper" | "note" | "task" | "milestone" | "comment" | "project" | "member";
}

export type CitationStyle = "apa" | "mla" | "ieee" | "chicago";

export interface Citation {
  paperId: string;
  style: CitationStyle;
  text: string;
  generatedAt: string;
}

export interface WorkspaceSettings {
  citationStyle: CitationStyle;
  emailNotifications: boolean;
  projectUpdates: boolean;
  deadlineReminders: boolean;
  weeklyDigest: boolean;
  compactTables: boolean;
  reducedMotion: boolean;
}

export interface WorkspaceData {
  library: LibraryEntry[];
  collections: Collection[];
  notes: Note[];
  projects: Project[];
  tasks: Task[];
  milestones: Milestone[];
  literatureReviews: LiteratureReview[];
  notifications: Notification[];
  activity: ActivityItem[];
}

export interface PaperSearchFilters {
  query?: string;
  scope?: "all" | "title" | "author" | "doi" | "keyword";
  yearFrom?: string;
  yearTo?: string;
  author?: string;
  type?: PublicationType | "all";
  openAccessOnly?: boolean;
  sort?: "relevance" | "citations" | "newest" | "oldest";
}
