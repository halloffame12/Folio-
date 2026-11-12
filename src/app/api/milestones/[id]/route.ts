import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { toMilestone } from "@/lib/serializers";
import { z } from "zod";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    const m = await prisma.milestone.findUnique({ where: { id } });
    if (!m) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Milestone not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    const member = await prisma.projectMember.findFirst({ where: { projectId: m.projectId, userId: user.id, status: "active" } });
    const project = await prisma.project.findUnique({ where: { id: m.projectId } });
    if (!project || (project.ownerId !== user.id && !member)) return new Response(JSON.stringify({ success: false, error: { code: "forbidden", message: "Forbidden." } }), { status: 403, headers: { "Content-Type": "application/json" } });
    const body = await request.json().catch(() => null);
    const parsed = z.object({ title: z.string().trim().min(1).max(200).optional(), description: z.string().optional(), dueDate: z.string().optional(), assigneeIds: z.array(z.string()).optional(), progress: z.number().min(0).max(100).optional(), status: z.enum(["upcoming","in-progress","at-risk","completed"]).optional() }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const d = parsed.data;
    const update: any = {};
    if (d.title !== undefined) update.title = d.title;
    if (d.description !== undefined) update.description = d.description;
    if (d.dueDate !== undefined) update.dueDate = d.dueDate ? new Date(d.dueDate) : null;
    if (d.progress !== undefined) update.progress = Math.round(d.progress);
    if (d.status !== undefined) update.status = d.status.replace("-", "_");
    await prisma.milestone.update({ where: { id }, data: update });
    if (d.assigneeIds) {
      await prisma.milestoneAssignee.deleteMany({ where: { milestoneId: id } });
      for (const uid of d.assigneeIds) await prisma.milestoneAssignee.create({ data: { milestoneId: id, userId: uid } }).catch(() => {});
    }
    const full = await prisma.milestone.findUnique({ where: { id }, include: { assignees: true } });
    return new Response(JSON.stringify({ success: true, data: toMilestone(full!) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    const m = await prisma.milestone.findUnique({ where: { id } });
    if (!m) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Milestone not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    const project = await prisma.project.findUnique({ where: { id: m.projectId } });
    if (!project || project.ownerId !== user.id) return new Response(JSON.stringify({ success: false, error: { code: "forbidden", message: "Forbidden." } }), { status: 403, headers: { "Content-Type": "application/json" } });
    await prisma.milestone.delete({ where: { id } });
    return new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
