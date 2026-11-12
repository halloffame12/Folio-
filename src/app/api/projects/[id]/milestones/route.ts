import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { getProjectAccess } from "@/lib/auth/authorization";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { toMilestone } from "@/lib/serializers";
import { z } from "zod";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    await getProjectAccess(id, user.id);
    const ms = await prisma.milestone.findMany({ where: { projectId: id }, include: { assignees: true }, orderBy: { dueDate: "asc" } });
    return new Response(JSON.stringify({ success: true, data: ms.map(toMilestone) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    await getProjectAccess(id, user.id);
    const body = await request.json().catch(() => null);
    const parsed = z.object({ title: z.string().trim().min(1).max(200), description: z.string().optional(), dueDate: z.string().optional(), assigneeIds: z.array(z.string()).optional() }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const d = parsed.data;
    const m = await prisma.milestone.create({
      data: {
        projectId: id,
        title: d.title,
        description: d.description ?? "",
        dueDate: d.dueDate ? new Date(d.dueDate) : null,
        status: "upcoming",
        assignees: { create: (d.assigneeIds ?? []).map((uid) => ({ userId: uid })) },
      },
      include: { assignees: true },
    });
    return new Response(JSON.stringify({ success: true, data: toMilestone(m) }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
