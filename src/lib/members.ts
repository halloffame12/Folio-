import type { ProjectMember, User } from "@/types";
import { usersById } from "@/lib/client-registry";

export function memberProfile(member: ProjectMember): User {
  const user = usersById[member.userId];
  if (user) return user;
  const email = member.email ?? "";
  const fallbackName =
    member.name ?? (email ? email.split("@")[0]?.replace(/[._]/g, " ") ?? "Invited scholar" : "Invited scholar");
  return {
    id: member.userId,
    name: fallbackName,
    email,
    affiliation: "Invitation pending",
    title: "Invited collaborator",
    researchInterests: [],
    initials: fallbackName
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join(""),
    joinedAt: member.joinedAt,
  };
}

export function memberInitials(member: ProjectMember) {
  return memberProfile(member).initials;
}

export function avatarTone(userId: string) {
  const tones = [
    "bg-primary/12 text-primary",
    "bg-accent/14 text-accent",
    "bg-warning/14 text-warning",
    "bg-secondary text-secondary-foreground",
  ];
  const sum = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return tones[sum % tones.length];
}
