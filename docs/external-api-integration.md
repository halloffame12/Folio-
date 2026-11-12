# External API Integration — Detailed Documentation (Amogh Das)

## Overview

Scholarly metadata is retrieved from Crossref and OpenAlex through a dedicated service layer
(`src/lib/services/scholarly.ts`). External logic is kept out of route handlers. Results are
normalized to a common `Paper` format, deduplicated, persisted and cached.

## Providers

### Crossref

- Endpoint: `https://api.crossref.org/works`
- Used for search, DOI metadata, authors, journal, publication date, abstract, subjects.
- Query params: `query`, `rows`, `mailto` (polite pool).

### OpenAlex

- Endpoint: `https://api.openalex.org/works`
- Used for work search, metadata, authors/institutions, concepts/keywords, citation counts,
  open-access info.
- Query params: `search`, `per-page`, `mailto`.

## Normalization

### Crossref → Paper

- `title`: first element of `title` array.
- `authors`: `author[].given + family`, affiliation, ORCID.
- `year`: from `published-print`/`published-online`/`created` date-parts.
- `venue`: `container-title`; `venueShort`: `short-container-title`.
- `publicationType`: mapped from `type` (journal-article, proceedings-article, posted-content,
  book-chapter, ...).
- `doi`: `DOI`.
- `citationCount`: `is-referenced-by-count`.
- `keywords`: `subject`.
- `abstract`: `abstract` with JATS tags stripped.
- `volume`, `issue`, `pages`, `publisher`.

### OpenAlex → Paper

- `title`: `title`.
- `authors`: `authorships[].author.display_name`, institutions, ORCID.
- `year`: `publication_year`.
- `venue`: `host_venue.display_name`.
- `publicationType`: mapped from `type`.
- `doi`: `doi` (stripped of prefix).
- `citationCount`: `cited_by_count`.
- `keywords`: concepts + keywords.
- `abstract`: reconstructed from `abstract_inverted_index`.
- `openAccess`: `open_access.is_oa`, `oa_url`.
- `volume`, `issue`, `pages` from `biblio`.

## Deduplication

- Papers are deduplicated by identifiers (`PaperIdentifier`, unique `type+value`).
- On upsert, existing paper found by any identifier (DOI/OpenAlex) is updated rather than
  duplicated.
- Search results are deduped by DOI (or title if no DOI).

## Caching

- Search response paper IDs cached in `ApiCache` with 10-minute TTL.
- Cache key includes serialized filters.

## Resilience

- 15-second timeout via `AbortController`.
- Provider failures are logged; partial results returned.
- Missing fields passed through as null/empty (never fabricated).
- `pdfAvailable` true only when provider supplies an open-access URL.

## Environment

- `CROSSREF_API_BASE` (default `https://api.crossref.org`)
- `CROSSREF_MAILTO`
- `OPENALEX_API_BASE` (default `https://api.openalex.org`)
- `OPENALEX_MAILTO`

## API contract (external search)

`GET /api/papers?q=<query>&author=&yearFrom=&yearTo=&type=&openAccessOnly=&sort=`

Returns an array of normalized `Paper` objects. Papers are upserted into the database so that
saving them to the library references a stable record.

## Limits

- Not every field is present for every paper.
- Rate limits and transient failures may yield partial results.
- Metadata is externally sourced and labelled as such in the UI.