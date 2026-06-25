# Department — Product Management

## Mission

Translate market and customer needs into clear, prioritized, buildable specifications —
and protect the config-driven philosophy by ensuring new capabilities ship as
configuration and adapters, not engine forks.

## Responsibilities

- Own the [product roadmap](../roadmap/README.md) and release scope.
- Write feature specs and acceptance criteria; run Product Review (stage 1 of the
  [development workflow](../workflows/development-workflow.md)).
- Define campaign capabilities (trigger events, reward types, eligibility) at the
  *intent* level — engineering owns the implementation.
- Prioritize the backlog and maintain the [sprint](../workflows/sprint-management.md) inputs.
- Own [industry packs](../roadmap/industry-packs.md) and [marketplace strategy](../roadmap/marketplace-strategy.md).

## Owned modules

- `docs/roadmap/**` — primary owner.
- Product-facing copy in marketing routes (with UI/UX): `src/app/(marketing)/**`,
  `src/app/(marketing)/docs/page.tsx` (content, reviewed with Documentation).

## Coding responsibilities

- Spec documents and acceptance criteria (markdown).
- Campaign configuration *schemas of intent* — proposes additions to
  `src/lib/config/campaign-config.ts`, implemented by Backend.

## Review responsibilities

- Product Review gate: every feature starts here. Confirms scope, value, and that the
  feature respects config-driven principles.
- Sign-off that acceptance criteria are met before Release Approval.

## Escalation rules

- Scope or priority conflicts → Head of Product, then Executive Office.
- "This needs an engine change" claims → Architecture Council to confirm it can't be done
  via config/adapters first.
