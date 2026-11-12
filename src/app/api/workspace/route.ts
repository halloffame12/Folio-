import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { getWorkspace } from "@/lib/services/workspace";
import { fail } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const workspace = await getWorkspace(user.id);
    return new Response(JSON.stringify({ success: true, data: workspace }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return fail(err as Error);
  }
}
