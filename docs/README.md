# AI Studio Growth — Engineering Operating System

This `/docs` tree is the **permanent operating system** for the AI Studio Growth
engineering organization. It defines who owns what, how we build, how we review, and how
work flows from idea to release. Every contributor — human or AI — reads this before
touching code.

> **Product under management:** *Ai Studio Referrals* — a multi-tenant, config-driven
> referral engine (Next.js 15 · TypeScript · Prisma). See the product [README](../README.md).

---

## How to navigate

| Area | Folder | Start here |
| --- | --- | --- |
| **Company** — vision, mission, org chart | [`company/`](company/) | [overview.md](company/overview.md) |
| **Departments** — 14 functions, missions & ownership | [`departments/`](departments/) | [README.md](departments/README.md) |
| **Employees** — the AI workforce directory | [`employees/`](employees/) | [README.md](employees/README.md) |
| **Architecture** — system & module map | [`architecture/`](architecture/) | [overview.md](architecture/overview.md) |
| **API standards** | [`api/`](api/) | [standards.md](api/standards.md) |
| **Database standards** | [`database/`](database/) | [standards.md](database/standards.md) |
| **Security standards** | [`security/`](security/) | [standards.md](security/standards.md) |
| **UI / UX standards** | [`ui/`](ui/) | [standards.md](ui/standards.md) |
| **Engineering standards** — the rulebook | [`standards/`](standards/) | [README.md](standards/README.md) |
| **Roadmap** — vision → versions → marketplace | [`roadmap/`](roadmap/) | [README.md](roadmap/README.md) |
| **Releases** — versioning & changelog | [`releases/`](releases/) | [README.md](releases/README.md) |
| **Workflows** — git, dev, sprint, AI rules | [`workflows/`](workflows/) | [README.md](workflows/README.md) |

---

## The first five things every engineer reads

1. The product [README](../README.md) — what we're building and why.
2. [Architecture overview](architecture/overview.md) — never redesign it without an ADR.
3. [Coding standards](standards/coding-standards.md).
4. Your [department charter](departments/README.md) and your [employee record](employees/README.md).
5. The [AI workforce rules](workflows/ai-workforce-rules.md) — non-negotiable.

## Golden rules (the short version)

- **Reuse before you build.** Search for an existing component, adapter, or helper first.
- **Respect ownership.** Don't modify another team's module without an approved justification.
- **Never redesign existing architecture.** Propose an [ADR](architecture/overview.md#architecture-decision-records-adrs) instead.
- **Backward compatibility is sacred.** No breaking changes to public API, DB schema, or shared contracts without a migration + version bump.
- **Docs and tests ship with the code.** A feature is not done until both are updated. See the [Definition of Done](standards/definition-of-done.md).

---

*Maintained by the Executive Office. Changes to this operating system require an ADR and
Architecture Council approval.*
