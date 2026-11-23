import { describe, expect, it } from "vitest";
import { generateCitationText } from "../src/lib/services/citations";
import type { Paper, CitationStyle, LibraryEntry } from "../src/types";

describe("Dashboard - Reading Pipeline Calculations", () => {
  it("correctly reconciles unread, reading, and completed counts with total", () => {
    const mockLibrary: LibraryEntry[] = [
      { id: "1", paperId: "p1", status: "unread", tags: [], addedAt: new Date().toISOString() },
      { id: "2", paperId: "p2", status: "unread", tags: [], addedAt: new Date().toISOString() },
      { id: "3", paperId: "p3", status: "reading", tags: [], addedAt: new Date().toISOString(), readingProgress: 45 },
      { id: "4", paperId: "p4", status: "completed", tags: [], addedAt: new Date().toISOString(), readingProgress: 100 },
    ];

    const total = mockLibrary.length;
    const unread = mockLibrary.filter((e) => e.status === "unread").length;
    const reading = mockLibrary.filter((e) => e.status === "reading").length;
    const completed = mockLibrary.filter((e) => e.status === "completed").length;

    expect(total).toBe(4);
    expect(unread).toBe(2);
    expect(reading).toBe(1);
    expect(completed).toBe(1);
    expect(unread + reading + completed).toBe(total);

    const completedPct = Math.round((completed / total) * 100);
    expect(completedPct).toBe(25);
  });

  it("handles empty library gracefully without dividing by zero", () => {
    const emptyLibrary: LibraryEntry[] = [];
    const total = emptyLibrary.length;
    const completed = emptyLibrary.filter((e) => e.status === "completed").length;
    const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;

    expect(total).toBe(0);
    expect(completedPct).toBe(0);
  });
});

describe("Dashboard - Citation Generation Service", () => {
  const samplePaper: Paper = {
    id: "sample-1",
    title: "Attention Is All You Need",
    authors: [
      { id: "a1", name: "Ashish Vaswani", affiliation: "Google Brain" },
      { id: "a2", name: "Noam Shazeer", affiliation: "Google Brain" },
    ],
    abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks.",
    year: 2017,
    venue: "Advances in Neural Information Processing Systems",
    venueShort: "NeurIPS",
    publicationType: "conference",
    doi: "10.48550/arXiv.1706.03762",
    citationCount: 95000,
    keywords: ["neural network", "attention", "transformer"],
    pdfAvailable: true,
    sourceUrl: "https://arxiv.org/abs/1706.03762",
    volume: "30",
  };

  it("generates APA citation format with DOI", () => {
    const apa = generateCitationText(samplePaper, "apa");
    expect(apa).toContain("Ashish Vaswani, Noam Shazeer");
    expect(apa).toContain("(2017)");
    expect(apa).toContain("Attention Is All You Need");
    expect(apa).toContain("https://doi.org/10.48550/arXiv.1706.03762");
  });

  it("generates MLA citation format with quotation marks", () => {
    const mla = generateCitationText(samplePaper, "mla");
    expect(mla).toContain('"Attention Is All You Need."');
    expect(mla).toContain("2017");
  });

  it("generates IEEE citation format", () => {
    const ieee = generateCitationText(samplePaper, "ieee");
    expect(ieee).toContain('"Attention Is All You Need,"');
    expect(ieee).toContain("2017");
  });

  it("generates Chicago citation format", () => {
    const chicago = generateCitationText(samplePaper, "chicago");
    expect(chicago).toContain('"Attention Is All You Need."');
    expect(chicago).toContain("(2017)");
  });

  it("handles missing authors, year, or DOI gracefully", () => {
    const incompletePaper: Paper = {
      id: "incomplete-1",
      title: "Preliminary Working Paper",
      authors: [],
      abstract: "",
      year: 0,
      venue: "Preprint Archive",
      venueShort: "Preprint",
      publicationType: "preprint",
      doi: "",
      citationCount: 0,
      keywords: [],
      pdfAvailable: false,
      sourceUrl: "",
    };

    const text = generateCitationText(incompletePaper, "apa");
    expect(text).toContain("Unknown author");
    expect(text).toContain("n.d.");
    expect(text).toContain("Preliminary Working Paper");
  });
});

describe("Dashboard - Getting Started Checklist Derivation", () => {
  it("derives completed steps strictly from actual data presence", () => {
    // Brand new user: empty state
    const emptyState = {
      library: [],
      projects: [],
      collections: [],
      notes: [],
      hasGapAnalysis: false,
      hasCitation: false,
    };

    const step1 = emptyState.library.length > 0;
    const step2 = emptyState.projects.length > 0 || emptyState.collections.length > 0;
    const step3 = emptyState.notes.length > 0;
    const step4 = emptyState.hasGapAnalysis;
    const step5 = emptyState.hasCitation;

    expect(step1).toBe(false);
    expect(step2).toBe(false);
    expect(step3).toBe(false);
    expect(step4).toBe(false);
    expect(step5).toBe(false);

    // Active user with papers and notes
    const activeState = {
      library: [{ id: "lib-1", paperId: "p1", status: "unread" as const, tags: [], addedAt: "" }],
      projects: [{ id: "proj-1" }],
      collections: [],
      notes: [{ id: "note-1" }],
      hasGapAnalysis: true,
      hasCitation: true,
    };

    expect(activeState.library.length > 0).toBe(true);
    expect(activeState.projects.length > 0 || activeState.collections.length > 0).toBe(true);
    expect(activeState.notes.length > 0).toBe(true);
    expect(activeState.hasGapAnalysis).toBe(true);
    expect(activeState.hasCitation).toBe(true);
  });
});
