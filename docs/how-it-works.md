# Folio — Complete Application Guide

This document explains how the entire Folio application is connected and how it works.
It is written to be used as source material for presentations (PPT) and for generating
explanatory videos (e.g., with NotebookLM).

---

## 1. What is Folio?

Folio is a full-stack web application for academic researchers. It helps a user:

- Search scholarly papers (Crossref + OpenAlex).
- Save papers to a personal library.
- Organise papers with collections, tags, notes, and reading status.
- Run research projects with teammates, tasks, milestones, and literature reviews.
- Explore potential research gaps based on their saved papers.
- Generate citations in APA, MLA, IEEE, and Chicago styles.

Every user sees only their own data. There is no shared demo data in production.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript (strict) |
| UI | Tailwind CSS, Radix UI primitives, shadcn-style components |
| State | Zustand (hydrated from server, no localStorage auth) |
| Forms | React Hook Form + Zod |
| Backend | Next.js route handlers (TypeScript) |
| Database | PostgreSQL on Neon (Prisma 7 ORM) |
| Auth | Custom session auth (bcrypt, HTTP-only cookies) |
| Email | Resend (console provider for dev) |
| External data | Crossref API, OpenAlex API |
| Testing | Vitest (integration), TypeScript, ESLint |
| Hosting | Vercel |

---

## 3. High-Level Architecture

```
Browser (React UI)
   |
   | HTTP (cookies for session)
   v
Next.js App Router
   ├── (marketing)  → public pages
   ├── (auth)       → sign in / sign up / forgot / verify
   └── (workspace)  → authenticated pages (StoreGate checks session)
        |
        v
   API Route Handlers (/api/*)
        |
        ├── Auth (session, password, tokens, rate limiting)
        ├── Workspace hydration (/api/workspace)
        ├── Domain CRUD (papers, library, collections, tags, notes,
        │   projects, members, tasks, milestones, reviews, gaps, citations)
        |
        v
   Prisma Client
        |
        v
   PostgreSQL (Neon)
        |
        └── External: Crossref API, OpenAlex API (scholarly search)
```

---

## 4. How the Pieces Connect

### 4.1 Authentication

1. User signs up at `/signup` with name, email, password, institution, role, interests.
2. The server validates input (Zod), checks email uniqueness, hashes the password (bcrypt),
   creates a `User` + `UserProfile`, creates an email-verification token, sends a verification
   email (Resend or console), creates a session, and sets an HTTP-only cookie.
3. On subsequent requests, `getSessionUser` reads the cookie, hashes the token, looks up the
   `Session` row, checks expiry/revocation, and returns the user.
4. `requireUser` throws 401 if no valid session.
5. Sign-out revokes the session and clears the cookie.
6. Password reset: request creates a single-use expiring token; reset validates it, updates
   the password hash, and revokes all sessions.

### 4.2 Session and Authorization

- Every private API route calls `requireUser(request)`.
- Ownership checks: personal resources (library, notes, collections, tags) must belong to
  the authenticated user.
- Project access: `getProjectAccess` checks `ProjectMember` status and role.
  - Owner/Admin can manage members and settings.
  - Members can view and work on project data.
- IDs in URLs are always validated against the session user.

### 4.3 Workspace Hydration

1. The workspace layout renders `StoreGate`.
2. `StoreGate` calls `/api/auth/session`; if no user, redirects to `/signin`.
3. It calls `useWorkspaceStore.hydrate()`, which fetches `/api/workspace`.
4. `/api/workspace` (service `getWorkspace`) assembles:
   - Profile + settings.
   - Library entries, collections, notes, projects, tasks, milestones, literature reviews,
     notifications, activity.
   - All referenced papers and project members.
5. The store syncs the client registry (papers, users, tags) and sets state.
6. Pages read from the store; no mock data is used.

### 4.4 Scholarly Search (Discover)

