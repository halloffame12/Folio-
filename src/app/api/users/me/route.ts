/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { ok, fail } from "@/lib/api/response";
import { toUser } from "@/lib/serializers";
import { z } from "zod";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  email: z.string().email().optional(),
  affiliation: z.string().trim().max(120).optional(),
  title: z.string().trim().max(120).optional(),
  researchInterests: z.array(z.string()).optional(),
  orcid: z.string().trim().max(40).optional(),
  settings: z.record(z.any()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const full = await prisma.user.findUnique({ where: { id: user.id }, include: { profile: true } });
    return new Response(JSON.stringify({ success: true, data: { user: toUser(full!), settings: full!.settings ?? {} } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return fail(err as Error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const body = await request.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error);

    const { name, email, affiliation, title, researchInterests, orcid, settings } = parsed.data;
    const data: any = {};
    if (name) data.name = name;
    if (email) data.email = email.trim().toLowerCase();
    if (settings) data.settings = settings;

    await prisma.user.update({ where: { id: user.id }, data });

    const profileData: any = {};
    if (affiliation !== undefined) profileData.institution = affiliation || null;
    if (title !== undefined) profileData.role = title || null;
    if (researchInterests !== undefined) profileData.researchInterests = researchInterests;
    if (orcid !== undefined) profileData.orcid = orcid || null;
    if (Object.keys(profileData).length) {
      await prisma.userProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, ...profileData },
        update: profileData,
      });
    }

    const full = await prisma.user.findUnique({ where: { id: user.id }, include: { profile: true } });
    return new Response(JSON.stringify({ success: true, data: { user: toUser(full!), settings: full!.settings ?? {} } }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return fail(err as Error);
  }
}
