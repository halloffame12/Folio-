# Backend — Detailed Documentation (Sumit Chauhan)

## Overview

The backend is implemented as Next.js App Router route handlers in TypeScript. It sits between the
frontend and the database/external APIs, enforcing authentication, authorization, validation and
consistent error handling. There is no separate server process; route handlers run in the Next.js
runtime.

## Foundations

### Prisma client — `src/lib/db.ts`

Singleton `PrismaClient` using `PrismaPg` adapter reading `DATABASE_URL`. Cached on `globalThis`
in development.

### API envelope — `src/lib/api/response.ts`

- `ok(data, meta?, status)` → `{ success: true, data, meta? }`.
- `fail(error)` → `{ success: false, error: { code, message, fields? } }` with appropriate status.
- `withRoute(fn)` wraps handlers and converts thrown errors to `fail`.

### Errors — `src/lib/api/errors.ts`

`ApiError` with `code`, `message`, `status`, `fields`. Helpers: `badRequest`, `unauthorized`,
`forbidden`, `notFound`, `conflict`, `validationError`, `rateLimited`, `emailUnverified`,
`internalError`, `externalApiError`.

### Same-origin — `src/lib/api/same-origin.ts`

Mutating requests must have an `Origin` matching `Host`; cross-origin requests are blocked with 403.

### Passwords — `src/lib/auth/password.ts`

bcrypt with 12 rounds (`hashPassword`, `verifyPassword`).

### Tokens — `src/lib/auth/tokens.ts`

`randomToken` (base64url, 32 bytes), `sha256`, `hmacSha256`, `tokenHash` (HMAC-SHA256 with
`AUTH_SECRET`). Raw tokens go in emails/URLs; only hashes are stored.

### Sessions — `src/lib/auth/session.ts`

- Cookie name `folio_session`, HttpOnly, SameSite=Lax, Secure in production.
- `createSession(userId, remember, userAgent)` stores hashed token with 30-day (remember) or
  1-day expiry.
- `getSessionUser(request)` reads cookie, validates hash + expiry + revocation, touches `lastUsedAt`.
- `requireUser(request)` throws 401 if no session.
- `revokeSession`, `revokeAllSessions` (used on password reset).
- `setSessionCookie`/`clearSessionCookie` append `Set-Cookie` headers.

### Rate limiting — `src/lib/auth/rate-limit.ts`

DB-backed `RateLimitBucket` keyed by action+IP. Disabled when `RATE_LIMIT_DISABLED=true` (tests).

### Email — `src/lib/auth/email.ts`

Provider abstraction: Resend when `EMAIL_PROVIDER_API_KEY` is set, otherwise console (logs links).
`verificationUrl`, `resetUrl`, `newToken`, `tokenHash`, `sendEmail`.

### Authorization — `src/lib/auth/authorization.ts`

- `getProjectAccess(projectId, userId)` returns project + member + role; throws 404/403.
- `requireProjectManager` (Owner/Admin), `requireProjectOwner` (Owner).
- `ownsResource`, `getPersonalLibraryEntry`.

## Authentication flow

### Signup — `POST /api/auth/signup`

1. Rate limit by IP.
2. Validate body with `signupSchema`.
3. Check email uniqueness.
4. Hash password, create `User` + `UserProfile`.
5. Create `EmailVerificationToken` (24h).
6. Send verification email.
7. Create session, set cookie.
8. Return user + `verificationSent`, plus `devVerificationUrl` if `AUTH_DEV_EXPOSE_LINKS=true`.

### Signin — `POST /api/auth/signin`

1. Rate limit by IP.
2. Validate body.
3. Find user by email, verify password (generic error on failure).
4. Create session, set cookie.
5. Return user.

### Signout — `POST /api/auth/signout`

Revoke current session token (parsed from cookie), clear cookie.

### Session — `GET /api/auth/session`

Returns `{ user }` or `{ user: null }`.

### Forgot password — `POST /api/auth/forgot-password`

