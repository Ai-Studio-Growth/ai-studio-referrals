# Department — QA

## Mission

Guarantee that what we ship works, keeps working, and meets the
[Definition of Done](../standards/definition-of-done.md). Own test strategy, regression
coverage, and the QA release gate.

## Responsibilities

- Own the [testing standards](../standards/testing-standards.md) and the test pyramid.
- Define and maintain regression suites for the conversion lifecycle, rewards, fraud, RBAC,
  and the public API contracts.
- Run the QA gate in the [development workflow](../workflows/development-workflow.md).
- Track defects and verify fixes; own flake triage.

## Owned modules

- `tests/**` and `*.test.ts` / `*.spec.ts` across the repo (primary owner of test code).
- Test fixtures and factories; seed-data assumptions in `prisma/seed.ts` (review authority).
- QA documentation and test plans under `docs/standards/testing-standards.md`.

## Coding responsibilities

- Unit, integration, and end-to-end tests; contract tests for `/api/**`.
- Test utilities, fixtures, and harnesses.

## Review responsibilities

- Verify every PR includes tests proportional to risk (see Definition of Done).
- Verify acceptance criteria are covered before Release Approval.
- Gate releases: no red tests, no unresolved Sev-1/Sev-2 defects (Release Council member).

## Escalation rules

- Release-blocking defect → notify Release Council; release does not proceed.
- Repeated regressions in a module → escalate to that module's owning department lead and
  Architecture for design review.
