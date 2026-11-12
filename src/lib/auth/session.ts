import { prisma } from "@/lib/db";
import { randomToken, tokenHash } from "./tokens";
import { cookies } from "next/headers";
import { ApiError } from "@/lib/api/errors";

const COOKIE_NAME = "folio_session";
const REMEMBER_DAYS = 30;
const SESSION_DAYS = 1;

export function sessionCookieName() {
  return COOKIE_NAME;
}

export function sessionCookieOptions(expiresAt: Date) {
  const secure = process.env.NODE_ENV === "production" || process.env.APP_URL?.startsWith("https");
  return {
    name: COOKIE_NAME,
    value: "", // filled by caller
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  };
}

export async function createSession(userId: string, remember = true, userAgent?: string) {
  const raw = randomToken();
  const hash = tokenHash(raw);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (remember ? REMEMBER_DAYS : SESSION_DAYS) * 24 * 60 * 60 * 1000);
  await prisma.session.create({
    data: { userId, tokenHash: hash, expiresAt, lastUsedAt: now, userAgent },
  });
  await prisma.user.update({ where: { id: userId }, data: { lastSignInAt: now } }).catch(() => {});
  return { raw, expiresAt };
}

export async function getSessionUser(request?: Request) {
  const cookieHeader = request?.headers.get("cookie") ?? (await readCookieHeader());
  const token = parseCookie(cookieHeader, COOKIE_NAME);
  if (!token) return null;
  const hash = tokenHash(token);
  const session = await prisma.session.findUnique({ where: { tokenHash: hash }, include: { user: { include: { profile: true } } } });
  if (!session) return null;
  if (session.revokedAt) return null;
  if (session.expiresAt < new Date()) return null;
  // touch lastUsedAt occasionally
  await prisma.session.update({ where: { id: session.id }, data: { lastUsedAt: new Date() } }).catch(() => {});
  return session.user;
}

export async function requireUser(request?: Request) {
  const user = await getSessionUser(request);
  if (!user) throw new ApiError("unauthorized", "You must be signed in to continue.", 401);
  return user;
}

export async function revokeSession(rawToken: string) {
  const hash = tokenHash(rawToken);
  await prisma.session.updateMany({ where: { tokenHash: hash }, data: { revokedAt: new Date() } });
}

export async function revokeAllSessions(userId: string) {
  await prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
}

export function setSessionCookie(headers: Headers, raw: string, expiresAt: Date) {
  const secure = process.env.NODE_ENV === "production" || process.env.APP_URL?.startsWith("https");
  const parts = [
    `${COOKIE_NAME}=${raw}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Expires=${expiresAt.toUTCString()}`,
  ];
  if (secure) parts.push("Secure");
  headers.append("Set-Cookie", parts.join("; "));
}

export function clearSessionCookie(headers: Headers) {
  const secure = process.env.NODE_ENV === "production" || process.env.APP_URL?.startsWith("https");
  const parts = [`${COOKIE_NAME}=`, `Path=/`, `HttpOnly`, `SameSite=Lax`, `Max-Age=0`, `Expires=Thu, 01 Jan 1970 00:00:00 GMT`];
  if (secure) parts.push("Secure");
  headers.append("Set-Cookie", parts.join("; "));
}

function parseCookie(header: string | null, name: string) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

async function readCookieHeader() {
  try {
    const store = await cookies();
    const c = store.get(COOKIE_NAME);
    return c ? `${COOKIE_NAME}=${c.value}` : null;
  } catch {
    return null;
  }
}
