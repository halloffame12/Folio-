import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { toCollection } from "@/lib/serializers";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const cols = await prisma.collection.findMany({ where: { userId: user.id }, include: { papers: true }, orderBy: { createdAt: "desc" } });
    return new Response(JSON.stringify({ success: true, data: cols.map(toCollection) }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const body = await request.json().catch(() => null);
    const parsed = z.object({ name: z.string().trim().min(1).max(80), description: z.string().optional(), color: z.enum(["forest","terracotta","sand","sage","ink"]).optional() }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const { name, description, color } = parsed.data;
    const col = await prisma.collection.create({ data: { userId: user.id, name, description: description ?? "", color: (color ?? "forest") as any }, include: { papers: true } });
    return new Response(JSON.stringify({ success: true, data: toCollection(col) }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
