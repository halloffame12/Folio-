/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/db";
import { toUser, toPaper, toLibraryEntry, toCollection, toProject, toTask, toMilestone, toNote, toLitReview } from "@/lib/serializers";

export async function getWorkspace(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
  if (!user) throw new Error("User not found");

  const projectIds = (await prisma.projectMember.findMany({ where: { userId, status: "active" }, select: { projectId: true } })).map((m) => m.projectId);
  const ownedProjectIds = (await prisma.project.findMany({ where: { ownerId: userId }, select: { id: true } })).map((p) => p.id);
  const allProjectIds = Array.from(new Set([...projectIds, ...ownedProjectIds]));

  const [library, collections, notes, projects, tasks, milestones, reviews, notifications, activity] = await Promise.all([
    prisma.libraryEntry.findMany({
      where: { userId },
      include: { tags: { include: { tag: true } } },
      orderBy: { addedAt: "desc" },
    }),
    prisma.collection.findMany({
      where: { userId },
      include: { papers: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.note.findMany({
      where: { userId },
      include: { papers: true, tags: { include: { tag: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany({
      where: { OR: [{ ownerId: userId }, { id: { in: allProjectIds } }] },
      include: { members: true, papers: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.task.findMany({
      where: { projectId: { in: allProjectIds } },
      include: { comments: true, papers: true, milestone: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.milestone.findMany({
      where: { projectId: { in: allProjectIds } },
      include: { assignees: true, tasks: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.literatureReview.findMany({
      where: { userId },
      include: {
        sections: { include: { children: { include: { children: { include: { children: true, papers: true } }, papers: true } }, papers: true } },
        papers: true,
        notes: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.activity.findMany({
      where: { OR: [{ actorId: userId }, { projectId: { in: allProjectIds } }] },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  // collect paper ids
  const paperIds = new Set<string>();
  library.forEach((e) => paperIds.add(e.paperId));
  collections.forEach((c) => c.papers.forEach((p) => paperIds.add(p.paperId)));
  notes.forEach((n) => n.papers.forEach((p) => paperIds.add(p.paperId)));
  projects.forEach((p) => p.papers.forEach((x) => paperIds.add(x.paperId)));
  tasks.forEach((t) => t.papers.forEach((x) => paperIds.add(x.paperId)));
  reviews.forEach((r) => {
    r.papers.forEach((p) => paperIds.add(p.paperId));
    r.sections.forEach(function walk(s: any) {
      s.papers?.forEach((p: any) => paperIds.add(p.paperId));
      s.children?.forEach(walk);
    });
  });

  const papers = paperIds.size
    ? await prisma.paper.findMany({ where: { id: { in: Array.from(paperIds) } }, include: { authors: true, identifiers: true } })
    : [];

  // members
  const memberUserIds = new Set<string>([userId]);
  projects.forEach((p) => p.members.forEach((m) => { if (m.userId) memberUserIds.add(m.userId); }));
  const members = await prisma.user.findMany({ where: { id: { in: Array.from(memberUserIds) } }, include: { profile: true } });

  // citations (optional, not in WorkspaceData but maybe)
  // activity mapping
  const activityItems = activity.map((a) => ({
    id: a.id,
    actorId: a.actorId,
    action: a.action,
    target: a.target,
    href: a.href ?? undefined,
    createdAt: a.createdAt.toISOString(),
    projectId: a.projectId ?? undefined,
    kind: a.kind as any,
  }));

  const notifItems = notifications.map((n) => ({
    id: n.id,
    type: n.type as any,
    title: n.title,
    body: n.body,
    createdAt: n.createdAt.toISOString(),
    read: n.read,
    href: n.href ?? undefined,
    actorId: n.actorId ?? undefined,
    projectId: n.projectId ?? undefined,
  }));

  const data = {
    library: library.map(toLibraryEntry),
    collections: collections.map(toCollection),
    notes: notes.map(toNote),
    projects: projects.map(toProject),
    tasks: tasks.map((t) => toTask({ ...t, milestone: t.milestone ? { milestoneId: t.milestone.milestoneId } : null })),
    milestones: milestones.map((m) => toMilestone({ ...m, assignees: m.assignees })),
    literatureReviews: (reviews as any[]).map(toLitReview),
    notifications: notifItems,
    activity: activityItems,
  };

  return {
    profile: toUser(user),
    settings: (user.settings ?? {}) as Record<string, unknown>,
    data,
    papers: papers.map(toPaper),
    members: members.map(toUser),
  };
}
