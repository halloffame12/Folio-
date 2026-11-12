/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Paper, User } from "@/types";

export const papers: Paper[] = [];
export const papersById: Record<string, Paper> = {};
export const users: User[] = [];
export const usersById: Record<string, User> = {};
export const allTags: string[] = [];
export const researchTopics: any[] = [];

export function registerTags(list: string[]) {
  allTags.length = 0;
  for (const t of list || []) allTags.push(t);
}

export function registerPapers(list: Paper[]) {
  for (const p of list || []) {
    if (!papersById[p.id]) papers.push(p);
    papersById[p.id] = p;
  }
}

export function syncWorkspace(payload: { papers: Paper[]; members: User[]; data?: { library?: any[] } }) {
  // papers
  papers.length = 0;
  for (const k of Object.keys(papersById)) delete papersById[k];
  for (const p of payload.papers || []) {
    papers.push(p);
    papersById[p.id] = p;
  }
  // users
  users.length = 0;
  for (const k of Object.keys(usersById)) delete usersById[k];
  for (const u of payload.members || []) {
    users.push(u);
    usersById[u.id] = u;
  }
  // tags
  allTags.length = 0;
  const tagSet = new Set<string>();
  // derive from papers keywords maybe
  for (const p of payload.papers || []) for (const k of p.keywords || []) tagSet.add(k);
  for (const t of tagSet) allTags.push(t);
}
