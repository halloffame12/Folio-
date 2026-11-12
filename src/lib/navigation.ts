import {
  Activity,
  Bell,
  BookMarked,
  Compass,
  FileText,
  Flag,
  FolderKanban,
  LayoutDashboard,
  Library,
  ListChecks,
  NotebookPen,
  ScanSearch,
  Settings,
  BookOpenCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: "unread";
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { title: "Discover Papers", href: "/discover", icon: Compass },
      { title: "My Library", href: "/library", icon: Library },
      { title: "Collections", href: "/collections", icon: BookMarked },
      { title: "Research Notes", href: "/notes", icon: NotebookPen },
    ],
  },
  {
    label: "Research",
    items: [
      { title: "Projects", href: "/projects", icon: FolderKanban },
      { title: "Literature Reviews", href: "/literature", icon: BookOpenCheck },
      { title: "Research Gap Explorer", href: "/research-gaps", icon: ScanSearch },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "Tasks", href: "/tasks", icon: ListChecks },
      { title: "Milestones", href: "/milestones", icon: Flag },
      { title: "Team Activity", href: "/activity", icon: Activity },
    ],
  },
  {
    label: "Personal",
    items: [
      { title: "Notifications", href: "/notifications", icon: Bell, badgeKey: "unread" },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const workspace = {
  name: "Northbridge University",
  unit: "Information Science",
  initials: "NB",
};

export const alternateWorkspace = {
  name: "Northbridge University",
  unit: "Digital Humanities Lab",
  initials: "DH",
};

export const routeLabels: Record<string, string> = {
  discover: "Discover Papers",
  library: "My Library",
  collections: "Collections",
  notes: "Research Notes",
  projects: "Projects",
  literature: "Literature Review",
  "research-gaps": "Research Gap Explorer",
  tasks: "Tasks",
  milestones: "Milestones",
  activity: "Team Activity",
  citations: "Citation Generator",
  notifications: "Notifications",
  settings: "Settings",
};

export const pageIcons: Record<string, LucideIcon> = {
  discover: Compass,
  library: Library,
  collections: BookMarked,
  notes: NotebookPen,
  projects: FolderKanban,
  literature: BookOpenCheck,
  "research-gaps": ScanSearch,
  tasks: ListChecks,
  milestones: Flag,
  activity: Activity,
  citations: FileText,
  notifications: Bell,
  settings: Settings,
};
