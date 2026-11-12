"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellOff,
  CalendarClock,
  Check,
  CheckCheck,
  Flag,
  Info,
  ListChecks,
  MessageSquare,
  Settings,
  Trash2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import type { Notification } from "@/types";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { usersById } from "@/lib/client-registry";
import { notificationTypeLabels } from "@/lib/labels";
import { formatDate, relativeTime, cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const typeConfig: Record<
  Notification["type"],
  { icon: React.ComponentType<{ className?: string }>; classes: string }
> = {
  invitation: { icon: UserPlus, classes: "bg-accent/12 text-accent" },
  assignment: { icon: ListChecks, classes: "bg-warning/12 text-warning" },
  deadline: { icon: CalendarClock, classes: "bg-warning/12 text-warning" },
  milestone: { icon: Flag, classes: "bg-success/12 text-success" },
  mention: { icon: MessageSquare, classes: "bg-primary/10 text-primary" },
  system: { icon: Info, classes: "bg-secondary text-secondary-foreground" },
};

const types = Object.keys(notificationTypeLabels) as Notification["type"][];

function bucket(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  if (diff < 86_400_000) return "Today";
  if (diff < 7 * 86_400_000) return "Earlier this week";
  return "Earlier";
}

function NotificationRow({ notification }: { notification: Notification }) {
  const markNotificationRead = useWorkspaceStore((s) => s.markNotificationRead);
  const deleteNotification = useWorkspaceStore((s) => s.deleteNotification);
  const config = typeConfig[notification.type];
  const Icon = config.icon;
  const actor = notification.actorId ? usersById[notification.actorId] : undefined;

  return (
    <li
      className={cn(
        "group relative flex items-start gap-3 px-3.5 py-3 transition-colors sm:px-4",
        notification.read ? "bg-card" : "bg-primary/[0.025] hover:bg-primary/[0.045]"
      )}
    >
      {!notification.read && (
        <span className="absolute inset-y-3 left-0 w-[2px] rounded-full bg-primary" aria-hidden />
      )}
      <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full", config.classes)}>
        <Icon className="size-3.5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={cn(
                "text-[12px] leading-snug",
                notification.read ? "font-medium text-foreground/80" : "font-semibold text-foreground"
              )}
            >
              {notification.title}
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{notification.body}</p>
          </div>
          <span className="shrink-0 font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground/70">
            {relativeTime(notification.createdAt)}
          </span>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Badge variant="outline" className="h-4 px-1 text-[7.5px]">
            {notificationTypeLabels[notification.type]}
          </Badge>
          {actor && (
            <span className="font-mono text-[8px] uppercase tracking-wide text-muted-foreground">
              {actor.name}
            </span>
          )}
          {notification.read && (
            <span className="flex items-center gap-0.5 font-mono text-[8px] uppercase tracking-wide text-muted-foreground/60">
              <Check className="size-2.5" /> read
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 self-center">
        {notification.href && (
          <Button asChild variant="outline" size="xs">
            <Link href={notification.href} onClick={() => markNotificationRead(notification.id)}>
              Open
            </Link>
          </Button>
        )}
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            onClick={() => markNotificationRead(notification.id)}
            aria-label={`Mark ${notification.title} as read`}
          >
            <Check className="size-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => {
            deleteNotification(notification.id);
            toast("Notification removed");
          }}
          aria-label={`Delete notification ${notification.title}`}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </li>
  );
}

