# Research and Documentation — Detailed Documentation (Yuvraj Chauhan)

## Responsibility

Defined the problem, objectives, scope and target users, and prepared the literature review,
methodology, requirements and evaluation criteria. Helped define what the Research Gap Explorer
should do.

## Problem statement

Research work is spread across many tools: search sites, reference managers, notes apps, task
boards. Switching between them costs time and the link between a paper, a note and a task is
easily lost. Folio brings these steps into one place.

## Objectives

- Let users search for scholarly papers and save them with correct details in a personal library.
- Let users add notes, collections, tags and a reading status to saved papers.
- Let users create research projects with team members, tasks, milestones and a literature review.
- Provide a Research Gap Explorer and citation generation.
- Keep private user and project data safe with login, permission and ownership checks.

## Scope and target users

- Target users: students, researchers and small research groups.
- First capstone phase focuses on the backend.
- Out of scope for now: institutional single sign-on, storing full PDF files.
- The platform never claims a PDF is available unless the metadata source provides one.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Next.js route handlers, TypeScript |
| Database | PostgreSQL on Neon |
| External data | Crossref and OpenAlex metadata APIs |

## Team work and contracts

The project was split into five parts: research/documentation (Yuvraj), frontend (Ayan), backend
(Sumit), database (Aakash), external APIs (Amogh). Each member tested their own work, documented
changes affecting others, and helped the final application run. Database and API contracts were
agreed before building dependent features, allowing parallel work.

## Research Gap Explorer definition

- Inputs: selected research topic + associated papers from the user's library.
- Processing: group papers by year, author, keywords and themes; identify topics with limited
  representation.
- Output: potential research opportunities based on the available corpus, with supporting papers
  and evidence. Results are prompts for enquiry, not scientifically proven gaps.

## Evaluation criteria

- Functional: registration, login, library CRUD, collections/tags/notes, projects/members/tasks/
  milestones, literature reviews, gap explorer, citations.
- Security: ownership and membership enforced server-side; no data leaks.
- Quality: typecheck, lint, build, automated tests.
- Usability: loading/empty/error states, responsive layouts.

## References

- Crossref REST API documentation
- OpenAlex technical documentation
- Next.js, React, PostgreSQL, Neon documentation
- OWASP Application Security Verification Standard