1. User enters a query on `/discover`.
2. Frontend calls `GET /api/papers?q=...`.
3. Route handler calls `searchScholarly(filters)`:
   - Queries Crossref and OpenAlex in parallel (with timeout).
   - Normalizes both responses to a common `Paper` shape.
   - Deduplicates by DOI (then title).
   - Applies filters (year, type, open access).
   - Upserts papers + authors + identifiers into the database (dedup by identifier).
   - Caches result IDs in `ApiCache` (10 min TTL).
4. Returns normalized `Paper[]` to the frontend.
5. Results are registered in the client registry so paper detail pages work.

### 4.5 Library, Collections, Tags, Notes

- **Library**: save a paper (creates `LibraryEntry`), remove, update reading status/progress,
  tags, last-opened. Ownership enforced.
- **Collections**: create/rename/delete collections; add/remove papers (auto-saves paper to
  library). Ownership enforced.
- **Tags**: create/delete tags per user; tags applied to library entries via `PaperTag`.
- **Notes**: create/edit/delete notes with content, tags, linked papers, project. Ownership
  enforced.

### 4.6 Projects, Members, Tasks, Milestones

- **Projects**: create (owner becomes active Owner member), update, delete (owner only).
- **Members**: invite by email (creates `ProjectInvitation` + invited `ProjectMember`, sends
  email). Accept via `/invitations/accept` activates membership and links user. Role changes
  and removal enforce manager/owner rules.
- **Tasks**: create with title, status, priority, assignee, due date, papers, milestone.
  Update status/priority/etc., delete, add comments.
- **Milestones**: create with title, due date, assignees; update progress/status; delete.

### 4.7 Literature Reviews

- Create a review (with default sections: Introduction, Methods, Findings, Discussion).
- Edit title, research question, progress.
- Update section content.
- Link papers and notes.
- Delete review (cascades sections/papers/notes/evidence).

### 4.8 Research Gap Explorer

- User enters a topic and runs analysis.
- Backend collects the user's saved papers (from library).
- Computes: papers by year, top authors, top keywords, underrepresented keywords.
- Stores a `GapAnalysis` with the result JSON and linked papers.
- Returns analysis + supporting papers.
- Frontend displays corpus size, by-year, authors, keywords, potential opportunities, and
  supporting papers with links.
- Results are descriptive, not scientifically proven gaps.

### 4.9 Citations

- Generate citation text from paper metadata in APA/MLA/IEEE/Chicago.
- Upsert by user + paper + style (regenerating updates text).
- List and delete saved citations.

### 4.10 Notifications and Activity

- Notifications stored per user (invitation, assignment, deadline, milestone, mention, system).
- Mark read / mark all read.
- Activity feed records events (paper, note, task, milestone, comment, project, member) scoped
  to the user's projects.

---

## 5. Database Schema (Summary)

### Auth & users
- `User` (id, name, email unique, passwordHash, emailVerifiedAt, settings, timestamps)
- `UserProfile` (institution, role, department, researchInterests, orcid, avatarUrl)
- `Session` (tokenHash unique, userId, expiresAt, revokedAt)
- `EmailVerificationToken`, `PasswordResetToken`

### Papers
- `Paper` (title, abstract, year, venue, publicationType, citationCount, keywords, source, ...)
- `PaperAuthor` (paperId, name, affiliation, orcid, position)
- `PaperIdentifier` (paperId, type, value) — unique type+value for dedup

### Library & organisation
- `LibraryEntry` (userId, paperId, status, readingProgress, addedAt, lastOpenedAt) — unique userId+paperId
- `Collection` (userId, name unique per user, color)
- `CollectionPaper` (collectionId, paperId)
- `Tag` (userId, name unique per user)
- `PaperTag` (libraryEntryId, tagId)
- `Note` (userId, title, content, pinned, projectId)
- `NotePaper`, `NoteTag`

