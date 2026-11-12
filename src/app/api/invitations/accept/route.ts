import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { tokenHash } from "@/lib/auth/tokens";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const body = await request.json().catch(() => null);
    const parsed = z.object({ token: z.string().min(10) }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const hash = tokenHash(parsed.data.token);
    const inv = await prisma.projectInvitation.findUnique({ where: { tokenHash: hash } });
    if (!inv || inv.acceptedAt || inv.expiresAt < new Date()) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Invitation invalid or expired." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    if (inv.email !== user.email) return new Response(JSON.stringify({ success: false, error: { code: "forbidden", message: "This invitation is for a different email." } }), { status: 403, headers: { "Content-Type": "application/json" } });

    await prisma.projectInvitation.update({ where: { id: inv.id }, data: { acceptedAt: new Date() } });
    // activate member
    const member = await prisma.projectMember.findFirst({ where: { projectId: inv.projectId, invitedEmail: inv.email } });
    if (member) {
      await prisma.projectMember.update({ where: { id: member.id }, data: { userId: user.id, status: "active", role: inv.role } });
    } else {
      await prisma.projectMember.create({ data: { projectId: inv.projectId, userId: user.id, role: inv.role, status: "active", invitedEmail: inv.email, invitedName: inv.name } });
    }
    return new Response(JSON.stringify({ success: true, data: { projectId: inv.projectId } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
