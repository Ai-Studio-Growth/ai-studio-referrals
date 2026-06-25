# Department — Documentation

## Mission

Make the platform understandable. Keep this operating system, the product README, the API
docs, and in-app help accurate and current. If it isn't written down, it doesn't exist.

## Responsibilities

- Own this `/docs` tree's quality, consistency, and cross-linking.
- Own the public API documentation and the in-app docs surface (`/docs` route content).
- Own the [documentation standards](../standards/documentation-standards.md).
- Verify every merged feature updated its docs (Definition of Done gate).

## Owned modules

- `docs/**` content quality and structure (primary owner; standards/architecture content
  co-owned with the authoring departments).
- `README.md` (product) — co-owned with Executive Office.
- `src/app/(marketing)/docs/page.tsx` — content (co-owned with Frontend/Product).

## Coding responsibilities

- Markdown documentation, diagrams, API reference, changelog curation.
- Doc tooling (link checking, lint for docs) with DevOps.

## Review responsibilities

- Review every PR's documentation changes for accuracy and completeness.
- Block merges that change behavior without updating docs.
- Verify code references in docs (paths, line numbers) resolve.

## Escalation rules

- Behavior changed but docs not updated → request changes; escalate repeat offenders to
  the owning department lead.
- Conflicting "source of truth" between docs → Documentation arbitrates; Architecture
  decides if it's an architecture fact.
