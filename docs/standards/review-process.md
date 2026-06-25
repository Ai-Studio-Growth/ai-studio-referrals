# Review Process

Owner: Software Architecture. Every change merges via Pull Request with the right reviewers.

## Who reviews

Reviewers are determined by the [code-ownership map](../employees/README.md#code-ownership-map):

- **Primary owner** of every touched path must approve.
- **Mandatory co-reviewers** for sensitive paths:
  - Schema → Architecture + Security + Performance.
  - Auth/RBAC/secrets/tenant-scoping → **Security (veto power)**.
  - Public API contracts → Architecture.
  - Hot paths → Performance.
  - Money paths → Backend + Security.
  - Any docs-affecting change → Documentation.
- **Cross-department changes** → Architecture is tie-breaker.

## What reviewers check

1. **Correctness** — does it do what the spec says? Edge cases, idempotency, error handling.
2. **Ownership & reuse** — no duplication; reuses existing components/adapters/helpers;
   respects module boundaries.
3. **Tenancy & security** — `orgId`-scoped, validated input, audited, no secret leakage.
4. **Tests** — present and proportional to risk.
5. **Docs** — updated in the same PR.
6. **Standards** — coding/API/DB/perf standards met; no architecture redesign without ADR.

## How review works

- Author opens a PR using the [PR template](../workflows/pull-request-template.md), links the
  spec, and self-reviews first.
- Reviewers respond within one business day. Use "request changes" for blocking issues,
  "comment" for non-blocking suggestions.
- A denied/blocked review means *adjust*, not *re-request verbatim*. Resolve the concern.
- Merge only when all required approvals are in and CI is green.

## Tone

Review the code, not the author. Be specific and cite `file:line`. Prefer suggestions with a
concrete fix. Disagreements escalate to the owning department lead, then the relevant council.
