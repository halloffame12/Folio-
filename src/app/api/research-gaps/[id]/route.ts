import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { fail } from "@/lib/api/response";
import { getGapAnalysis } from "@/lib/services/gap-analysis";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const data = await getGapAnalysis(user.id, id);
    if (!data) return new Response(JSON.stringify({ success: false, error: { code: "not_found", message: "Analysis not found." } }), { status: 404, headers: { "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
