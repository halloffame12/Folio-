import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { getProjectAccess } from "@/lib/auth/authorization";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { toTask } from "@/lib/serializers";
import { z } from "zod";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    await getProjectAccess(id, user.id);
    const tasks = await prisma.task.findMany({ where: { projectId: id }, include: { comments: true, papers: true, milestone: true }, orderBy: { createdAt: "desc" } });
    return new Response(JSON.stringify({ success: true, data: tasks.map((t) => toTask({ ...t, milestone: t.milestone ? { milestoneId: t.milestone.milestoneId } : null })) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    await getProjectAccess(id, user.id);
    const body = await request.json().catch(() => null);
    const parsed = z.object({ title: z.string().trim().min(1).max(200), description: z.string().optional(), status: z.enum(["todo","in-progress","in-review","completed"]).optional(), priority: z.enum(["low","medium","high","critical"]).optional(), assigneeId: z.string().optional(), dueDate: z.string().optional(), paperIds: z.array(z.string()).optional(), milestoneId: z.string().optional() }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const d = parsed.data;
    const task = await prisma.task.create({
      data: {
        projectId: id,
        title: d.title,
        description: d.description ?? "",
        status: (d.status ? d.status.replace("-", "_") : "todo") as any,
        priority: (d.priority ?? "medium") as any,
        assigneeId: d.assigneeId || null,
        dueDate: d.dueDate ? new Date(d.dueDate) : null,
        createdById: user.id,
        papers: { create: (d.paperIds ?? []).map((pid) => ({ paperId: pid })) },
      },
      include: { comments: true, papers: true, milestone: true },
    });
    if (d.milestoneId) {
      await prisma.milestoneTask.create({ data: { milestoneId: d.milestoneId, taskId: task.id } }).catch(() => {});
    }
    const full = await prisma.task.findUnique({ where: { id: task.id }, include: { comments: true, papers: true, milestone: true } });
    return new Response(JSON.stringify({ success: true, data: toTask({ ...full!, milestone: full!.milestone ? { milestoneId: full!.milestone.milestoneId } : null }) }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
