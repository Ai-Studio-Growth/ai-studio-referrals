# Company Overview — AI Studio Growth

AI Studio Growth is the company that builds and operates **Ai Studio Referrals**, a
universal, multi-tenant, config-driven referral engine that drops a premium double-sided
referral program into any business — SaaS, e-commerce, fintech, marketplaces, mobile —
without changing engine code.

## Vision

> **Make word-of-mouth growth programmable.** Any business should be able to launch a
> world-class referral program in minutes, configure it without engineers, and trust it
> to attribute, reward, and protect itself at scale.

## Mission

Build the most flexible, secure, and observable referral infrastructure on the market —
config-driven, multi-tenant, and integration-ready — operated by a self-managing
engineering organization that scales to hundreds of contributors without losing quality.

## Values

| Value | What it means in practice |
| --- | --- |
| **Configuration over code** | New businesses and offers ship via config, not engine edits. |
| **Security by default** | Hashed secrets, tenant isolation, least privilege, audit everything. |
| **Reuse over reinvention** | Adapters, components, and helpers are shared assets. |
| **Observable & honest** | Every state transition is audited; we report outcomes truthfully. |
| **Backward compatible** | We protect every integrator from breaking changes. |
| **Documentation is the product** | If it isn't written down, it doesn't exist. |

## Operating model

The company runs as a set of **departments** (functions) staffed by **AI employees**, each
with explicit module ownership, branch ownership, and review responsibilities. Work flows
through a defined [development workflow](../workflows/development-workflow.md) and
[sprint process](../workflows/sprint-management.md), gated by the
[Definition of Done](../standards/definition-of-done.md).

- **Org structure:** [org-chart.md](org-chart.md)
- **Departments:** [departments/](../departments/README.md)
- **People:** [employees/](../employees/README.md)

## Company facts

| | |
| --- | --- |
| **Company / GitHub org** | AI Studio Growth (`ai-studio-growth`) — see [github-org.md](github-org.md) |
| **Product** | Ai Studio Referrals (repo `ai-studio-referrals`) |
| **Stack** | Next.js 15 (App Router), TypeScript, Tailwind, Prisma, SQLite→Postgres |
| **Architecture** | Multi-tenant SaaS, config-driven engine, swappable adapters |
| **Repository model** | One repo per product (not per feature); trunk-based on `main` (no `develop`). See [ADR-0002](../architecture/adr/0002-github-org-umbrella.md) |
| **Current version** | 0.1.0 (see [roadmap](../roadmap/version-roadmap.md)) |
