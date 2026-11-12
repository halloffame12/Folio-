import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { toNote } from "@/lib/serializers";
import { z } from "zod";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const note = await prisma.note.findUnique({ where: { id }, include: { papers: true, tags: { include: { tag: true } } } });
    if (!note || note.userId !== user.id) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Note not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ success: true, data: toNote(note) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note || note.userId !== user.id) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Note not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    const body = await request.json().catch(() => null);
    const parsed = z.object({ title: z.string().trim().min(1).max(200).optional(), content: z.string().optional(), tags: z.array(z.string()).optional(), paperIds: z.array(z.string()).optional(), projectId: z.string().nullable().optional(), pinned: z.boolean().optional() }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const d = parsed.data;
    const update: any = {};
    if (d.title !== undefined) update.title = d.title;
    if (d.content !== undefined) update.content = d.content;
    if (d.pinned !== undefined) update.pinned = d.pinned;
    if (d.projectId !== undefined) update.projectId = d.projectId;
    await prisma.note.update({ where: { id }, data: update });

    if (d.paperIds) {
      await prisma.notePaper.deleteMany({ where: { noteId: id } });
      for (const pid of d.paperIds) await prisma.notePaper.create({ data: { noteId: id, paperId: pid } }).catch(() => {});
    }
    if (d.tags) {
      await prisma.noteTag.deleteMany({ where: { noteId: id } });
      for (const name of d.tags) {
        const t = await prisma.tag.upsert({ where: { userId_name: { userId: user.id, name } }, create: { userId: user.id, name }, update: {} });
        await prisma.noteTag.upsert({ where: { noteId_tagId: { noteId: id, tagId: t.id } }, create: { noteId: id, tagId: t.id }, update: {} }).catch(() => {});
      }
    }
    const full = await prisma.note.findUnique({ where: { id }, include: { papers: true, tags: { include: { tag: true } } } });
    return new Response(JSON.stringify({ success: true, data: toNote(full!) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note || note.userId !== user.id) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Note not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    await prisma.note.delete({ where: { id } });
    return new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
