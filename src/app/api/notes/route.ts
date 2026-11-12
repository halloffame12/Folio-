import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { toNote } from "@/lib/serializers";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const notes = await prisma.note.findMany({ where: { userId: user.id }, include: { papers: true, tags: { include: { tag: true } } }, orderBy: { updatedAt: "desc" } });
    return new Response(JSON.stringify({ success: true, data: notes.map(toNote) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const body = await request.json().catch(() => null);
    const parsed = z.object({ title: z.string().trim().min(1).max(200), content: z.string().optional(), tags: z.array(z.string()).optional(), paperIds: z.array(z.string()).optional(), projectId: z.string().optional() }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const d = parsed.data;
    const note = await prisma.note.create({
      data: {
        userId: user.id,
        title: d.title,
        content: d.content ?? "",
        projectId: d.projectId ?? null,
        papers: { create: (d.paperIds ?? []).map((pid) => ({ paperId: pid })) },
      },
      include: { papers: true, tags: { include: { tag: true } } },
    });
    // tags
    if (d.tags?.length) {
      for (const name of d.tags) {
        const t = await prisma.tag.upsert({ where: { userId_name: { userId: user.id, name } }, create: { userId: user.id, name }, update: {} });
        await prisma.noteTag.upsert({ where: { noteId_tagId: { noteId: note.id, tagId: t.id } }, create: { noteId: note.id, tagId: t.id }, update: {} }).catch(() => {});
      }
    }
    const full = await prisma.note.findUnique({ where: { id: note.id }, include: { papers: true, tags: { include: { tag: true } } } });
    return new Response(JSON.stringify({ success: true, data: toNote(full!) }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
