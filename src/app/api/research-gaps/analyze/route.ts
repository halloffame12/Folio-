import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { analyzeGap } from "@/lib/services/gap-analysis";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const body = await request.json().catch(() => null);
    const parsed = z.object({ topic: z.string().trim().min(1).max(120), paperIds: z.array(z.string()).optional() }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const result = await analyzeGap(user.id, parsed.data);
    return new Response(JSON.stringify({ success: true, data: result }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
