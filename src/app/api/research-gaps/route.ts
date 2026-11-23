import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { fail } from "@/lib/api/response";
import { listGapAnalyses } from "@/lib/services/gap-analysis";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const data = await listGapAnalyses(user.id);
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return fail(err as Error);
  }
}
