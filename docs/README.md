# Folio — Academic Resource & Research Management Platform

Folio brings scholarly search, personal organisation and research project coordination into one
workspace. It is built by a five-member team as a Capstone-I project at IIT Patna.

## Team

| Member | Role | Contribution |
|---|---|---|
| Yuvraj Chauhan | Research & Documentation | Problem statement, objectives, target users, literature review, methodology, requirements, evaluation criteria, Research Gap Explorer definition |
| Ayan Das | Frontend Development | Next.js/React/TypeScript UI: landing, auth, dashboard, library, notes, collections, tags, citations, projects, tasks, milestones, Research Gap Explorer; responsive layouts and loading/empty/error states |
| Sumit Chauhan | Backend Development | Server logic, internal API endpoints, login checks, permissions, ownership rules, library/notes/collections/tags/reading status, projects, team membership, tasks, milestones, literature review, validation, error handling, tests, API documentation |
| Aakash Chourasia | Database Engineering | PostgreSQL on Neon, tables, keys, constraints, migrations, indexes, sample data, duplicate handling, deletion rules |
| Amogh Das | External API Integration | Crossref and OpenAlex comparison, paper search and metadata retrieval, common paper format, missing-field handling, paging, rate limits, provider failures, API contracts |

## Module documentation

- [Research and documentation](research-and-documentation.md)
- [Frontend](frontend.md)
- [Backend](backend.md)
- [Database](database.md)
- [External API integration](external-api-integration.md)

## Quick start

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, AUTH_SECRET, APP_URL, email and API settings
npm run db:deploy      # apply migrations
npm run dev            # http://localhost:3000
```

## Quality checks

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```