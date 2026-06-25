# Engineering Standards

The rulebook. Every engineer — human or AI — follows these documents. They are owned by the
departments named, ratified by the Architecture Council, and changed only via PR with the
owner's approval.

| Standard | Owner | Summary |
| --- | --- | --- |
| [Coding Standards](coding-standards.md) | Architecture | How we write TypeScript/React/Prisma |
| [Architecture Standards](architecture-standards.md) | Architecture | Boundaries, ADRs, config-driven rules |
| [Database Standards](database-standards.md) | Architecture (Data) | Schema, migrations, tenancy, indexing |
| [API Standards](api-standards.md) | Backend | REST conventions, versioning, errors |
| [Git Standards](git-standards.md) | DevOps | Commits, hygiene, signing |
| [Branching Strategy](branching-strategy.md) | DevOps | Trunk-based on main; feature/fix/hotfix/release |
| [Security Standards](security-standards.md) | Security | Authn/z, secrets, RBAC, audit |
| [Performance Standards](performance-standards.md) | Performance | Budgets, caching, query rules |
| [Testing Standards](testing-standards.md) | QA | Test pyramid, coverage, gates |
| [Documentation Standards](documentation-standards.md) | Documentation | Doc rules, code refs, style |
| [Release Process](release-process.md) | VP Eng | Cut, tag, approve, ship |
| [Review Process](review-process.md) | Architecture | How code review works |
| [Definition of Done](definition-of-done.md) | Executive | When work is truly complete |

> Security, API, and Database standards reflect the **real** patterns already in the
> codebase (scrypt + hashed session tokens, zod validation, `orgId` scoping, idempotency).
> Follow the existing code; these documents codify it.
