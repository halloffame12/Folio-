import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/auth/rate-limit";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { newToken, tokenHash, sendEmail, verificationUrl } from "@/lib/auth/email";
import { ok, fail } from "@/lib/api/response";
import { z } from "zod";
import { normalizeEmail } from "@/lib/validations/auth";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    await rateLimit(`resend:${ip}`, 5, 15 * 60 * 1000);

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fail(parsed.error);

    const email = normalizeEmail(parsed.data.email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && !user.emailVerifiedAt) {
      const raw = newToken();
      const hash = tokenHash(raw);
      await prisma.emailVerificationToken.create({
        data: { userId: user.id, tokenHash: hash, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      });
      const vUrl = verificationUrl(raw, email);
      await sendEmail({ to: email, subject: "Verify your Folio email", text: `Verify: ${vUrl}`, html: `<a href="${vUrl}">${vUrl}</a>` });
      if (process.env.AUTH_DEV_EXPOSE_LINKS === "true") console.log(`[AUTH_DEV] verification url: ${vUrl}`);
    }
    return new Response(JSON.stringify({ success: true, data: { message: "If an account exists, a new verification link has been sent." } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return fail(err as Error);
  }
}
