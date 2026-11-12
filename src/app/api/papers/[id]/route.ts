import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { toPaper } from "@/lib/serializers";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const paper = await prisma.paper.findUnique({ where: { id }, include: { authors: true, identifiers: true } });
    if (!paper) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Paper not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ success: true, data: toPaper(paper) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    const paper = await prisma.paper.findUnique({ where: { id } });
    if (!paper) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Paper not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    if (paper.source !== "user" || paper.createdById !== user.id) return new Response(JSON.stringify({ success: false, error: { code: "forbidden", message: "You cannot edit this paper." } }), { status: 403, headers: { "Content-Type": "application/json" } });

    const body = await request.json().catch(() => null);
    const allowed: any = {};
    if (typeof body?.title === "string") allowed.title = body.title;
    if (typeof body?.abstract === "string") allowed.abstract = body.abstract;
    if (typeof body?.year === "number") allowed.year = body.year;
    if (typeof body?.venue === "string") allowed.venue = body.venue;
    await prisma.paper.update({ where: { id }, data: allowed });
    const updated = await prisma.paper.findUnique({ where: { id }, include: { authors: true, identifiers: true } });
    return new Response(JSON.stringify({ success: true, data: toPaper(updated!) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    const paper = await prisma.paper.findUnique({ where: { id } });
    if (!paper) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Paper not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    if (paper.source !== "user" || paper.createdById !== user.id) return new Response(JSON.stringify({ success: false, error: { code: "forbidden", message: "You cannot delete this paper." } }), { status: 403, headers: { "Content-Type": "application/json" } });
    await prisma.paper.delete({ where: { id } });
    return new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
