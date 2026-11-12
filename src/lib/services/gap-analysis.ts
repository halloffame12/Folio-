import { prisma } from "@/lib/db";
import { toPaper } from "@/lib/serializers";

export async function analyzeGap(userId: string, input: { topic: string; paperIds?: string[] }) {
  const papers = await prisma.paper.findMany({
    where: input.paperIds?.length ? { id: { in: input.paperIds } } : {},
    include: { authors: true, identifiers: true },
  });
  const topic = await prisma.researchTopic.upsert({
    where: { userId_name: { userId, name: input.topic } },
    create: { userId, name: input.topic, cluster: "General", keywords: [] },
    update: {},
  });
  // link papers
  for (const p of papers) {
    await prisma.researchTopicPaper.upsert({
      where: { topicId_paperId: { topicId: topic.id, paperId: p.id } },
      create: { topicId: topic.id, paperId: p.id },
      update: {},
    }).catch(() => {});
  }

  const byYear: Record<string, number> = {};
  const authorCounts: Record<string, number> = {};
  const keywordCounts: Record<string, number> = {};
  for (const p of papers) {
    const y = p.year ? String(p.year) : "unknown";
    byYear[y] = (byYear[y] ?? 0) + 1;
    for (const a of p.authors) authorCounts[a.name] = (authorCounts[a.name] ?? 0) + 1;
    for (const k of p.keywords) keywordCounts[k] = (keywordCounts[k] ?? 0) + 1;
  }
  const topAuthors = Object.entries(authorCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count }));
  const topKeywords = Object.entries(keywordCounts).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([keyword, count]) => ({ keyword, count }));
  const underrepresented = Object.entries(keywordCounts)
    .filter(([, c]) => c <= 2)
    .map(([keyword, count]) => ({ keyword, count }))
    .slice(0, 10);

  const result = {
    topic: input.topic,
    corpusSize: papers.length,
    byYear,
    topAuthors,
    topKeywords,
    underrepresented,
    note: "Counts are descriptive and based only on the provided corpus. Low representation is a prompt for enquiry, not proof of a research gap.",
  };

  const analysis = await prisma.gapAnalysis.create({
    data: {
      userId,
      topicId: topic.id,
      name: input.topic,
      corpusSize: papers.length,
      result,
      papers: { create: papers.map((p) => ({ paperId: p.id })) },
    },
  });
  return { analysisId: analysis.id, result, papers: papers.map(toPaper) };
}

export async function getGapAnalysis(userId: string, id: string) {
  const a = await prisma.gapAnalysis.findUnique({ where: { id }, include: { papers: { include: { paper: { include: { authors: true, identifiers: true } } } } } });
  if (!a || a.userId !== userId) return null;
  return { id: a.id, name: a.name, corpusSize: a.corpusSize, result: a.result, createdAt: a.createdAt.toISOString(), papers: a.papers.map((p) => toPaper(p.paper)) };
}

export async function getGapEvidence(userId: string, id: string) {
  const a = await prisma.gapAnalysis.findUnique({ where: { id }, include: { papers: { include: { paper: { include: { authors: true, identifiers: true } } } } } });
  if (!a || a.userId !== userId) return null;
  return a.papers.map((p) => toPaper(p.paper));
}
