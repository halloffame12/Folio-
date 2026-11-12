import { NextRequest } from "next/server";
import { getSessionUser, revokeSession, clearSessionCookie } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { ok, fail } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    // revoke current session token
    const cookieHeader = request.headers.get("cookie");
    const match = cookieHeader?.match(/folio_session=([^;]+)/);
    const raw = match ? decodeURIComponent(match[1]) : null;
    if (raw) await revokeSession(raw);
    const headers = new Headers();
    clearSessionCookie(headers);
    const res = new Response(JSON.stringify({ success: true, data: { ok: true } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    headers.forEach((v, k) => res.headers.append(k, v));
    return res;
  } catch (err) {
    return fail(err as Error);
  }
}
