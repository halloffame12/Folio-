import type { CitationStyle, Paper } from "@/types";

type NameParts = { first: string[]; last: string };

function splitName(name: string): NameParts {
  const parts = name.trim().split(/\s+/);
  const last = parts[parts.length - 1] ?? name;
  return { first: parts.slice(0, -1), last };
}

function initialsOf(parts: string[]) {
  return parts.map((p) => `${p[0]?.toUpperCase() ?? ""}.`).join(" ");
}

function apaAuthor(name: string) {
  const { first, last } = splitName(name);
  return `${last}, ${initialsOf(first)}`;
}

function mlaAuthor(name: string) {
  const { first, last } = splitName(name);
  return `${last}, ${first.join(" ")}`;
}

function ieeeAuthor(name: string) {
  const { first, last } = splitName(name);
  return `${initialsOf(first)} ${last}`.trim();
}

function chicagoAuthor(name: string) {
  const { first, last } = splitName(name);
  return `${last}, ${first.join(" ")}`;
}

function apaAuthors(paper: Paper) {
  const names = paper.authors.map((a) => apaAuthor(a.name));
  if (names.length === 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]}, & ${names[1]}`;
  const all = names.slice(0, -1).join(", ");
  return `${all}, & ${names[names.length - 1]}`;
}

function mlaAuthors(paper: Paper) {
  const names = paper.authors;
  if (names.length === 0) return "Anonymous";
  const first = mlaAuthor(names[0]!.name);
  if (names.length === 1) return first;
  if (names.length === 2) return `${first}, and ${names[1]!.name}`;
  return `${first}, et al.`;
}

function ieeeAuthors(paper: Paper) {
  const names = paper.authors.map((a) => ieeeAuthor(a.name));
  if (names.length === 0) return "Anonymous";
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function chicagoAuthors(paper: Paper) {
  const names = paper.authors.map((a) => chicagoAuthor(a.name));
  if (names.length === 0) return "Anonymous";
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]}, and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

const doiUrl = (paper: Paper) => `https://doi.org/${paper.doi}`;

const pagePart = (paper: Paper) =>
  paper.pages ? `${paper.pages.replace("–", "-")}` : "";

export function generateCitation(paper: Paper, style: CitationStyle): string {
  const year = paper.year;
  const title = paper.title.replace(/\.$/, "");
  const venue = paper.venue;
  const volume = paper.volume ?? "";
  const issue = paper.issue ?? "";
  const pages = pagePart(paper);

  switch (style) {
    case "apa": {
      const source =
        paper.publicationType === "conference"
          ? `In ${venue}${pages ? ` (pp. ${pages})` : ""}`
          : `${venue}${volume ? `, ${volume}` : ""}${issue ? `(${issue})` : ""}${pages ? `, ${pages}` : ""}`;
      return `${apaAuthors(paper)} (${year}). ${title}. ${source}.${paper.publisher ? ` ${paper.publisher}.` : ""} ${doiUrl(paper)}`;
    }
    case "mla": {
      const source =
        paper.publicationType === "conference"
          ? `In ${venue}${pages ? `, pp. ${pages}` : ""}`
          : `${venue}${volume ? `, vol. ${volume}` : ""}${issue ? `, no. ${issue}` : ""}${pages ? `, pp. ${pages}` : ""}`;
      return `${mlaAuthors(paper)} "${title}." ${source}, ${year}. DOI: ${paper.doi}.`;
    }
    case "ieee": {
      const source =
        paper.publicationType === "conference"
          ? `in ${venue}`
          : `${venue}${volume ? `, vol. ${volume}` : ""}${issue ? `, no. ${issue}` : ""}${pages ? `, pp. ${pages}` : ""}`;
      return `${ieeeAuthors(paper)}, "${title}," ${source}${paper.publicationType === "conference" && pages ? `, pp. ${pages}` : ""}, ${year}${paper.publisher ? `, ${paper.publisher}` : ""}, doi: ${paper.doi}.`;
    }
    case "chicago": {
      const source =
        paper.publicationType === "conference"
          ? `In ${venue}${pages ? `, ${pages}` : ""}`
          : `${venue}${volume ? ` ${volume}` : ""}${issue ? ` (${issue})` : ""}${pages ? `: ${pages}` : ""}`;
      return `${chicagoAuthors(paper)}. ${year}. "${title}." ${source}. ${doiUrl(paper)}.`;
    }
    default:
      return "";
  }
}

export function generateInTextCitation(paper: Paper, style: CitationStyle) {
  const names = paper.authors.map((a) => splitName(a.name).last);
  const first = names[0] ?? "Anonymous";
  switch (style) {
    case "apa":
    case "chicago":
      if (names.length === 1) return `(${first}, ${paper.year})`;
      if (names.length === 2) return `(${first} & ${names[1]}, ${paper.year})`;
      return `(${first} et al., ${paper.year})`;
    case "mla":
      if (names.length === 1) return `(${first} ${paper.year})`;
      return `(${first} et al. ${paper.year})`;
    case "ieee":
      return `[${paper.year}]`;
    default:
      return "";
  }
}

export const citationStyleLabels: Record<CitationStyle, string> = {
  apa: "APA 7th edition",
  mla: "MLA 9th edition",
  ieee: "IEEE",
  chicago: "Chicago 17th edition",
};

export const citationStyleShort: Record<CitationStyle, string> = {
  apa: "APA 7",
  mla: "MLA 9",
  ieee: "IEEE",
  chicago: "Chicago",
};

export function generateBibliography(papers: Paper[], style: CitationStyle) {
  return papers
    .map((p) => generateCitation(p, style))
    .sort((a, b) => a.localeCompare(b))
    .join("\n\n");
}

export function missingMetadata(paper: Paper) {
  const missing: string[] = [];
  if (!paper.doi) missing.push("DOI");
  if (!paper.volume && paper.publicationType === "journal") missing.push("Volume");
  if (!paper.pages) missing.push("Page range");
  if (!paper.publisher) missing.push("Publisher");
  if (paper.authors.length === 0) missing.push("Authors");
  return missing;
}
