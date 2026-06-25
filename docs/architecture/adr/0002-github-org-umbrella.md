# ADR-0002: AI Studio Growth is a GitHub organization, one repo per product

- Status: Accepted
- Date: 2026-06-25
- Deciders: Executive Office (CTO), Architecture Council

## Context

"AI Studio Growth" is the **company**, not a codebase. The first product, *Ai Studio
Referrals*, is a single cohesive Next.js App Router application: its features are routes,
server actions, `lib` modules, and components that all share **one** Prisma schema, **one**
auth/session/RBAC layer, and **one** design system. New business capability ships as
`Campaign` configuration + adapters, **never** as a forked module (see
[architecture standards](../../standards/architecture-standards.md)).

A proposal to put "all new features" in a separate code repository was considered and
**rejected**: it would fragment the shared schema/auth/design-system, force cross-repo version
skew and non-atomic changes, and break the single-repo assumptions of the engineering
operating system (CODEOWNERS, module map, the 11-stage workflow).

## Decision

`ai-studio-growth` is the **GitHub organization** (the umbrella), structured as
**one repository per product**:

```
github.com/ai-studio-growth/
├─ ai-studio-referrals    # this product (transferred from kishore9490/)
├─ marketing-site         # future, if/when it deploys independently
└─ <future products>      # each genuinely separate product gets its own repo
```

- App **features stay inside `ai-studio-referrals`** as config + adapters + modules — never a
  second "features" repo.
- A **new repo is justified only** for an independently-deployable unit: a standalone service
  (e.g. an AI microservice), a client SDK, the marketing site, or shared infra/tooling.
- The 14 **departments** map 1:1 to GitHub **teams** under the org; those teams back the
  `@ai-studio-growth/<team>` handles already in [CODEOWNERS](../../../.github/CODEOWNERS).

## Consequences

- The operating system in `docs/` continues to govern **each** repo; shared standards can later
  be promoted to an `.github` org-level repo if a second product appears.
- CODEOWNERS handles resolve once the org and its teams exist (see the setup runbook in
  [company/github-org.md](../../company/github-org.md)).
- Transferring `kishore9490/ai-studio-referrals` to the org preserves history, issues, PRs, and
  stars; the old URL redirects. Local remotes must be re-pointed after transfer.
- "Adding a feature = new repo" is now explicitly an anti-pattern for app features.

## Alternatives considered

- **Modular monorepo (`packages/` workspace)** — good for module isolation; deferred. We can
  still adopt a workspace *inside* `ai-studio-referrals` later without changing this org model.
  Tracked as a future ADR if/when module coupling warrants it.
- **Separate "features" repo** — rejected (coupling, version skew, non-atomic changes, breaks
  the operating system). This was the original proposal.
- **Stay a personal repo (`kishore9490/`)** — rejected: doesn't scale to teams, org-level
  permissions, or multiple products.
