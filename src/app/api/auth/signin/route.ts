import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { rateLimit } from "@/lib/auth/rate-limit";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { unauthorized, ok, fail } from "@/lib/api/response";
import { signinSchema } from "@/lib/validations/auth";
import { toUser } from "@/lib/serializers";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    await rateLimit(`signin:${ip}`, 10, 15 * 60 * 1000);

    const body = await request.json().catch(() => null);
    const parsed = signinSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error);

    const { email, password, remember } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail }, include: { profile: true } });
    if (!user) throw unauthorized("We couldn't match that email and password.");
    const okPw = await verifyPassword(password, user.passwordHash);
    if (!okPw) throw unauthorized("We couldn't match that email and password.");

    const session = await createSession(user.id, remember ?? true, request.headers.get("user-agent") ?? undefined);
    const headers = new Headers();
    setSessionCookie(headers, session.raw, session.expiresAt);

    const res = new Response(JSON.stringify({ success: true, data: { user: toUser(user) } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    headers.forEach((v, k) => res.headers.append(k, v));
    return res;
  } catch (err) {
    return fail(err as Error);
  }
}
