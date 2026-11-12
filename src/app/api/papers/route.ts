import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/api/same-origin";
import { fail } from "@/lib/api/response";
import { toPaper } from "@/lib/serializers";
import { searchScholarly } from "@/lib/services/scholarly";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    if (q) {
      const filters = {
        query: q,
        scope: (searchParams.get("scope") as any) || "all",
        yearFrom: searchParams.get("yearFrom") || undefined,
        yearTo: searchParams.get("yearTo") || undefined,
        type: (searchParams.get("type") as any) || "all",
        openAccessOnly: searchParams.get("openAccessOnly") === "true",
        sort: (searchParams.get("sort") as any) || "relevance",
        author: searchParams.get("author") || undefined,
      };
      const papers = await searchScholarly(filters as any);
      return new Response(JSON.stringify({ success: true, data: papers }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ success: true, data: [] }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const body = await request.json().catch(() => null);
    const parsed = z.object({
      title: z.string().trim().min(1).max(500),
      abstract: z.string().optional(),
      year: z.number().int().optional(),
      venue: z.string().optional(),
      venueShort: z.string().optional(),
      publicationType: z.enum(["journal", "conference", "preprint", "book-chapter"]).optional(),
      doi: z.string().optional(),
      citationCount: z.number().int().optional(),
      keywords: z.array(z.string()).optional(),
      sourceUrl: z.string().optional(),
      authors: z.array(z.object({ name: z.string(), affiliation: z.string().optional(), orcid: z.string().optional() })).optional(),
    }).safeParse(body);
    if (!parsed.success) return fail(parsed.error);
    const d = parsed.data;
    const paper = await prisma.paper.create({
      data: {
        title: d.title,
        abstract: d.abstract ?? null,
        year: d.year ?? null,
        venue: d.venue ?? null,
        venueShort: d.venueShort ?? d.venue ?? null,
        publicationType: (d.publicationType === "book-chapter" ? "book_chapter" : d.publicationType ?? "journal") as any,
        citationCount: d.citationCount ?? 0,
        keywords: d.keywords ?? [],
        pdfAvailable: false,
        sourceUrl: d.sourceUrl ?? null,
        source: "user",
        createdById: user.id,
        authors: { create: (d.authors ?? []).map((a, idx) => ({ name: a.name, affiliation: a.affiliation ?? null, orcid: a.orcid ?? null, position: idx })) },
        identifiers: d.doi ? { create: [{ type: "doi", value: d.doi }] } : undefined,
      },
      include: { authors: true, identifiers: true },
    });
    return new Response(JSON.stringify({ success: true, data: toPaper(paper) }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) { return fail(err as Error); }
}
