import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { z } from "zod";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Task not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    const body = await request.json().catch(() => null);
    const parsed = z.object({ body: z.string().trim().min(1).max(2000) }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const comment = await prisma.taskComment.create({ data: { taskId: id, authorId: user.id, body: parsed.data.body } });
    return new Response(JSON.stringify({ success: true, data: { id: comment.id, authorId: comment.authorId, body: comment.body, createdAt: comment.createdAt.toISOString() } }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