Rate limit; always return success message. If user exists, create `PasswordResetToken` (1h) and send
email. No email-existence leak.

### Reset password — `POST /api/auth/reset-password`

Validate token hash, expiry, usage. Update password hash, mark token used, revoke all sessions.

### Verify email — `POST /api/auth/verify-email`

Validate token, mark user `emailVerifiedAt`, mark token used.

### Resend verification — `POST /api/auth/resend-verification`

Create new token and send email if user exists and unverified; generic success response.

## Core domains

### Profile — `GET/PATCH /api/users/me`

Read/update name, email, affiliation, title, research interests, ORCID, settings.

### Workspace hydration — `GET /api/workspace`

`src/lib/services/workspace.ts` assembles profile, settings, all user data (library, collections,
notes, projects, tasks, milestones, reviews, notifications, activity), referenced papers and
project members. Frontend hydrates the store from this.

### Papers — `src/app/api/papers/*`

- `GET /api/papers?q=...` triggers scholarly search (`searchScholarly`) and upserts papers.
- `GET /api/papers/:id` returns a paper.
- `POST /api/papers` creates a user-entered paper (source=user).
- `PATCH/DELETE /api/papers/:id` allowed only for the creator of user-entered papers.

### Library — `src/app/api/library/*`

Save/remove papers, update reading status/progress/tags/lastOpenedAt. Ownership enforced.

### Collections — `src/app/api/collections/*`

CRUD collections; add/remove papers (auto-saves paper to library). Ownership enforced.

### Tags — `src/app/api/tags/*`

List (names), create (upsert), delete by id or name.

### Notes — `src/app/api/notes/*`

CRUD notes with papers and tags. Ownership enforced.

### Projects — `src/app/api/projects/*`

CRUD projects. Create adds owner as active Owner member. Update/delete require manager/owner.

### Members & invitations — `src/app/api/projects/:id/members/*`, `src/app/api/invitations/accept`

Invite by email (creates invitation token + invited member record, sends email). Accept activates
membership and links user. Role changes and removal enforce manager/owner rules; owner cannot be
removed/changed.

### Tasks — `src/app/api/projects/:id/tasks/*`, `src/app/api/tasks/*`

CRUD tasks with status/priority/assignee/due date/papers/milestone. Project membership required.
Comments via `POST /api/tasks/:id/comments`.

### Milestones — `src/app/api/projects/:id/milestones/*`, `src/app/api/milestones/*`

CRUD milestones with assignees. Membership/ownership enforced.

### Literature reviews — `src/app/api/literature-reviews/*`

CRUD reviews with sections (default Intro/Methods/Findings/Discussion), papers, notes, section
content updates, progress.

### Research Gap Explorer — `src/app/api/research-gaps/*`

`POST /api/research-gaps/analyze` computes corpus statistics (by year, top authors, keywords,
underrepresented keywords) and stores a `GapAnalysis` with linked papers. `GET` returns analysis;
`/evidence` returns supporting papers.

### Citations — `src/app/api/citations/*`

`POST /api/citations/generate` generates citation text (APA/MLA/IEEE/Chicago) from paper metadata
and upserts by user+paper+style. List and delete supported.

### Notifications & activity — `src/app/api/notifications`, `src/app/api/activity`

List notifications, mark read/all read. List activity for user's projects.

## Validation and errors

- All inputs validated with Zod (auth schemas reused from `src/lib/validations/auth.ts`).
- Errors returned in the common envelope with codes and field details.
- No internal DB errors or stack traces exposed.

## Testing

- `tests/integration.test.ts` (Vitest) — 16 tests against `folio_test`.
- Covers signup validation, duplicate email, signin success/failure, session/logout, password
  reset (invalid token), email verification, workspace auth, data isolation, library CRUD,
  collections/tags, notes CRUD, project permissions, tasks, milestones, literature reviews,
  gap analysis, citations, external search failure.
- `npm run typecheck`, `npm run lint`, `npm run build`.