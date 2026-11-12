import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { getProjectAccess, requireProjectManager } from "@/lib/auth/authorization";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { z } from "zod";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id, memberId } = await params;
    await requireProjectManager(id, user.id);
    const body = await request.json().catch(() => null);
    const parsed = z.object({ role: z.enum(["Admin","Member","Owner"]).optional() }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const member = await prisma.projectMember.findUnique({ where: { id: memberId } });
    if (!member || member.projectId !== id) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Member not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    if (member.role === "Owner") return new Response(JSON.stringify({ success: false, error: { code: "forbidden", message: "Cannot change owner role." } }), { status: 403, headers: { "Content-Type": "application/json" } });
    await prisma.projectMember.update({ where: { id: memberId }, data: { role: parsed.data.role as any } });
    return new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id, memberId } = await params;
    const access = await getProjectAccess(id, user.id);
    const member = await prisma.projectMember.findUnique({ where: { id: memberId } });
    if (!member || member.projectId !== id) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Member not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    if (member.role === "Owner") return new Response(JSON.stringify({ success: false, error: { code: "forbidden", message: "Cannot remove owner." } }), { status: 403, headers: { "Content-Type": "application/json" } });
    // self-remove allowed; otherwise manager
    if (member.userId !== user.id) {
      if (access.role !== "Owner" && access.role !== "Admin") {
        return new Response(JSON.stringify({ success: false, error: { code: "forbidden", message: "Forbidden." } }), { status: 403, headers: { "Content-Type": "application/json" } });
      }
    }
    await prisma.projectMember.delete({ where: { id: memberId } });
    return new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
