import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { toLitReview } from "@/lib/serializers";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const reviews = await prisma.literatureReview.findMany({
      where: { userId: user.id },
      include: {
        sections: { include: { children: { include: { children: { include: { children: true, papers: true } }, papers: true } }, papers: true } },
        papers: true,
        notes: true,
      },
      orderBy: { updatedAt: "desc" },
    });
    return new Response(JSON.stringify({ success: true, data: (reviews as any[]).map(toLitReview) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const body = await request.json().catch(() => null);
    const parsed = z.object({ title: z.string().trim().min(1).max(200), projectId: z.string().optional(), researchQuestion: z.string().optional() }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const d = parsed.data;
    const review = await prisma.literatureReview.create({
      data: {
        userId: user.id,
        projectId: d.projectId ?? null,
        title: d.title,
        researchQuestion: d.researchQuestion ?? "",
        sections: { create: [{ title: "Introduction", content: "", position: 0 }, { title: "Methods", content: "", position: 1 }, { title: "Findings", content: "", position: 2 }, { title: "Discussion", content: "", position: 3 }] },
      },
      include: {
        sections: { include: { children: { include: { children: { include: { children: true, papers: true } }, papers: true } }, papers: true } },
        papers: true,
        notes: true,
      },
    });
    return new Response(JSON.stringify({ success: true, data: toLitReview(review) }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
