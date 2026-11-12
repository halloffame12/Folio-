import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    // id may be tag name or id; try id first
    let tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) tag = await prisma.tag.findFirst({ where: { userId: user.id, name: id } });
    if (!tag || tag.userId !== user.id) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Tag not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    await prisma.tag.delete({ where: { id: tag.id } });
    return new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
