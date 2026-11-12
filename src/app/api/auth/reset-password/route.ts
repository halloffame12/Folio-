import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { tokenHash } from "@/lib/auth/tokens";
import { revokeAllSessions } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { rateLimit } from "@/lib/auth/rate-limit";
import { ok, fail } from "@/lib/api/response";
import { z } from "zod";
import { normalizeEmail } from "@/lib/validations/auth";

const schema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
  password: z.string().min(8).max(72).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/),
});

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    await rateLimit(`reset:${ip}`, 5, 15 * 60 * 1000);

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fail(parsed.error);

    const email = normalizeEmail(parsed.data.email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("invalid"); // generic

    const hash = tokenHash(parsed.data.token);
    const token = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hash } });
    if (!token || token.userId !== user.id || token.usedAt || token.expiresAt < new Date()) {
      return new Response(JSON.stringify({ success: false, error: { code: "expired_link", message: "This reset link is invalid or expired." } }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const passwordHash = await hashPassword(parsed.data.password);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    await prisma.passwordResetToken.update({ where: { id: token.id }, data: { usedAt: new Date() } });
    await revokeAllSessions(user.id);

    return new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return fail(err as Error);
  }
}
