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
    const c = await prisma.citation.findUnique({ where: { id } });
    if (!c || c.userId !== user.id) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Citation not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    await prisma.citation.delete({ where: { id } });
    return new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
