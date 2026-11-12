import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { toLibraryEntry } from "@/lib/serializers";
import { z } from "zod";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    const entry = await prisma.libraryEntry.findUnique({ where: { id } });
    if (!entry || entry.userId !== user.id) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Library entry not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });

    const body = await request.json().catch(() => null);
    const parsed = z.object({
      status: z.enum(["unread", "reading", "completed"]).optional(),
      readingProgress: z.number().min(0).max(100).optional(),
      lastOpenedAt: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);

    const { status, readingProgress, lastOpenedAt, tags } = parsed.data;
    const update: any = {};
    if (status) update.status = status;
    if (readingProgress !== undefined) update.readingProgress = Math.round(readingProgress);
    if (lastOpenedAt) update.lastOpenedAt = new Date(lastOpenedAt);
    if (status === "completed") update.readingProgress = 100;

    await prisma.libraryEntry.update({ where: { id }, data: update });

    if (tags) {
      // sync tags
      const tagIds: string[] = [];
      for (const name of tags) {
        const t = await prisma.tag.upsert({
          where: { userId_name: { userId: user.id, name } },
          create: { userId: user.id, name },
          update: {},
        });
        tagIds.push(t.id);
      }
      await prisma.paperTag.deleteMany({ where: { libraryEntryId: id } });
      for (const tagId of tagIds) {
        await prisma.paperTag.create({ data: { libraryEntryId: id, tagId } }).catch(() => {});
      }
    }

    const full = await prisma.libraryEntry.findUnique({ where: { id }, include: { tags: { include: { tag: true } } } });
    return new Response(JSON.stringify({ success: true, data: toLibraryEntry(full!) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    const entry = await prisma.libraryEntry.findUnique({ where: { id } });
    if (!entry || entry.userId !== user.id) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Library entry not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    await prisma.libraryEntry.delete({ where: { id } });
    return new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
