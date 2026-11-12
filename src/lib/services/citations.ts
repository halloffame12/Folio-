import type { Paper } from "@/types";
import type { CitationStyle } from "@/types";

export function generateCitationText(paper: Paper, style: CitationStyle) {
  const authors = paper.authors.map((a) => a.name).filter(Boolean);
  const authorStr = authors.length ? authors.join(", ") : "Unknown author";
  const year = paper.year || "n.d.";
  const title = paper.title;
  const venue = paper.venue || paper.venueShort;
  const doi = paper.doi ? `https://doi.org/${paper.doi}` : paper.sourceUrl;

  switch (style) {
    case "apa":
      return `${authorStr} (${year}). ${title}. ${venue}.${paper.volume ? ` ${paper.volume}` : ""}${paper.issue ? `(${paper.issue})` : ""}${paper.pages ? `, ${paper.pages}` : ""}. ${doi ? doi : ""}`.trim();
    case "mla":
      return `${authorStr}. "${title}." ${venue}, vol. ${paper.volume ?? ""}, no. ${paper.issue ?? ""}, ${year}, pp. ${paper.pages ?? ""}. ${doi ?? ""}`.trim();
    case "ieee":
      return `${authorStr}, "${title}," ${venue}, ${paper.volume ? `vol. ${paper.volume}, ` : ""}${paper.pages ? `pp. ${paper.pages}, ` : ""}${year}.`;
    case "chicago":
      return `${authorStr}. "${title}." ${venue} ${paper.volume ?? ""}, no. ${paper.issue ?? ""} (${year}): ${paper.pages ?? ""}. ${doi ?? ""}`.trim();
    default:
      return `${authorStr} (${year}). ${title}. ${venue}.`;
  }
}
