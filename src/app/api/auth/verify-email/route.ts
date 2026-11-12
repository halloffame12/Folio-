import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { tokenHash } from "@/lib/auth/tokens";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { rateLimit } from "@/lib/auth/rate-limit";
import { ok, fail } from "@/lib/api/response";
import { z } from "zod";
import { normalizeEmail } from "@/lib/validations/auth";

const schema = z.object({ email: z.string().email(), token: z.string().min(10) });

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    await rateLimit(`verify:${ip}`, 10, 15 * 60 * 1000);

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fail(parsed.error);

    const email = normalizeEmail(parsed.data.email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: { code: "invalid_email", message: "Open the verification link from your email to continue." } }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const hash = tokenHash(parsed.data.token);
    const token = await prisma.emailVerificationToken.findUnique({ where: { tokenHash: hash } });
    if (!token || token.userId !== user.id || token.usedAt || token.expiresAt < new Date()) {
      return new Response(JSON.stringify({ success: false, error: { code: "expired_link", message: "This verification link has expired. Request a new link." } }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    await prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
    await prisma.emailVerificationToken.update({ where: { id: token.id }, data: { usedAt: new Date() } });
    return new Response(JSON.stringify({ success: true, data: { verified: true } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return fail(err as Error);
  }
}
