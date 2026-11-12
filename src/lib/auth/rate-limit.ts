import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/api/errors";

export async function rateLimit(key: string, limit: number, windowMs: number) {
  if (process.env.RATE_LIMIT_DISABLED === "true") return;
  const now = new Date();
  const existing = await prisma.rateLimitBucket.findUnique({ where: { key } });
  if (!existing || existing.expiresAt < now) {
    await prisma.rateLimitBucket.upsert({
      where: { key },
      create: { key, count: 1, expiresAt: new Date(now.getTime() + windowMs) },
      update: { count: 1, expiresAt: new Date(now.getTime() + windowMs) },
    });
    return;
  }
  if (existing.count >= limit) {
    throw new ApiError("rate_limited", "Too many attempts. Please try again later.", 429);
  }
  await prisma.rateLimitBucket.update({ where: { key }, data: { count: existing.count + 1 } });
}
