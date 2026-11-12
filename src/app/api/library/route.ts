import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { toLibraryEntry } from "@/lib/serializers";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const entries = await prisma.libraryEntry.findMany({
      where: { userId: user.id },
      include: { tags: { include: { tag: true } } },
      orderBy: { addedAt: "desc" },
    });
    return new Response(JSON.stringify({ success: true, data: entries.map(toLibraryEntry) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const body = await request.json().catch(() => null);
    const parsed = z.object({ paperId: z.string().min(1) }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const { paperId } = parsed.data;
    const paper = await prisma.paper.findUnique({ where: { id: paperId } });
    if (!paper) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Paper not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    const existing = await prisma.libraryEntry.findUnique({ where: { userId_paperId: { userId: user.id, paperId } } });
    if (existing) {
      const full = await prisma.libraryEntry.findUnique({ where: { id: existing.id }, include: { tags: { include: { tag: true } } } });
      return new Response(JSON.stringify({ success: true, data: toLibraryEntry(full!) }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    const entry = await prisma.libraryEntry.create({ data: { userId: user.id, paperId, status: "unread", readingProgress: 0, lastOpenedAt: new Date() }, include: { tags: { include: { tag: true } } } });
    return new Response(JSON.stringify({ success: true, data: toLibraryEntry(entry) }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
