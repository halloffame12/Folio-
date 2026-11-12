"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Check,
  ChevronsUpDown,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { navigation, workspace, alternateWorkspace } from "@/lib/navigation";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function WorkspaceSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const [active, setActive] = useState<"northbridge" | "dh">("northbridge");
  const current = active === "northbridge" ? workspace : alternateWorkspace;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "group flex w-full items-center gap-2.5 rounded border border-border/80 bg-card/60 p-2 text-left transition-colors hover:border-border hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            collapsed && "justify-center p-1.5"
          )}
          aria-label={`Workspace: ${current.name}, ${current.unit}. Change workspace`}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[3px] border border-border bg-secondary font-mono text-[9px] font-medium tracking-wider text-secondary-foreground">
            {current.initials}
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11.5px] font-semibold leading-tight">
                  {current.name}
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                  {current.unit}
                </span>
              </span>
              <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[264px]">
        <DropdownMenuLabel>Research workspace</DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => {
            setActive("northbridge");
            toast("Workspace switched", {
              description: "Northbridge · Information Science",
            });
          }}
          className="items-start py-2"
        >
          <span className="mt-0.5 flex size-6 items-center justify-center rounded-[3px] bg-secondary font-mono text-[9px]">
            NB
          </span>
          <span className="flex-1">
            <span className="block text-[12px] font-medium">Northbridge University</span>
            <span className="text-[11px] text-muted-foreground">Information Science</span>
          </span>
          {active === "northbridge" && <Check className="mt-0.5 size-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            setActive("dh");
            toast("Workspace switched", {
              description: "Northbridge · Digital Humanities Lab",
            });
          }}
          className="items-start py-2"
        >
          <span className="mt-0.5 flex size-6 items-center justify-center rounded-[3px] bg-secondary font-mono text-[9px]">
            DH
          </span>
          <span className="flex-1">
            <span className="block text-[12px] font-medium">Northbridge University</span>
            <span className="text-[11px] text-muted-foreground">Digital Humanities Lab</span>
          </span>
          {active === "dh" && <Check className="mt-0.5 size-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Plus className="size-3.5" />
            Workspace settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const unread = useWorkspaceStore((s) =>
    s.data.notifications.filter((n) => !n.read).length
  );

  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-6">
      {navigation.map((group) => (
        <div key={group.label}>
          {!collapsed ? (
            <p className="mb-1.5 px-2 font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
              {group.label}
            </p>
          ) : (
            <div className="mx-auto mb-2 h-px w-6 bg-border" />
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              const showBadge = item.badgeKey === "unread" && unread > 0;
              const link = (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex h-8 items-center gap-2.5 rounded px-2 text-[12.5px] font-medium transition-colors",
                    active
                      ? "bg-primary/[0.08] text-primary dark:bg-primary/15"
                      : "text-sidebar-foreground/72 hover:bg-secondary/70 hover:text-foreground",
                    collapsed && "justify-center px-0"
                  )}
                >
                  {active && !collapsed && (
                    <span className="absolute -left-1 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-primary" />
                  )}
                  <Icon
                    className={cn("size-[15px] shrink-0", active ? "text-primary" : "text-muted-foreground/80 group-hover:text-foreground")}
                    strokeWidth={1.75}
                  />
                  {!collapsed && <span className="flex-1 truncate">{item.title}</span>}
                  {!collapsed && showBadge && (
                    <Badge variant="muted" className="h-[17px] min-w-[17px] justify-center border-transparent bg-primary/10 px-1 text-[9px] text-primary">
                      {unread}
                    </Badge>
                  )}
                  {collapsed && showBadge && (
                    <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent" />
                  )}
                </Link>
              );
              return (
                <li key={item.href}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right">{item.title}</TooltipContent>
                    </Tooltip>
                  ) : (
                    link
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function SidebarFooter({
  collapsed,
  onToggle,
  showCollapse = true,
}: {
  collapsed: boolean;
  onToggle: () => void;
  showCollapse?: boolean;
}) {
  const profile = useWorkspaceStore((s) => s.profile);

  return (
    <div className="mt-auto border-t border-border/80 pt-3">
      <div className={cn("flex items-center gap-1", collapsed && "flex-col gap-2")}>
        <Link
          href="/settings"
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2.5 rounded p-1.5 transition-colors hover:bg-secondary/70",
            collapsed && "justify-center"
          )}
          aria-label="Your profile settings"
        >
          <Avatar className="size-7 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary">
              {profile.initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11.5px] font-semibold leading-tight">
                {profile.name}
              </span>
              <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                {profile.title}
              </span>
            </span>
          )}
        </Link>
        {!collapsed && <ThemeToggle align="sidebar" />}
        {!collapsed && showCollapse && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onToggle}
                aria-label="Collapse sidebar"
                className="text-sidebar-foreground/60"
              >
                <PanelLeftClose className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Collapse sidebar</TooltipContent>
          </Tooltip>
        )}
      </div>
      {collapsed && (
        <>
          <div className="mt-2 flex justify-center">
            <ThemeToggle align="sidebar" />
          </div>
          {showCollapse && (
            <div className="mt-1 flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onToggle}
                    aria-label="Expand sidebar"
                    className="text-sidebar-foreground/60"
                  >
                    <PanelLeftOpen className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Expand sidebar</TooltipContent>
              </Tooltip>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function DesktopSidebar({ onOpenCommand }: { onOpenCommand: () => void }) {
  const collapsed = useWorkspaceStore((s) => s.sidebarCollapsed);
  const toggle = useWorkspaceStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-sidebar px-3 py-4 transition-[width] duration-200 lg:flex",
        collapsed ? "w-[72px]" : "w-[248px]"
      )}
      aria-label="Sidebar"
    >
      <div className={cn("flex items-center px-1", collapsed ? "justify-center" : "justify-between")}>
        <Link href="/dashboard" aria-label="Folio workspace home">
          <Logo showWordmark={!collapsed} />
        </Link>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Search workspace"
            onClick={onOpenCommand}
            className="text-muted-foreground"
          >
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden>
              <circle cx="7" cy="7" r="4.4" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10.4 10.4L14 14" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </Button>
        )}
      </div>

      <div className="mt-4">
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      <ScrollArea className="-mx-1 mt-4 flex-1 px-1">
        <SidebarNav collapsed={collapsed} />
      </ScrollArea>

      <SidebarFooter collapsed={collapsed} onToggle={toggle} />
    </aside>
  );
}

export function MobileSidebar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-[288px] flex-col gap-0 border-border bg-sidebar p-0 sm:max-w-[288px] lg:hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Workspace navigation</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col px-4 pb-4 pt-4">
          <Link href="/dashboard" onClick={() => onOpenChange(false)}>
            <Logo />
          </Link>
          <div className="mt-4">
            <WorkspaceSwitcher />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4">
          <SidebarNav onNavigate={() => onOpenChange(false)} />
        </div>
        <div className="px-4 pb-4">
          <SidebarFooter
            collapsed={false}
            showCollapse={false}
            onToggle={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
