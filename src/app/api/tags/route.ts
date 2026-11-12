import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const tags = await prisma.tag.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } });
    return new Response(JSON.stringify({ success: true, data: tags.map((t) => t.name) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const body = await request.json().catch(() => null);
    const parsed = z.object({ name: z.string().trim().min(1).max(40) }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const tag = await prisma.tag.upsert({ where: { userId_name: { userId: user.id, name: parsed.data.name } }, create: { userId: user.id, name: parsed.data.name }, update: {} });
    return new Response(JSON.stringify({ success: true, data: tag.name }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
