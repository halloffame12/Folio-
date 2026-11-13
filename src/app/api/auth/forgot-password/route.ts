import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/auth/rate-limit";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { newToken, tokenHash, sendEmail, resetUrl } from "@/lib/auth/email";
import { ok, fail } from "@/lib/api/response";
import { z } from "zod";
import { normalizeEmail } from "@/lib/validations/auth";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    await rateLimit(`forgot:${ip}`, 5, 15 * 60 * 1000);

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return fail(parsed.error);

    const email = normalizeEmail(parsed.data.email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const raw = newToken();
      const hash = tokenHash(raw);
      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash: hash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
      });
      const rUrl = resetUrl(raw, email);
      try {
        await sendEmail({
          to: email,
          subject: "Reset your Folio password",
          text: `Reset your password: ${rUrl}`,
          html: `<p>Reset your password: <a href="${rUrl}">${rUrl}</a></p>`,
        });
      } catch (e) {
        console.error("Reset email failed to send:", e);
      }
      if (process.env.AUTH_DEV_EXPOSE_LINKS === "true") {
        console.log(`[AUTH_DEV] reset url: ${rUrl}`);
      }
    }
    return new Response(JSON.stringify({ success: true, data: { message: "If an account exists for that address, reset instructions have been sent." } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return fail(err as Error);
  }
}
