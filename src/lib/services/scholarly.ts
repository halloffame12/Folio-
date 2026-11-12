/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/db";
import type { PaperSearchFilters, PublicationType } from "@/types";
import { toPaper } from "@/lib/serializers";

const TIMEOUT_MS = 15000;

async function fetchJson(url: string) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "Folio/1.0 (mailto:research@example.com)" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

function stripTags(s: string) {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function crossrefType(t?: string): PublicationType {
  switch (t) {
    case "proceedings-article": return "conference";
    case "posted-content":
    case "preprint": return "preprint";
    case "book-chapter": return "book-chapter";
    default: return "journal";
  }
}

function openalexType(t?: string): PublicationType {
  switch (t) {
    case "proceedings-article": return "conference";
    case "preprint": return "preprint";
    case "book-chapter": return "book-chapter";
    default: return "journal";
  }
}

interface NormalizedPaper {
  title: string;
  abstract: string;
  year: number | null;
  venue: string;
  venueShort: string;
  publicationType: PublicationType;
  doi: string;
  citationCount: number;
  keywords: string[];
  pdfAvailable: boolean;
  sourceUrl: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  openAccess?: boolean;
  source: "crossref" | "openalex";
  externalId: string;
  authors: { name: string; affiliation: string; orcid?: string }[];
  identifiers: { type: string; value: string }[];
}

function normalizeCrossref(item: any): NormalizedPaper {
  const title = Array.isArray(item.title) ? item.title[0] : item.title || "Untitled";
  const authors = (item.author || []).map((a: any) => ({
    name: [a.given, a.family].filter(Boolean).join(" ").trim() || a.name || "Unknown",
    affiliation: a.affiliation?.[0]?.name ?? "",
    orcid: a.ORCID ? String(a.ORCID).replace("https://orcid.org/", "") : undefined,
  }));
  const dateParts = item["published-print"]?.["date-parts"]?.[0] || item["published-online"]?.["date-parts"]?.[0] || item.created?.["date-parts"]?.[0];
  const year = dateParts?.[0] ? Number(dateParts[0]) : null;
  const venue = Array.isArray(item["container-title"]) ? item["container-title"][0] : item["container-title"] ?? "";
  const venueShort = Array.isArray(item["short-container-title"]) ? item["short-container-title"][0] : item["short-container-title"] ?? venue;
  const doi = item.DOI ?? "";
  const identifiers: { type: string; value: string }[] = [];
  if (doi) identifiers.push({ type: "doi", value: doi });
  if (item.URL) identifiers.push({ type: "url", value: item.URL });
  return {
    title,
    abstract: item.abstract ? stripTags(item.abstract) : "",
    year,
    venue,
    venueShort: venueShort || venue,
    publicationType: crossrefType(item.type),
    doi,
    citationCount: item["is-referenced-by-count"] ?? 0,
    keywords: item.subject ?? [],
    pdfAvailable: false,
    sourceUrl: item.URL ?? (doi ? `https://doi.org/${doi}` : ""),
    volume: item.volume,
    issue: item.issue,
    pages: item.page,
    publisher: item.publisher,
    openAccess: undefined,
    source: "crossref",
    externalId: doi || item.URL || title,
    authors,
    identifiers,
  };
}

function reconstructAbstract(inv: any): string {
  if (!inv || typeof inv !== "object") return "";
  const positions: { word: string; pos: number }[] = [];
  for (const [word, posArr] of Object.entries(inv)) {
    for (const pos of posArr as number[]) positions.push({ word, pos });
  }
  positions.sort((a, b) => a.pos - b.pos);
  return positions.map((p) => p.word).join(" ");
}

function normalizeOpenAlex(item: any): NormalizedPaper {
  const title = item.title || "Untitled";
  const authors = (item.authorships || []).map((a: any) => ({
    name: a.author?.display_name || "Unknown",
    affiliation: a.institutions?.[0]?.display_name ?? "",
    orcid: a.author?.orcid ? String(a.author.orcid).replace("https://orcid.org/", "") : undefined,
  }));
  const year = item.publication_year ?? null;
  const venue = item.host_venue?.display_name ?? item.primary_location?.source?.display_name ?? "";
  const venueShort = item.primary_location?.source?.abbreviated_title ?? venue;
  const doi = item.doi ? String(item.doi).replace("https://doi.org/", "") : "";
  const identifiers: { type: string; value: string }[] = [];
  if (doi) identifiers.push({ type: "doi", value: doi });
  if (item.id) identifiers.push({ type: "openalex", value: String(item.id) });
  const keywords = [
    ...(item.concepts || []).map((c: any) => c.display_name),
    ...(item.keywords || []).map((k: any) => (typeof k === "string" ? k : k.keyword)),
  ].filter(Boolean).slice(0, 12);
  return {
    title,
    abstract: reconstructAbstract(item.abstract_inverted_index),
    year,
    venue,
    venueShort: venueShort || venue,
    publicationType: openalexType(item.type),
    doi,
    citationCount: item.cited_by_count ?? 0,
    keywords,
    pdfAvailable: Boolean(item.open_access?.oa_url),
    sourceUrl: item.primary_location?.landing_page_url ?? item.id ?? "",
    volume: item.biblio?.volume,
    issue: item.biblio?.issue,
    pages: item.biblio?.first_page && item.biblio?.last_page ? `${item.biblio.first_page}-${item.biblio.last_page}` : item.biblio?.first_page,
    publisher: item.primary_location?.source?.publisher,
    openAccess: item.open_access?.is_oa,
    source: "openalex",
    externalId: String(item.id ?? doi ?? title),
    authors,
    identifiers,
  };
}

async function upsertPaper(norm: NormalizedPaper) {
  // find existing by identifiers
  const idValues = norm.identifiers.map((i) => i.value).filter(Boolean);
  let existingId: string | null = null;
  if (idValues.length) {
    const found = await prisma.paperIdentifier.findFirst({
      where: { OR: norm.identifiers.map((i) => ({ type: i.type as any, value: i.value })) },
      select: { paperId: true },
    });
    existingId = found?.paperId ?? null;
  }
  if (existingId) {
    await prisma.paper.update({
      where: { id: existingId },
      data: {
        title: norm.title,
        abstract: norm.abstract || undefined,
        year: norm.year ?? undefined,
        venue: norm.venue || undefined,
        venueShort: norm.venueShort || undefined,
        publicationType: norm.publicationType as any,
        citationCount: norm.citationCount,
        keywords: norm.keywords,
        pdfAvailable: norm.pdfAvailable,
        sourceUrl: norm.sourceUrl || undefined,
        volume: norm.volume,
        issue: norm.issue,
        pages: norm.pages,
        publisher: norm.publisher,
        openAccess: norm.openAccess,
      },
    });
    // identifiers upsert
    for (const ident of norm.identifiers) {
      await prisma.paperIdentifier.upsert({
        where: { type_value: { type: ident.type as any, value: ident.value } },
        create: { paperId: existingId, type: ident.type as any, value: ident.value },
        update: {},
      }).catch(() => {});
    }
    return existingId;
  }
  const created = await prisma.paper.create({
    data: {
      title: norm.title,
      abstract: norm.abstract || null,
      year: norm.year,
      venue: norm.venue || null,
      venueShort: norm.venueShort || null,
      publicationType: norm.publicationType as any,
      citationCount: norm.citationCount,
      keywords: norm.keywords,
      pdfAvailable: norm.pdfAvailable,
      sourceUrl: norm.sourceUrl || null,
      volume: norm.volume,
      issue: norm.issue,
      pages: norm.pages,
      publisher: norm.publisher,
      openAccess: norm.openAccess ?? false,
      source: norm.source,
      authors: {
        create: norm.authors.map((a, idx) => ({ name: a.name, affiliation: a.affiliation || null, orcid: a.orcid || null, position: idx })),
      },
      identifiers: {
        create: norm.identifiers.map((i) => ({ type: i.type as any, value: i.value })),
      },
    },
  });
  return created.id;
}

export async function searchScholarly(filters: PaperSearchFilters) {
  const q = filters.query?.trim() ?? "";
  if (!q) return [];
  const mailto = process.env.CROSSREF_MAILTO || process.env.OPENALEX_MAILTO;
  const crossrefBase = process.env.CROSSREF_API_BASE || "https://api.crossref.org";
  const openalexBase = process.env.OPENALEX_API_BASE || "https://api.openalex.org";

  // cache key
  const cacheKey = `scholarly:search:${JSON.stringify(filters)}`;
  const cached = await prisma.apiCache.findUnique({ where: { key: cacheKey } });
  if (cached && cached.expiresAt > new Date()) {
    const ids = cached.payload as string[];
    const papers = await prisma.paper.findMany({ where: { id: { in: ids } }, include: { authors: true, identifiers: true } });
    return papers.map(toPaper);
  }

  const results: NormalizedPaper[] = [];
  // Crossref
  try {
    const url = `${crossrefBase}/works?query=${encodeURIComponent(q)}&rows=20${mailto ? `&mailto=${encodeURIComponent(mailto)}` : ""}`;
    const json = await fetchJson(url);
    for (const item of json?.message?.items ?? []) results.push(normalizeCrossref(item));
  } catch (e) {
    console.error("Crossref search failed", e);
  }
  // OpenAlex
  try {
    const url = `${openalexBase}/works?search=${encodeURIComponent(q)}&per-page=20${mailto ? `&mailto=${encodeURIComponent(mailto)}` : ""}`;
    const json = await fetchJson(url);
    for (const item of json?.results ?? []) results.push(normalizeOpenAlex(item));
  } catch (e) {
    console.error("OpenAlex search failed", e);
  }

  // dedupe by doi/title
  const seen = new Set<string>();
  const unique: NormalizedPaper[] = [];
  for (const r of results) {
    const key = r.doi ? `doi:${r.doi.toLowerCase()}` : `title:${r.title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(r);
  }

  // filter by year/type if provided
  let filtered = unique;
  if (filters.yearFrom) {
    const from = Number(filters.yearFrom);
    if (!Number.isNaN(from)) filtered = filtered.filter((p) => (p.year ?? 0) >= from);
  }
  if (filters.yearTo) {
    const to = Number(filters.yearTo);
    if (!Number.isNaN(to)) filtered = filtered.filter((p) => (p.year ?? 0) <= to);
  }
  if (filters.type && filters.type !== "all") {
    filtered = filtered.filter((p) => p.publicationType === filters.type);
  }
  if (filters.openAccessOnly) {
    filtered = filtered.filter((p) => p.openAccess);
  }

  // persist
  const ids: string[] = [];
  for (const norm of filtered) {
    const id = await upsertPaper(norm);
    ids.push(id);
  }

  // cache
  await prisma.apiCache.upsert({
    where: { key: cacheKey },
    create: { key: cacheKey, payload: ids, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    update: { payload: ids, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
  });

  const papers = await prisma.paper.findMany({ where: { id: { in: ids } }, include: { authors: true, identifiers: true } });
  return papers.map(toPaper);
}

export async function fetchPaperMetadataByIdentifier(type: string, value: string) {
  // returns paper from db if exists
  const ident = await prisma.paperIdentifier.findUnique({ where: { type_value: { type: type as any, value } }, include: { paper: { include: { authors: true, identifiers: true } } } });
  if (ident?.paper) return toPaper(ident.paper);
  return null;
}
