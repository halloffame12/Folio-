import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { toUser } from "@/lib/serializers";
import { ok } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return new Response(JSON.stringify({ success: true, data: { user: null } }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify({ success: true, data: { user: toUser(user) } }), { status: 200, headers: { "Content-Type": "application/json" } });
}
