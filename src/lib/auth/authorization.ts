import { prisma } from "@/lib/db";
import { forbidden, notFound } from "@/lib/api/errors";

export async function getProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { members: true } });
  if (!project) throw notFound("Project not found.");
  const member = project.members.find((m) => m.userId === userId);
  if (!member) throw forbidden("You do not have access to this project.");
  if (member.status !== "active") throw forbidden("Your project invitation is not active.");
  return { project, member, role: member.role };
}

export function isOwnerOrAdmin(role: string) {
  return role === "Owner" || role === "Admin";
}

export async function requireProjectOwner(projectId: string, userId: string) {
  const access = await getProjectAccess(projectId, userId);
  if (access.role !== "Owner") throw forbidden("Only the project owner can perform this action.");
  return access;
}

export async function requireProjectManager(projectId: string, userId: string) {
  const access = await getProjectAccess(projectId, userId);
  if (!isOwnerOrAdmin(access.role)) throw forbidden("Only project owners or admins can perform this action.");
  return access;
}

export async function ownsResource(ownerId: string | null | undefined, userId: string) {
  if (ownerId !== userId) throw forbidden("You do not have permission to access this resource.");
}

export async function getPersonalLibraryEntry(userId: string, entryId: string) {
  const entry = await prisma.libraryEntry.findUnique({ where: { id: entryId } });
  if (!entry) throw notFound("Library entry not found.");
  if (entry.userId !== userId) throw forbidden("You do not have permission to access this library entry.");
  return entry;
}
