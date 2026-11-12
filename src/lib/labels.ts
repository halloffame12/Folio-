import type {
  MilestoneStatus,
  ProjectStatus,
  PublicationType,
  ReadingStatus,
  TaskPriority,
  TaskStatus,
} from "@/types";

export const taskStatusConfig: Record<
  TaskStatus,
  { label: string; tone: string; dot: string }
> = {
  todo: { label: "To Do", tone: "text-muted-foreground", dot: "bg-muted-foreground/50" },
  "in-progress": { label: "In Progress", tone: "text-warning", dot: "bg-warning" },
  "in-review": { label: "In Review", tone: "text-accent", dot: "bg-accent" },
  completed: { label: "Completed", tone: "text-success", dot: "bg-success" },
};

export const taskStatuses: TaskStatus[] = [
  "todo",
  "in-progress",
  "in-review",
  "completed",
];

export const taskPriorityConfig: Record<
  TaskPriority,
  { label: string; badge: "outline" | "success" | "warning" | "destructive" | "secondary" }
> = {
  low: { label: "Low", badge: "outline" },
  medium: { label: "Medium", badge: "secondary" },
  high: { label: "High", badge: "warning" },
  critical: { label: "Critical", badge: "destructive" },
};

export const taskPriorities: TaskPriority[] = ["low", "medium", "high", "critical"];

export const readingStatusConfig: Record<
  ReadingStatus,
  { label: string; badge: "outline" | "warning" | "success"; dot: string }
> = {
  unread: { label: "Unread", badge: "outline", dot: "bg-muted-foreground/50" },
  reading: { label: "Reading", badge: "warning", dot: "bg-warning" },
  completed: { label: "Completed", badge: "success", dot: "bg-success" },
};

export const readingStatuses: ReadingStatus[] = ["unread", "reading", "completed"];

export const projectStatusConfig: Record<
  ProjectStatus,
  { label: string; badge: "success" | "warning" | "outline" | "secondary" }
> = {
  active: { label: "Active", badge: "success" },
  planning: { label: "Planning", badge: "warning" },
  completed: { label: "Completed", badge: "secondary" },
  archived: { label: "Archived", badge: "outline" },
};

export const milestoneStatusConfig: Record<
  MilestoneStatus,
  { label: string; badge: "outline" | "warning" | "success" | "destructive" }
> = {
  upcoming: { label: "Upcoming", badge: "outline" },
  "in-progress": { label: "In Progress", badge: "warning" },
  "at-risk": { label: "At Risk", badge: "destructive" },
  completed: { label: "Completed", badge: "success" },
};

export const publicationTypeLabels: Record<PublicationType, string> = {
  journal: "Journal article",
  conference: "Conference paper",
  preprint: "Preprint",
  "book-chapter": "Book chapter",
};

export const notificationTypeLabels = {
  invitation: "Project invitation",
  assignment: "Task assignment",
  deadline: "Deadline reminder",
  milestone: "Milestone update",
  mention: "Mention",
  system: "System",
} as const;
