/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { toTask } from "@/lib/serializers";
import { z } from "zod";

async function canAccessTask(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return null;
  // project access
  const member = await prisma.projectMember.findFirst({ where: { projectId: task.projectId, userId, status: "active" } });
  const project = await prisma.project.findUnique({ where: { id: task.projectId } });
  if (!project) return null;
  if (project.ownerId !== userId && !member) return null;
  return task;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const task = await prisma.task.findUnique({ where: { id }, include: { comments: true, papers: true, milestone: true } });
    if (!task) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Task not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    const access = await canAccessTask(id, user.id);
    if (!access) return new Response(JSON.stringify({ success: false, error: { code: "forbidden", message: "Forbidden." } }), { status: 403, headers: { "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ success: true, data: toTask({ ...task, milestone: task.milestone ? { milestoneId: task.milestone.milestoneId } : null }) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    const task = await canAccessTask(id, user.id);
    if (!task) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Task not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    const body = await request.json().catch(() => null);
    const parsed = z.object({ title: z.string().trim().min(1).max(200).optional(), description: z.string().optional(), status: z.enum(["todo","in-progress","in-review","completed"]).optional(), priority: z.enum(["low","medium","high","critical"]).optional(), assigneeId: z.string().optional(), dueDate: z.string().optional(), paperIds: z.array(z.string()).optional(), milestoneId: z.string().nullable().optional(), projectId: z.string().optional() }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const d = parsed.data;
    const update: any = {};
    if (d.title !== undefined) update.title = d.title;
    if (d.description !== undefined) update.description = d.description;
    if (d.status !== undefined) update.status = d.status.replace("-", "_");
    if (d.priority !== undefined) update.priority = d.priority;
    if (d.assigneeId !== undefined) update.assigneeId = d.assigneeId || null;
    if (d.dueDate !== undefined) update.dueDate = d.dueDate ? new Date(d.dueDate) : null;
    if (d.projectId !== undefined) update.projectId = d.projectId;
    await prisma.task.update({ where: { id }, data: update });
    if (d.paperIds) {
      await prisma.taskPaper.deleteMany({ where: { taskId: id } });
      for (const pid of d.paperIds) await prisma.taskPaper.create({ data: { taskId: id, paperId: pid } }).catch(() => {});
    }
    if (d.milestoneId !== undefined) {
      await prisma.milestoneTask.deleteMany({ where: { taskId: id } });
      if (d.milestoneId) await prisma.milestoneTask.create({ data: { milestoneId: d.milestoneId, taskId: id } }).catch(() => {});
    }
    const full = await prisma.task.findUnique({ where: { id }, include: { comments: true, papers: true, milestone: true } });
    return new Response(JSON.stringify({ success: true, data: toTask({ ...full!, milestone: full!.milestone ? { milestoneId: full!.milestone.milestoneId } : null }) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    const task = await canAccessTask(id, user.id);
    if (!task) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Task not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    await prisma.task.delete({ where: { id } });
    return new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
