# Database — Detailed Documentation (Aakash Chourasia)

## Overview

Folio uses PostgreSQL (hosted on Neon in production, local PostgreSQL for development and tests).
The ORM is Prisma 7. The schema lives in `prisma/schema.prisma`; migrations live in
`prisma/migrations/`. The database is the single source of truth for all persistent data; the
frontend never stores authoritative data in `localStorage`.

## Connection

- `DATABASE_URL` points at the PostgreSQL instance.
- Local dev: `postgresql://postgres:postgres@127.0.0.1:5432/folio_dev?schema=public`
- Tests: `postgresql://postgres:postgres@127.0.0.1:5432/folio_test?schema=public`
- Production: Neon connection string with `sslmode=require`.
- Prisma config: `prisma.config.ts` reads `DATABASE_URL` via dotenv.

## Prisma client

`src/lib/db.ts` creates a singleton `PrismaClient` using `PrismaPg` adapter. In non-production the
instance is cached on `globalThis` to avoid exhausting connections during hot reload.

## Schema overview

### Authentication and users

- `User` — core account: `id`, `name`, `email` (unique), `passwordHash`, `emailVerifiedAt`,
  `settings` (JSON), `createdAt`, `updatedAt`, `lastSignInAt`.
- `UserProfile` — one-to-one with `User`: `institution`, `role` (AcademicRole), `department`,
  `researchInterests` (String[]), `orcid`, `avatarUrl`.
- `Session` — hashed session token, `userId`, `expiresAt`, `lastUsedAt`, `revokedAt`, `userAgent`.
  Indexed by `userId,expiresAt` and `expiresAt`.
- `EmailVerificationToken` — hashed token, `userId`, `expiresAt`, `usedAt`.
- `PasswordResetToken` — hashed token, `userId`, `expiresAt`, `usedAt`.

### Research papers

- `Paper` — title, abstract, year, venue, venueShort, publicationType, citationCount, keywords
  (String[]), pdfAvailable, sourceUrl, volume, issue, pages, publisher, openAccess, source
  (crossref/openalex/user), createdById (nullable, for user-entered papers).
- `PaperAuthor` — `paperId`, `name`, `affiliation`, `orcid`, `position`.
- `PaperIdentifier` — `paperId`, `type` (doi/openalex/crossref/issn/isbn/pmid/arxiv/url),
  `value`; unique `type+value` for deduplication.

### Library and organisation

- `LibraryEntry` — `userId`, `paperId`, `status` (unread/reading/completed), `readingProgress`,
  `addedAt`, `lastOpenedAt`; unique `userId+paperId`.
- `Collection` — `userId`, `name` (unique per user), `description`, `color`, timestamps.
- `CollectionPaper` — `collectionId`, `paperId`; unique pair.
- `Tag` — `userId`, `name` (unique per user), `color`.
- `PaperTag` — `libraryEntryId`, `tagId`; unique pair (tags on a library entry).
- `Note` — `userId`, `title`, `content`, `pinned`, `projectId` (nullable), timestamps.
- `NotePaper` — `noteId`, `paperId`, optional `libraryEntryId`.
- `NoteTag` — `noteId`, `tagId`.

### Research projects

- `Project` — `title`, `description`, `status`, `ownerId`, `progress`, `deadline`, `tag`,
  `accent`, timestamps.
- `ProjectMember` — `projectId`, `userId` (nullable for invited-only), `role` (Owner/Admin/Member),
  `status` (active/invited), `invitedEmail`, `invitedName`, `joinedAt`.
- `ProjectInvitation` — `projectId`, `email`, `name`, `role`, `tokenHash` (unique), `invitedById`,
  `expiresAt`, `acceptedAt`.
- `ProjectPaper` — `projectId`, `paperId`.

### Tasks and milestones

- `Task` — `projectId`, `title`, `description`, `status`, `priority`, `assigneeId` (nullable),
  `dueDate`, `createdById`, timestamps.
