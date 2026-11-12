import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { z } from "zod";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    const col = await prisma.collection.findUnique({ where: { id } });
    if (!col || col.userId !== user.id) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Collection not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    const body = await request.json().catch(() => null);
    const parsed = z.object({ paperId: z.string().min(1) }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    await prisma.collectionPaper.upsert({
      where: { collectionId_paperId: { collectionId: id, paperId: parsed.data.paperId } },
      create: { collectionId: id, paperId: parsed.data.paperId },
      update: {},
    });
    // ensure saved in library
    await prisma.libraryEntry.upsert({
      where: { userId_paperId: { userId: user.id, paperId: parsed.data.paperId } },
      create: { userId: user.id, paperId: parsed.data.paperId, status: "unread", readingProgress: 0, lastOpenedAt: new Date() },
      update: {},
    });
    return new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    const col = await prisma.collection.findUnique({ where: { id } });
    if (!col || col.userId !== user.id) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Collection not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    const url = new URL(request.url);
    const paperId = url.searchParams.get("paperId");
    if (!paperId) return new Response(JSON.stringify({ success: false, error: { code: "bad_request", message: "paperId required." } }), { status: 400, headers: { "Content-Type": "application/json" } });
    await prisma.collectionPaper.deleteMany({ where: { collectionId: id, paperId } });
    return new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
