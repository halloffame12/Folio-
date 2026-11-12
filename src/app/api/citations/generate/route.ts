import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { toPaper } from "@/lib/serializers";
import { generateCitationText } from "@/lib/services/citations";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const body = await request.json().catch(() => null);
    const parsed = z.object({ paperId: z.string().min(1), style: z.enum(["apa","mla","ieee","chicago"]) }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const { paperId, style } = parsed.data;
    const paperRow = await prisma.paper.findUnique({ where: { id: paperId }, include: { authors: true, identifiers: true } });
    if (!paperRow) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Paper not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    const paper = toPaper(paperRow);
    const text = generateCitationText(paper, style);
    const citation = await prisma.citation.upsert({
      where: { userId_paperId_style: { userId: user.id, paperId, style: style as any } },
      create: { userId: user.id, paperId, style: style as any, text, generatedAt: new Date() },
      update: { text, generatedAt: new Date() },
    });
    return new Response(JSON.stringify({ success: true, data: { id: citation.id, paperId, style, text, generatedAt: citation.generatedAt.toISOString() } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