- `TaskComment` — `taskId`, `authorId`, `body`, `createdAt`.
- `TaskPaper` — `taskId`, `paperId`.
- `Milestone` — `projectId`, `title`, `description`, `dueDate`, `status`, `progress`, timestamps.
- `MilestoneTask` — `milestoneId`, `taskId` (unique taskId, so a task belongs to at most one milestone).
- `MilestoneAssignee` — `milestoneId`, `userId`.

### Literature reviews

- `LiteratureReview` — `userId`, `projectId` (nullable), `title`, `researchQuestion`, `progress`,
  timestamps.
- `LiteratureReviewSection` — `reviewId`, `parentId` (nullable, self-referential tree), `title`,
  `content`, `position`, timestamps.
- `LiteratureReviewPaper` — `reviewId`, `paperId`.
- `LiteratureReviewNote` — `reviewId`, `noteId`.
- `LiteratureReviewSectionPaper` — `sectionId`, `paperId`.
- `LiteratureReviewEvidence` — `reviewId`, `sectionId` (nullable), `paperId` (nullable),
  `noteId` (nullable), `content`, timestamps.

### Research Gap Explorer

- `ResearchTopic` — `userId`, `name` (unique per user), `cluster`, `description`, `keywords` (String[]).
- `ResearchTopicPaper` — `topicId`, `paperId`.
- `GapAnalysis` — `userId`, `topicId` (nullable), `name`, `corpusSize`, `result` (JSON), `createdAt`.
- `GapAnalysisPaper` — `analysisId`, `paperId`, optional `role`.

### Citations

- `Citation` — `userId`, `paperId`, `style` (apa/mla/ieee/chicago), `text`, `generatedAt`;
  unique `userId+paperId+style`.

### Activity and notifications

- `Activity` — `actorId`, `action`, `target`, `href`, `kind`, `projectId` (nullable), `createdAt`.
- `Notification` — `userId` (recipient), `type`, `title`, `body`, `read`, `href`, `actorId` (nullable),
  `projectId` (nullable), `createdAt`.

### Caching and rate limiting

- `ApiCache` — `key` (unique), `payload` (JSON), `expiresAt`.
- `RateLimitBucket` — `key` (unique), `count`, `expiresAt`, `updatedAt`.

## Indexes

Indexes are defined on foreign keys and common query fields, e.g. `User.createdAt`,
`Session.userId+expiresAt`, `LibraryEntry.userId+addedAt`, `Project.ownerId`, `Task.projectId+status`,
`Notification.userId+read+createdAt`, `Activity.createdAt`, `GapAnalysis.userId+createdAt`, etc.

## Deletion rules

- Deleting a `User` cascades to profile, sessions, tokens, tags, collections, library entries,
  notes, owned projects, memberships, tasks created/assigned, comments, reviews, citations,
  activities, notifications, research topics, gap analyses.
- Deleting a `Project` cascades to members, invitations, tasks, milestones, project papers,
  notes (via SetNull on Note.projectId), reviews (SetNull), activities/notifications.
- Deleting a `Paper` cascades to authors, identifiers, library entries, collection papers,
  note papers, project papers, task papers, review papers/sections/evidence, citations, topic
  papers, gap papers.
- `Task.milestoneId` is modeled via `MilestoneTask` with unique `taskId`, so deleting a milestone
  removes the link and tasks remain.

## Linkage to other modules

- Aakash's schema is consumed by Sumit's backend through Prisma generated types.
- Amogh's scholarly service upserts `Paper`/`PaperAuthor`/`PaperIdentifier` records.
- Sumit's serializers (`src/lib/serializers.ts`) map DB rows to the frontend types defined in
  `src/types/index.ts`.

## Commands

```bash
npm run db:migrate      # create + apply migration (dev)
npm run db:deploy       # apply migrations (prod/CI)
npm run db:generate     # regenerate Prisma client
npm run db:studio       # browse data
```