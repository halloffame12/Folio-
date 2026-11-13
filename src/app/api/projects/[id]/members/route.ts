import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { getProjectAccess, requireProjectManager } from "@/lib/auth/authorization";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { toProject } from "@/lib/serializers";
import { z } from "zod";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    await getProjectAccess(id, user.id);
    const project = await prisma.project.findUnique({ where: { id }, include: { members: true, papers: true } });
    return new Response(JSON.stringify({ success: true, data: toProject(project!).members }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id } = await params;
    await requireProjectManager(id, user.id);
    const body = await request.json().catch(() => null);
    const parsed = z.object({ email: z.string().email(), name: z.string().optional(), role: z.enum(["Admin","Member"]).default("Member") }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const { email, name, role } = parsed.data;
    const normalized = email.trim().toLowerCase();

    // find existing user
    const existingUser = await prisma.user.findUnique({ where: { email: normalized } });

    // invitation token
    const rawToken = (await import("@/lib/auth/tokens")).randomToken();
    const hash = (await import("@/lib/auth/tokens")).tokenHash(rawToken);
    await prisma.projectInvitation.create({
      data: { projectId: id, email: normalized, name: name ?? null, role: role as any, tokenHash: hash, invitedById: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    // create member record (invited) if not already
    const memberExists = await prisma.projectMember.findFirst({ where: { projectId: id, invitedEmail: normalized } });
    if (!memberExists) {
      await prisma.projectMember.create({
        data: { projectId: id, userId: existingUser?.id ?? null, role: role as any, status: "invited", invitedEmail: normalized, invitedName: name ?? existingUser?.name ?? null },
      });
    }

    // send email
    const { sendEmail } = await import("@/lib/auth/email");
    const base = process.env.APP_URL || "http://localhost:3000";
    const acceptUrl = `${base}/invitations/accept?token=${rawToken}`;
    try {
      await sendEmail({ to: normalized, subject: "You're invited to a Folio project", text: `Accept invitation: ${acceptUrl}`, html: `<a href="${acceptUrl}">${acceptUrl}</a>` });
    } catch (e) {
      console.error("Invitation email failed to send:", e);
    }

    return new Response(JSON.stringify({ success: true, data: { ok: true, devAcceptUrl: process.env.AUTH_DEV_EXPOSE_LINKS === "true" ? acceptUrl : undefined } }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
