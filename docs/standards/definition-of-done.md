# Definition of Done

Owner: Executive Office. A change is **Done** only when every box is checked. Reviewers
enforce this; QA and Docs gate on it.

## Checklist

- [ ] **Spec met** — implements the approved spec and acceptance criteria.
- [ ] **Config-driven** — new capability is config/adapter, not an engine fork (or has an
      accepted ADR).
- [ ] **Tenant-safe** — every query/mutation is `orgId`-scoped; no cross-tenant exposure.
- [ ] **Validated** — all inputs validated with zod at trust boundaries.
- [ ] **Idempotent** — replayable mutations use idempotency keys.
- [ ] **Audited** — every state transition writes an `AuditLog` row.
- [ ] **Secure** — no secrets in code; auth/RBAC unaffected or Security-approved; fails closed.
- [ ] **Reuse-checked** — no duplicated component/adapter/helper; boundaries respected.
- [ ] **Tested** — unit/integration/contract tests proportional to risk; suite green.
- [ ] **Performant** — within budget; queries paginated & indexed; hot paths reviewed.
- [ ] **Documented** — docs/README/API docs/module map updated in the same PR.
- [ ] **Backward compatible** — no breaking change to API/schema/contracts without ADR +
      migration + version bump.
- [ ] **Reviewed** — all required owners approved (see [review process](review-process.md)).
- [ ] **CI green** — lint + build + tests pass.

## Workflow gates

A feature passes through every stage of the
[development workflow](../workflows/development-workflow.md): Product → Architecture →
Database → Security → Backend → Frontend → AI → QA → Performance → Documentation → Release.
**No feature is complete until every applicable stage passes.**
