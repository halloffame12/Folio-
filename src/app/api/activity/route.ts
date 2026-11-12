import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { fail } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const memberships = await prisma.projectMember.findMany({ where: { userId: user.id, status: "active" }, select: { projectId: true } });
    const ids = memberships.map((m) => m.projectId);
    const items = await prisma.activity.findMany({ where: { OR: [{ actorId: user.id }, { projectId: { in: ids } }] }, orderBy: { createdAt: "desc" }, take: 100 });
    return new Response(JSON.stringify({ success: true, data: items.map((a) => ({ id: a.id, actorId: a.actorId, action: a.action, target: a.target, href: a.href ?? undefined, createdAt: a.createdAt.toISOString(), projectId: a.projectId ?? undefined, kind: a.kind })) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