### Projects
- `Project` (title, description, status, ownerId, progress, deadline, tag, accent)
- `ProjectMember` (projectId, userId nullable, role, status, invitedEmail, invitedName)
- `ProjectInvitation` (projectId, email, tokenHash unique, invitedById, expiresAt, acceptedAt)
- `ProjectPaper`

### Tasks & milestones
- `Task` (projectId, title, status, priority, assigneeId, dueDate, createdById)
- `TaskComment`, `TaskPaper`
- `Milestone` (projectId, title, dueDate, status, progress)
- `MilestoneTask` (milestoneId, taskId unique)
- `MilestoneAssignee`

### Literature reviews
- `LiteratureReview` (userId, projectId, title, researchQuestion, progress)
- `LiteratureReviewSection` (reviewId, parentId self-ref, title, content, position)
- `LiteratureReviewPaper`, `LiteratureReviewNote`, `LiteratureReviewSectionPaper`,
  `LiteratureReviewEvidence`

### Research Gap Explorer
- `ResearchTopic` (userId, name unique per user, cluster, keywords)
- `ResearchTopicPaper`
- `GapAnalysis` (userId, topicId, name, corpusSize, result JSON)
- `GapAnalysisPaper`

### Citations
- `Citation` (userId, paperId, style, text, generatedAt) — unique userId+paperId+style

### Activity & notifications
- `Activity` (actorId, action, target, href, kind, projectId, createdAt)
- `Notification` (userId, type, title, body, read, actorId, projectId, createdAt)

### Caching & rate limiting
- `ApiCache` (key unique, payload JSON, expiresAt)
- `RateLimitBucket` (key unique, count, expiresAt)

---

## 6. Key Data Flows

### Flow A: New user signs up
1. `/signup` form → `POST /api/auth/signup`.
2. Server validates, creates User + UserProfile, verification token, session cookie.
3. Frontend redirects to `/dashboard`.
4. `StoreGate` hydrates from `/api/workspace` (empty data for new user).
5. Dashboard shows zero counts and empty states.

### Flow B: Discover and save a paper
1. `/discover` → user searches → `GET /api/papers?q=...`.
2. Server queries Crossref + OpenAlex, normalizes, dedupes, persists, caches.
3. Results displayed; user clicks "Save".
4. `POST /api/library` creates `LibraryEntry`.
5. Store re-hydrates; library page shows the paper.

### Flow C: Research project with collaborator
1. `/projects` → create project → `POST /api/projects`.
2. Open project → invite member by email → `POST /api/projects/:id/members`.
3. Server creates invitation + invited member, sends email.
4. Invitee signs in, opens `/invitations/accept?token=...` → `POST /api/invitations/accept`.
5. Membership activated; project appears in invitee's project list.

### Flow D: Research Gap Explorer
1. `/research-gaps` → enter topic → run analysis.
2. `POST /api/research-gaps/analyze` with topic + library paper IDs.
3. Server computes statistics, stores `GapAnalysis`, returns result + papers.
4. Frontend displays corpus size, by-year, authors, keywords, opportunities, supporting papers.

### Flow E: Citation generation
1. `/citations` or paper detail → generate citation.
2. `POST /api/citations/generate` with paperId + style.
3. Server generates text from paper metadata, upserts citation.
4. Frontend displays and copies text.

---

## 7. Security Model

- **Authentication**: server-side sessions via HTTP-only, SameSite, Secure cookies.
- **Authorization**: every private resource checked against the session user on the server.
  - Ownership for personal data.
  - Membership + role for project data.
- **Validation**: Zod on all inputs; invalid data never persisted.
- **Rate limiting**: DB-backed per-IP buckets on auth endpoints.
- **Error handling**: consistent envelope, no internal details or stack traces.
- **Secrets**: stored in environment variables, never committed.
- **Email**: abstraction with console (dev) or Resend (prod); no pretended delivery.

---

## 8. Testing

