# Folio — Academic Research Workspace

Folio is a frontend demonstration of a calm, editorial workspace for academic research: discovering papers, curating a library, writing notes and literature reviews, coordinating projects and tasks, and generating citations. The public site and authentication screens surround the workspace as one coherent product.

**Phases 0 and 1 are frontend-only.** There is no backend, authentication server, database, or external API integration. Every record is realistic mock data persisted in the browser, and every authentication state is simulated.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript (strict)
- Tailwind CSS with a Swiss/editorial design system
- shadcn-style UI primitives built on Radix UI
- Zustand with `localStorage` persistence
- React Hook Form + Zod
- TanStack Table, Recharts
- Framer Motion (restrained, reduced-motion aware)
- Lucide icons, Sonner toasts, cmdk command palette, next-themes

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Production checks:

```bash
npm run typecheck
npm run lint
npm run build
npm start
```

Set `NEXT_PUBLIC_SITE_URL` when deploying so canonical and Open Graph URLs resolve to the real origin. It defaults to `http://localhost:3000`.

## Documentation

Detailed module documentation is in the `docs/` folder:

- [docs/README.md](docs/README.md) — overview and team
- [docs/research-and-documentation.md](docs/research-and-documentation.md) — research and documentation
- [docs/frontend.md](docs/frontend.md) — frontend
- [docs/backend.md](docs/backend.md) — backend
- [docs/database.md](docs/database.md) — database
- [docs/external-api-integration.md](docs/external-api-integration.md) — external API integration

## Backend, database & authentication

Folio now runs on PostgreSQL via Prisma. Local development uses a local PostgreSQL instance; hosted deployments should set `DATABASE_URL` to a Neon (or any PostgreSQL) connection string.

### Environment

Copy `.env.example` to `.env` and fill in the values. Key variables:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — long random secret used to hash session and tokens
- `APP_URL` — public origin of the app
- `AUTH_DEV_EXPOSE_LINKS` — set `true` in development to return verification/reset links in API responses and logs
- `EMAIL_PROVIDER` / `EMAIL_PROVIDER_API_KEY` / `EMAIL_FROM` — email delivery (console provider logs links when no key is set)
- `CROSSREF_*` / `OPENALEX_*` — scholarly API base URLs and polite-pool mailto

### Database setup

```bash
# create databases (local PostgreSQL)
createdb folio_dev
createdb folio_test

# apply migrations
npm run db:deploy        # or: npx prisma migrate deploy
# generate client
npm run db:generate
```

For schema changes during development use `npm run db:migrate`.

### Running

```bash
npm install
npm run dev
```

### Tests

```bash
npm run test        # Vitest integration tests against folio_test
npm run typecheck
npm run lint
npm run build
```

### Notes

- New users start with an empty workspace; no fictional scholarly data is seeded.
- Scholarly metadata comes from Crossref and OpenAlex; the UI labels externally sourced data.
- Email delivery is abstracted behind `src/lib/auth/email.ts`; the console provider logs links for development.

## Routes

### Public site

| Area | Route |
| --- | --- |
| Landing page | `/` |
| Features | `/features` |
| About | `/about` |
| Documentation | `/docs` |
| Help center | `/help` |
| Privacy notice | `/privacy` |
| Terms of use | `/terms` |

### Authentication (simulated)

| Area | Route |
| --- | --- |
| Create account | `/signup` |
| Sign in | `/signin` |
| Forgot password | `/forgot-password` |
| Email verification | `/verify-email` |

Demonstration account:

```
mira.srinivasan@northbridge.edu
ResearchFolio26!
```

The sign-in form can fill these with **Use demo**. Accounts created in the sign-up form exist only in the browser that created them and are stored with a salted SHA-256 digest rather than a plain-text password. This is a demonstration measure, not production security. No email is sent; the verification screen previews pending, verified, and expired states.

### Workspace

| Area | Route |
| --- | --- |
| Overview dashboard | `/dashboard` |
| Discover papers | `/discover` |
| Paper details | `/discover/[id]` |
| My Library | `/library` |
| Collections | `/collections`, `/collections/[id]` |
| Research Notes | `/notes` |
| Projects | `/projects` |
| Project collaboration (8 tabs) | `/projects/[id]` |
| Tasks (Kanban + list) | `/tasks` |
| Milestones | `/milestones` |
| Literature review workspace | `/literature` |
| Research Gap Explorer | `/research-gaps` |
| Citation generator | `/citations` |
| Notifications | `/notifications` |
| Settings | `/settings` |
| Team activity | `/activity` |

The workspace is open without an account. The sidebar follows the required groups: **Workspace**, **Research**, **Management**, and **Personal**.

## Demo behaviour

- Workspace data persists under `folio-workspace-v1`; the mock session uses `folio-demo-session-v1`; locally created accounts use `folio-demo-accounts-v1`; theme uses `folio-theme`.
- The seeded identity is **Mira Srinivasan**, PhD Candidate at Northbridge University. Signing in with a locally created account aligns the displayed profile with that account after hydration.
- Workspace writes pass through async record factories with simulated latency, so a real API can replace the service layer without changing the screens.
- Mock authentication lives in `src/lib/mock-services/auth.ts` and is independent of the UI. Signing out clears the simulated session and returns to `/signin`.
- Reset everything from **Settings → Data → Reset workspace**, or clear site data for the origin.
- Export the current workspace as JSON from the same screen.
- Invitations, email notifications, and PDF preview are simulated; no network request is made.

### Research Gap Explorer

The gap explorer is explicitly labelled as a synthetic demonstration. Topic momentum, trend series, and “potential opportunity” signals are illustrative only and should not be treated as a real bibliometric analysis. Low output is presented as a potential opportunity, never as a verified gap.

### Keyboard and accessibility

- `Ctrl/Cmd + K` opens the command palette (pages, papers, projects, notes, collections, quick actions).
- All dialogs and menus use Radix focus management; the site includes a skip link, labelled controls, visible focus rings, accessible accordions, and reduced-motion support.
- Theme and reduced-motion preferences are available in Settings and the header menu.

## Project structure

```
src/
  app/
    (marketing)/       Public landing page and editorial routes
    (auth)/            Sign in, sign up, reset, verification
    (workspace)/       Dashboard and research workspace routes
  components/
    auth/              Auth shell, fields, forms, verification panel
    brand/             Logo mark, wordmark, lockups
    layout/            App shell, sidebar, header, command palette
    marketing/         Landing sections, previews, navbar, footer
    shared/            Page headers, states, tables, avatars
    ui/                shadcn-style primitives
  features/            Feature dialogs and task/milestone panels
  lib/                 Formatting, labels, citations, mock services, validation
  mocks/               Seed dataset
  stores/              Zustand workspace store
  types/               Domain models
```

## Design notes

- Light theme is the default: warm paper background (`#F7F6F2`), forest primary (`#354C43`), terracotta accent (`#B66B4D`). A full dark theme is included.
- Typography: Manrope (display/nav), Inter (interface), Newsreader (editorial), IBM Plex Mono (DOIs and metadata).
- Layouts favour rules, margins, tabular alignment, and restrained motion over decorative effects.
- The brand mark is an original inline SVG shared by the app, marketing site, auth pages, and favicon.

## Scope

- No server-side persistence, real authentication, or collaborative realtime transport.
- No AI writing, summarisation, or automated literature synthesis.
- Uploading PDFs, external metadata lookup, analytics, and email delivery are out of scope.
- All scholarship shown is fictional and labelled as mock data throughout the interface.
