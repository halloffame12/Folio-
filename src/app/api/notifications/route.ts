import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const items = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 });
    return new Response(JSON.stringify({ success: true, data: items.map((n) => ({ id: n.id, type: n.type, title: n.title, body: n.body, createdAt: n.createdAt.toISOString(), read: n.read, href: n.href ?? undefined, actorId: n.actorId ?? undefined, projectId: n.projectId ?? undefined })) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function PATCH(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const body = await request.json().catch(() => null);
    const parsed = z.object({ id: z.string().optional(), all: z.boolean().optional() }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    if (parsed.data.all) {
      await prisma.notification.updateMany({ where: { userId: user.id }, data: { read: true } });
    } else if (parsed.data.id) {
      await prisma.notification.updateMany({ where: { id: parsed.data.id, userId: user.id }, data: { read: true } });
    }
    return new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
