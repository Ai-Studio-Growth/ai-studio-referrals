# Testing Standards

Owner: QA. Tests ship with the code — a feature is not done without them
([Definition of Done](definition-of-done.md)).

## Test pyramid

| Layer | What | Where |
| --- | --- | --- |
| **Unit** | Pure domain logic: reward math, attribution, fraud heuristics, money, code gen | colocated `*.test.ts` |
| **Integration** | Engine + DB + adapters with a test DB; server actions | `tests/integration/**` |
| **Contract** | Public API request/response shapes, status codes, pagination, idempotency | `tests/contract/**` |
| **E2E** | Critical user journeys across roles | `tests/e2e/**` |

Most tests are unit; fewer integration; fewest E2E. Push logic down so it's unit-testable.

## What must be covered

- **Conversion lifecycle**: match → attribute → fraud → reward → audit, including replays
  (idempotency) and the medium/high fraud branches.
- **Rewards**: base + milestone + double-sided; hold → cleared → wallet.
- **RBAC**: each role can reach only its own area; cross-tenant access is denied.
- **API contracts**: auth, validation (zod), pagination clamps, error statuses.
- **Auth**: hashing, session validation, brute-force lockout, constant-time verify.

## Quality bar

- Deterministic. No reliance on wall-clock/network; mock adapters (they already have console
  fallbacks).
- Test behavior, not implementation. Assert on outcomes and audit rows.
- New bug → first write a failing regression test, then fix.
- Flaky tests are quarantined and fixed, not ignored.

## Gates

- CI runs lint + build + the test suite. Red = no merge.
- QA verifies acceptance criteria coverage before Release Approval.
- Coverage is risk-based: money, auth, fraud, and tenant-isolation paths require the highest
  coverage; cosmetic UI the least.
