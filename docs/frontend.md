# Frontend — Detailed Documentation (Ayan Das)

## Overview

The frontend is a Next.js 15 (App Router) + React 19 + TypeScript application with a Swiss/editorial
design system. It was originally built against mock services and has been integrated with the real
backend while preserving the visual design.

## Stack

- Next.js 15, React 19, TypeScript (strict)
- Tailwind CSS + shadcn-style Radix UI primitives
- Zustand (UI state, hydrated from server)
- React Hook Form + Zod
- TanStack Table, Recharts, Framer Motion (restrained, reduced-motion aware)
- Lucide icons, Sonner toasts, cmdk command palette, next-themes

## Routes

### Public (`src/app/(marketing)`)
Landing, features, about, docs, help, privacy, terms.

### Auth (`src/app/(auth)`)
Sign in, sign up, forgot password, verify email. Forms validate with Zod and call `/api/auth/*`.

### Workspace (`src/app/(workspace)`)
Dashboard, discover (+ detail), library, collections (+ detail), notes, projects (+ detail), tasks,
milestones, literature, research-gaps, citations, activity, notifications, settings.

## State management

`src/stores/workspace-store.ts`:
- Holds `data` (WorkspaceData), `profile`, `settings`, `sidebarCollapsed`, `hydrated`, `loading`.
- `hydrate()` fetches `/api/workspace` and syncs the client registry (papers/members/tags).
- Mutations call REST endpoints and re-hydrate.
- No `localStorage` persistence for auth or workspace data.

## Client registry — `src/lib/client-registry.ts`

Mutable `papers`, `papersById`, `users`, `usersById`, `allTags`, `researchTopics` objects updated
on hydration and discovery search, so existing components that referenced mock lookups continue
to work with live data.

## API client — `src/lib/api-client.ts`

`apiFetch`/`apiMutate` with credentials, envelope unwrapping, typed `ApiClientError`.

## Auth integration

- `StoreGate` (`src/components/layout/store-gate.tsx`) checks `/api/auth/session`, hydrates the
  store, and redirects unauthenticated users to `/signin`.
- `AppHeader` sign-out calls `/api/auth/signout`.
- Auth forms (signin/signup/forgot/verify) call real endpoints and surface server errors.

## Discover

- `src/app/(workspace)/discover/page.tsx` calls `/api/papers?q=...` and registers results.
- Detail page fetches `/api/papers/:id` if not in registry.

## Design preservation

All existing colour palette, typography, spacing, components and motion preserved. No redesign
performed; only data wiring changed.

## Responsiveness

Checked at 390px for overflow; responsive grids and collapsible sidebar. Loading, empty and
error states present on data-driven pages.

## External data labelling

The UI distinguishes externally sourced metadata (Crossref/OpenAlex) from user-entered data;
discover results and paper details show source appropriately.