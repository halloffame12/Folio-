import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { toCollection } from "@/lib/serializers";
import { z } from "zod";

async function owned(id: string, userId: string) {
  const c = await prisma.collection.findUnique({ where: { id } });
  if (!c || c.userId !== userId) return null;
  return c;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const c = await prisma.collection.findUnique({ where: { id }, include: { papers: true } });
    if (!c || c.userId !== user.id) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Collection not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ success: true, data: toCollection(c) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    const c = await owned(id, user.id);
    if (!c) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Collection not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    const body = await request.json().catch(() => null);
    const parsed = z.object({ name: z.string().trim().min(1).max(80).optional(), description: z.string().optional(), color: z.enum(["forest","terracotta","sand","sage","ink"]).optional() }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const updated = await prisma.collection.update({ where: { id }, data: parsed.data as any, include: { papers: true } });
    return new Response(JSON.stringify({ success: true, data: toCollection(updated) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    const c = await owned(id, user.id);
    if (!c) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Collection not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    await prisma.collection.delete({ where: { id } });
    return new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
