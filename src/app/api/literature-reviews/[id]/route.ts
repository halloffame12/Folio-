import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { toLitReview } from "@/lib/serializers";
import { z } from "zod";

async function load(id: string, userId: string) {
  const r = await prisma.literatureReview.findUnique({ where: { id } });
  if (!r || r.userId !== userId) return null;
  return r;
}

const includeSections = { sections: { include: { children: { include: { children: { include: { children: true, papers: true } }, papers: true } }, papers: true } }, papers: true, notes: true };

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const r = await load(id, user.id);
    if (!r) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Review not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    const full = await prisma.literatureReview.findUnique({ where: { id }, include: includeSections as any });
    return new Response(JSON.stringify({ success: true, data: toLitReview(full as any) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    const r = await load(id, user.id);
    if (!r) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Review not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    const body = await request.json().catch(() => null);
    const parsed = z.object({
      title: z.string().trim().min(1).max(200).optional(),
      researchQuestion: z.string().optional(),
      progress: z.number().min(0).max(100).optional(),
      paperIds: z.array(z.string()).optional(),
      noteIds: z.array(z.string()).optional(),
      sectionUpdate: z.object({ sectionId: z.string(), content: z.string() }).optional(),
    }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const d = parsed.data;
    const update: any = {};
    if (d.title !== undefined) update.title = d.title;
    if (d.researchQuestion !== undefined) update.researchQuestion = d.researchQuestion;
    if (d.progress !== undefined) update.progress = Math.round(d.progress);
    await prisma.literatureReview.update({ where: { id }, data: update });

    if (d.sectionUpdate) {
      await prisma.literatureReviewSection.update({ where: { id: d.sectionUpdate.sectionId }, data: { content: d.sectionUpdate.content } });
    }
    if (d.paperIds) {
      await prisma.literatureReviewPaper.deleteMany({ where: { reviewId: id } });
      for (const pid of d.paperIds) await prisma.literatureReviewPaper.create({ data: { reviewId: id, paperId: pid } }).catch(() => {});
    }
    if (d.noteIds) {
      await prisma.literatureReviewNote.deleteMany({ where: { reviewId: id } });
      for (const nid of d.noteIds) await prisma.literatureReviewNote.create({ data: { reviewId: id, noteId: nid } }).catch(() => {});
    }
    const full = await prisma.literatureReview.findUnique({ where: { id }, include: includeSections as any });
    return new Response(JSON.stringify({ success: true, data: toLitReview(full as any) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    const r = await load(id, user.id);
    if (!r) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Review not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    await prisma.literatureReview.delete({ where: { id } });
    return new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
