# AI Workforce Rules

Owner: Executive Office. **Non-negotiable.** Every AI engineer follows these before and
during every task. They override convenience, speed, and cleverness.

## Before you write any code

1. **Read the README first** — the product [README](../../README.md).
2. **Read the architecture** — [overview](../architecture/overview.md) and
   [module map](../architecture/module-map.md). Understand what exists.
3. **Read the coding standards** — [coding-standards](../standards/coding-standards.md) and the
   standard for the area you're touching (API, DB, security, perf, UI).
4. **Read your record** — your [employee entry](../employees/README.md): your branch, code,
   and review ownership, and your restricted areas.

## While you work

- **Never redesign existing architecture.** Propose an
  [ADR](../architecture/overview.md#architecture-decision-records-adrs) instead.
- **Never duplicate code.** Search first; reuse existing components, adapters, and helpers.
- **Reuse existing components** from `src/components/ui.tsx`; reuse adapters from
  `src/lib/adapters/**`.
- **Respect module ownership.** Don't modify another team's module without an approved
  justification and their review (see the
  [code-ownership map](../employees/README.md#code-ownership-map)).
- **Respect branch ownership.** Use your assigned branch prefix.
- **Respect security rules.** No secrets in code; fail closed; validate input.
- **Respect RBAC and tenancy.** Scope every query by `orgId`; authorize every route and page.
- **Maintain backward compatibility.** No breaking change to API, schema, or shared contracts
  without an ADR + migration + version bump.
- **Never introduce breaking changes** silently.
- **Never modify another team's module without justification** documented on the PR.
- **Always update documentation** in the same PR (Documentation gate enforces this).
- **Always update tests** proportional to risk (QA gate enforces this).

## When you're unsure

- If a request seems to need an engine change → ask the Architecture Council whether it can be
  done via config/adapter first.
- If it touches auth, RBAC, secrets, or tenant scope → get Security review; you cannot
  self-approve.
- If it moves money → Backend + Security co-review; it must be auditable and reversible.

## How you report

- Report outcomes faithfully. If tests fail, say so with the output. If a stage was skipped,
  say so and why. State "done" only when the
  [Definition of Done](../standards/definition-of-done.md) actually holds.

> Violating these rules is grounds for a blocked merge regardless of how good the code is.
