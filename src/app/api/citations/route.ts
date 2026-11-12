import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { fail } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const cits = await prisma.citation.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    return new Response(JSON.stringify({ success: true, data: cits.map((c) => ({ id: c.id, paperId: c.paperId, style: c.style, text: c.text, generatedAt: c.generatedAt.toISOString() })) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