export default function NotificationsPage() {
  const notifications = useWorkspaceStore((s) => s.data.notifications);
  const markAllNotificationsRead = useWorkspaceStore((s) => s.markAllNotificationsRead);

  const [tab, setTab] = useState("all");
  const [type, setType] = useState<Notification["type"] | "all">("all");

  const unread = notifications.filter((item) => !item.read);
  const filtered = useMemo(() => {
    const list = [...notifications]
      .filter((item) => {
        if (tab === "unread" && item.read) return false;
        if (type !== "all" && item.type !== type) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [notifications, tab, type]);

  const grouped = useMemo(() => {
    const map = new Map<string, Notification[]>();
    filtered.forEach((item) => {
      const key = bucket(item.createdAt);
      map.set(key, [...(map.get(key) ?? []), item]);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const typeCounts = useMemo(() => {
    const counts = new Map<Notification["type"], number>();
    unread.forEach((item) => counts.set(item.type, (counts.get(item.type) ?? 0) + 1));
    return counts;
  }, [unread]);

  return (
    <div>
      <PageHeader
        eyebrow="Personal"
        title="Notifications"
        description="Assignments, invitations, deadlines, and mentions. Unread items carry a rule in the margin."
        actions={
          <>
            <Badge variant={unread.length > 0 ? "default" : "outline"} className="h-7 px-2.5">
              {unread.length} unread
            </Badge>
            <Button
              size="sm"
              variant="outline"
              disabled={unread.length === 0}
              onClick={() => {
                markAllNotificationsRead();
                toast.success("All notifications marked as read");
              }}
            >
              <CheckCheck /> Mark all read
            </Button>
          </>
        }
      />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div className="overflow-hidden rounded border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface/30 px-3 py-2">
            <div className="flex items-center gap-1">
              {[
                { value: "all", label: "All" },
                { value: "unread", label: "Unread" },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setTab(item.value)}
                  aria-pressed={tab === item.value}
                  className={cn(
                    "rounded px-2.5 py-1 text-[10.5px] font-medium transition-colors",
                    tab === item.value
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                  <span className="ml-1 font-mono text-[8.5px] text-muted-foreground">
                    {item.value === "unread" ? unread.length : notifications.length}
                  </span>
                </button>
              ))}
            </div>
            <Select value={type} onValueChange={(value) => setType(value as Notification["type"] | "all")}>
              <SelectTrigger className="h-7 w-[160px] text-[10.5px]" aria-label="Filter by notification type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {types.map((item) => (
                  <SelectItem key={item} value={item}>
                    {notificationTypeLabels[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={BellOff}
                title={tab === "unread" ? "You are all caught up" : "No notifications"}
                description={
                  tab === "unread"
                    ? "Every notification has been read. New activity will appear here."
                    : "Adjust the type filter to see other notifications."
                }
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTab("all");
                      setType("all");
                    }}
                  >
                    View all notifications
                  </Button>
                }
                compact
              />
            </div>
          ) : (
            <Tabs value={tab} onValueChange={setTab}>
              <TabsContent value="all" className="m-0">
                {grouped.map(([label, items]) => (
                  <section key={label} aria-label={label}>
                    <h2 className="border-y border-border/70 bg-surface/40 px-3.5 py-1 font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground first:border-t-0">
                      {label}
                    </h2>
                    <ul className="divide-y divide-border/60">
                      {items.map((item) => (
                        <NotificationRow key={item.id} notification={item} />
                      ))}
                    </ul>
                  </section>
                ))}
              </TabsContent>
              <TabsContent value="unread" className="m-0">
                {grouped.map(([label, items]) => (
                  <section key={label} aria-label={label}>
                    <h2 className="border-y border-border/70 bg-surface/40 px-3.5 py-1 font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground first:border-t-0">
                      {label}
                    </h2>
                    <ul className="divide-y divide-border/60">
                      {items.map((item) => (
                        <NotificationRow key={item.id} notification={item} />
                      ))}
                    </ul>
                  </section>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </div>

        <aside className="space-y-3">
          <section className="rounded border border-border bg-card p-3.5">
            <h2 className="section-title flex items-center gap-1.5">
              <Bell className="size-3.5 text-muted-foreground" /> Unread by type
            </h2>
            <ul className="mt-2.5 space-y-1.5">
              {types.map((item) => {
                const config = typeConfig[item];
                const Icon = config.icon;
                const count = typeCounts.get(item) ?? 0;
                return (
                  <li key={item}>
                    <button
                      onClick={() => {
                        setType(item);
                        setTab("all");
                      }}
                      className="flex w-full items-center gap-2 rounded px-1 py-1 text-left transition-colors hover:bg-secondary/40"
                    >
                      <span className={cn("flex size-5 items-center justify-center rounded-full", config.classes)}>
                        <Icon className="size-2.5" />
                      </span>
                      <span className="flex-1 text-[10.5px] text-foreground/80">{notificationTypeLabels[item]}</span>
                      <span className="font-mono text-[9px] text-muted-foreground">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded border border-border bg-card p-3.5">
            <h2 className="section-title">Stay in control</h2>
            <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">
              Choose which events reach you. Invitations are simulated in this demonstration and never send email.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-2.5 w-full">
              <Link href="/settings?tab=notifications">
                <Settings /> Notification settings
              </Link>
            </Button>
          </section>

          <section className="rounded border border-dashed border-border bg-surface/30 p-3.5">
            <p className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground">Latest</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">
              {notifications[0]
                ? `${notifications[0].title} · ${formatDate(notifications[0].createdAt, {
                    month: "short",
                    day: "numeric",
                  })}`
                : "No notifications in this workspace."}
            </p>
          </section>
        </aside>
      </div>

      <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground/60">
        {notifications.length} notifications · {unread.length} unread · state persists in this browser
      </p>
    </div>
  );
}
