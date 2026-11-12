import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { getProjectAccess, requireProjectManager, requireProjectOwner } from "@/lib/auth/authorization";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { toProject } from "@/lib/serializers";
import { z } from "zod";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    await getProjectAccess(id, user.id);
    const project = await prisma.project.findUnique({ where: { id }, include: { members: true, papers: true } });
    return new Response(JSON.stringify({ success: true, data: toProject(project!) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    await requireProjectManager(id, user.id);
    const body = await request.json().catch(() => null);
    const parsed = z.object({ title: z.string().trim().min(1).max(120).optional(), description: z.string().optional(), status: z.enum(["active","planning","completed","archived"]).optional(), deadline: z.string().optional(), progress: z.number().min(0).max(100).optional(), tag: z.string().optional(), accent: z.enum(["forest","terracotta","sand","sage"]).optional(), paperIds: z.array(z.string()).optional() }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const d = parsed.data;
    const update: any = {};
    if (d.title !== undefined) update.title = d.title;
    if (d.description !== undefined) update.description = d.description;
    if (d.status !== undefined) update.status = d.status;
    if (d.deadline !== undefined) update.deadline = d.deadline ? new Date(d.deadline) : null;
    if (d.progress !== undefined) update.progress = Math.round(d.progress);
    if (d.tag !== undefined) update.tag = d.tag;
    if (d.accent !== undefined) update.accent = d.accent;
    await prisma.project.update({ where: { id }, data: update });
    if (d.paperIds) {
      await prisma.projectPaper.deleteMany({ where: { projectId: id } });
      for (const pid of d.paperIds) await prisma.projectPaper.create({ data: { projectId: id, paperId: pid } }).catch(() => {});
    }
    const project = await prisma.project.findUnique({ where: { id }, include: { members: true, papers: true } });
    return new Response(JSON.stringify({ success: true, data: toProject(project!) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    await requireProjectOwner(id, user.id);
    await prisma.project.delete({ where: { id } });
    return new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