- **Unit/integration**: Vitest with 16 tests against `folio_test` database.
  - Auth: signup validation, duplicate email, signin success/failure, session, logout,
    password reset, email verification.
  - Ownership/isolation: user A cannot see user B's notes.
  - CRUD: library, notes, collections, tags, projects, tasks, milestones, literature reviews,
    gap analysis, citations.
  - External: search failure handling.
- **Type checking**: `tsc --noEmit` (strict).
- **Linting**: ESLint (next/core-web-vitals + next/typescript).
- **Build**: `next build` (production).

---

## 9. Deployment

- **Hosting**: Vercel (Next.js).
- **Database**: Neon PostgreSQL (`DATABASE_URL`).
- **Build command**: `prisma generate && next build`.
- **Migrations**: `prisma migrate deploy` (run against Neon).
- **Environment variables**: `DATABASE_URL`, `AUTH_SECRET`, `APP_URL`, `EMAIL_PROVIDER`,
  `EMAIL_PROVIDER_API_KEY`, `EMAIL_FROM`, `CROSSREF_*`, `OPENALEX_*`, `AUTH_DEV_EXPOSE_LINKS`,
  `RATE_LIMIT_DISABLED`.

---

## 10. Presentation Outline (PPT Slides)

1. **Title**: Folio — Academic Research & Resource Management Platform
2. **Problem**: Research work scattered across multiple tools.
3. **Objectives**: Unified platform for discovery, organisation, collaboration, gaps, citations.
4. **Architecture**: Frontend → API → Database + External APIs (diagram).
5. **Authentication & Security**: sessions, cookies, ownership, membership, rate limiting.
6. **Database**: normalized PostgreSQL schema, dedup, cascades, indexes.
7. **Scholarly Integration**: Crossref + OpenAlex, normalization, dedup, caching.
8. **Core Features**: library, collections, tags, notes, projects, tasks, milestones, reviews.
9. **Research Gap Explorer**: real evidence-based analysis, not fabricated gaps.
10. **Citations**: APA/MLA/IEEE/Chicago from real metadata.
11. **Frontend Integration**: store hydration, loading/empty/error states, responsive design.
12. **Testing**: Vitest, typecheck, lint, build.
13. **Deployment**: Vercel + Neon + Resend.
14. **Demo**: live walkthrough (signup → discover → save → library → project → gap explorer).
15. **Future Work**: SSO, PDF storage, more providers, end-to-end tests, caching/monitoring.

---

## 11. Video Script Outline (NotebookLM)

- **Intro**: What is Folio and who is it for.
- **Architecture**: How frontend, backend, database, and external APIs connect.
- **Auth flow**: Signup, signin, session cookie, password reset, verification.
- **Discovery**: Search → normalize → dedup → persist → display.
- **Library & organisation**: Save, tag, collect, note, track reading.
- **Projects & collaboration**: Create, invite, accept, tasks, milestones.
- **Literature reviews**: Sections, papers, notes, evidence.
- **Gap Explorer**: Real analysis on real corpus, with caveats.
- **Citations**: Generate from metadata.
- **Security**: Ownership, membership, validation, rate limiting.
- **Testing & deployment**: Vitest, typecheck, lint, build, Vercel, Neon.
- **Conclusion**: Unified research workspace with real data and real security.

---

## 12. How Everything Is Connected (One-Page Summary)

```
User (browser)
  └─ Next.js frontend (React, Zustand)
       └─ API routes (/api/*)
            ├─ Auth (bcrypt, sessions, tokens, rate limit)
            ├─ /api/workspace → getWorkspace() → Prisma → PostgreSQL
            ├─ Domain CRUD → Prisma → PostgreSQL
            └─ /api/papers?q= → searchScholarly() → Crossref + OpenAlex
                                   → normalize → dedup → upsert → cache
```

Every displayed value traces back to:
- The authenticated user's database records, or
- Real scholarly metadata from Crossref/OpenAlex.

No fake or demo data is shown to authenticated users. Empty states are shown when there
is no data. Errors are shown when requests fail. Loading states are shown while fetching.