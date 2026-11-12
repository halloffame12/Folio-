"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Bell,
  CheckCheck,
  ChevronDown,
  Command as CommandIcon,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { cn, relativeTime } from "@/lib/utils";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { apiMutate } from "@/lib/api-client";
import type { Notification } from "@/types";
import { initials } from "@/lib/utils";

function NotificationIcon({ type }: { type: Notification["type"] }) {
  const tone =
    type === "deadline"
      ? "bg-warning/12 text-warning"
      : type === "invitation"
        ? "bg-accent/12 text-accent"
        : type === "assignment"
          ? "bg-primary/10 text-primary"
          : type === "milestone"
            ? "bg-primary/10 text-primary"
            : "bg-secondary text-muted-foreground";
  return (
    <span className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-[3px]", tone)}>
      <span className="size-1.5 rounded-full bg-current" />
    </span>
  );
}

function NotificationsMenu() {
  const router = useRouter();
  const notifications = useWorkspaceStore((s) => s.data.notifications);
  const markRead = useWorkspaceStore((s) => s.markNotificationRead);
  const markAll = useWorkspaceStore((s) => s.markAllNotificationsRead);
  const unread = notifications.filter((n) => !n.read);
  const recent = notifications.slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative text-muted-foreground"
          aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ""}`}
        >
          <Bell className="size-4" />
          {unread.length > 0 && (
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent ring-2 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] font-semibold">Notifications</span>
            {unread.length > 0 && (
              <Badge variant="accent" className="border-accent/20 bg-accent/10 text-accent">
                {unread.length} new
              </Badge>
            )}
          </div>
          <button
            className="inline-flex items-center gap-1 text-[10.5px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            onClick={() => {
              markAll();
              toast("All notifications marked as read");
            }}
            disabled={unread.length === 0}
          >
            <CheckCheck className="size-3" />
            Mark all read
          </button>
        </div>
        <div className="max-h-[340px] overflow-y-auto">
          {recent.map((notification) => (
            <button
              key={notification.id}
              className={cn(
                "flex w-full items-start gap-2.5 border-b border-border/60 px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-secondary/50",
                !notification.read && "bg-primary/[0.03]"
              )}
              onClick={() => {
                markRead(notification.id);
                router.push(notification.href ?? "/notifications");
              }}
            >
              <NotificationIcon type={notification.type} />
              <span className="min-w-0 flex-1">
                <span className={cn("block text-[11.5px] leading-snug", notification.read ? "text-foreground/80" : "font-medium text-foreground")}>
                  {notification.title}
                </span>
                <span className="mt-0.5 block truncate text-[10.5px] text-muted-foreground">
                  {notification.body}
                </span>
                <span className="mt-1 block font-mono text-[9px] uppercase tracking-wide text-muted-foreground/70">
                  {relativeTime(notification.createdAt)}
                </span>
              </span>
              {!notification.read && <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
            </button>
          ))}
        </div>
        <div className="border-t border-border p-1">
          <DropdownMenuItem asChild>
            <Link href="/notifications" className="justify-center text-[11.5px] font-medium">
              View all notifications
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppearanceMenu() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <DropdownMenuRadioGroup
      value={mounted ? theme : "light"}
      onValueChange={(value) => {
        setTheme(value);
        toast(`Appearance set to ${value}`, { description: "Your preference is saved locally." });
      }}
    >
      <DropdownMenuRadioItem value="light">
        <Sun className="size-3.5" /> Light
      </DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="dark">
        <Moon className="size-3.5" /> Dark
      </DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  );
}

function UserMenu() {
  const profile = useWorkspaceStore((s) => s.profile);
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await apiMutate("/api/auth/signout", "POST");
      toast.success("Signed out", { description: "See you next time." });
      router.push("/signin");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 rounded-full p-0.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open account menu"
        >
          <Avatar className="size-7 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="hidden size-3 text-muted-foreground sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-[12px] font-semibold">{profile.name}</p>
          <p className="truncate text-[10.5px] text-muted-foreground">{profile.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <UserRound /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings?tab=appearance">
            <Settings /> Preferences
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <AppearanceMenu />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={signingOut}
          onSelect={() => {
            void handleSignOut();
          }}
        >
          <LogOut /> {signingOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppHeader({
  onOpenCommand,
  onOpenMobileNav,
}: {
  onOpenCommand: () => void;
  onOpenMobileNav: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
        >
          <Menu className="size-4" />
        </Button>

        <Breadcrumbs className="hidden min-w-0 md:block" />
        <span className="truncate text-[12px] font-medium md:hidden">Folio</span>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onOpenCommand}
            className="flex h-8 items-center gap-2 rounded border border-border bg-card px-2.5 text-left text-[11.5px] text-muted-foreground shadow-xs transition-colors hover:border-foreground/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-56 lg:w-72"
            aria-label="Search the workspace"
          >
            <Search className="size-3.5 shrink-0" />
            <span className="hidden flex-1 truncate sm:block">
              Search papers, notes…
            </span>
            <kbd className="hidden items-center gap-0.5 rounded border border-border bg-surface px-1.5 py-[2px] font-mono text-[9px] text-muted-foreground sm:flex">
              <CommandIcon className="size-2.5" /> K
            </kbd>
          </button>

          <NotificationsMenu />
          <div className="mx-0.5 hidden h-4 w-px bg-border sm:block" />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
