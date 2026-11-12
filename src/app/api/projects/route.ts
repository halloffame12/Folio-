import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { toProject } from "@/lib/serializers";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const memberships = await prisma.projectMember.findMany({ where: { userId: user.id, status: "active" }, select: { projectId: true } });
    const ids = memberships.map((m) => m.projectId);
    const projects = await prisma.project.findMany({ where: { OR: [{ ownerId: user.id }, { id: { in: ids } }] }, include: { members: true, papers: true }, orderBy: { updatedAt: "desc" } });
    return new Response(JSON.stringify({ success: true, data: projects.map(toProject) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const body = await request.json().catch(() => null);
    const parsed = z.object({ title: z.string().trim().min(1).max(120), description: z.string().optional(), deadline: z.string().optional(), tag: z.string().optional() }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const d = parsed.data;
    const project = await prisma.project.create({
      data: {
        title: d.title,
        description: d.description ?? "",
        ownerId: user.id,
        tag: d.tag ?? "General",
        deadline: d.deadline ? new Date(d.deadline) : null,
        members: { create: { userId: user.id, role: "Owner", status: "active" } },
      },
      include: { members: true, papers: true },
    });
    return new Response(JSON.stringify({ success: true, data: toProject(project) }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
