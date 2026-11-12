import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { rateLimit } from "@/lib/auth/rate-limit";
import { sendEmail, verificationUrl, newToken, tokenHash } from "@/lib/auth/email";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { badRequest, conflict, ok, fail } from "@/lib/api/response";
import { signupSchema } from "@/lib/validations/auth";
import { toUser } from "@/lib/serializers";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    await rateLimit(`signup:${ip}`, 5, 15 * 60 * 1000);

    const body = await request.json().catch(() => null);
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error);

    const { fullName, email, password, institution, role, interests } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) throw conflict("An account already exists for this email.", { email: "An account already exists for this email." });

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: fullName.trim(),
        email: normalizedEmail,
        passwordHash,
        profile: {
          create: {
            institution: institution?.trim() || null,
            role: (role && (role as string) !== "" ? role : null) as any,
            researchInterests: interests ? interests.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8) : [],
          },
        },
      },
      include: { profile: true },
    });

    // verification token
    const rawToken = newToken();
    const hash = tokenHash(rawToken);
    await prisma.emailVerificationToken.create({
      data: { userId: user.id, tokenHash: hash, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    });
    const vUrl = verificationUrl(rawToken, normalizedEmail);
    await sendEmail({
      to: normalizedEmail,
      subject: "Verify your Folio email address",
      text: `Verify your email: ${vUrl}`,
      html: `<p>Verify your email: <a href="${vUrl}">${vUrl}</a></p>`,
    });

    const session = await createSession(user.id, true, request.headers.get("user-agent") ?? undefined);
    const headers = new Headers();
    setSessionCookie(headers, session.raw, session.expiresAt);

    const payload: Record<string, unknown> = { user: toUser(user), verificationSent: true };
    if (process.env.AUTH_DEV_EXPOSE_LINKS === "true") payload.devVerificationUrl = vUrl;

    return new Response(JSON.stringify({ success: true, data: payload }), {
      status: 201,
      headers: { "Content-Type": "application/json", ...Object.fromEntries(headers.entries()) },
    });
  } catch (err) {
    return fail(err as Error);
  }
}
