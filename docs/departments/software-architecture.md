# Department — Software Architecture

## Mission

Guard the integrity of the system: the config-driven engine, multi-tenant isolation,
swappable adapters, and the shared contracts (DB schema, public API, type boundaries) that
every team depends on. Architecture makes the hard tradeoffs once, writes them down, and
enforces them.

## Responsibilities

- Own the [architecture overview](../architecture/overview.md) and the
  [module map](../architecture/module-map.md).
- Author and approve [ADRs](../architecture/overview.md#architecture-decision-records-adrs).
- Chair the Architecture Council.
- Own shared contracts: Prisma schema shape, public API surface, `src/lib/config/**` types.
- Run Architecture Review and Database Review gates.

## Owned modules

- `docs/architecture/**`, `docs/standards/architecture-standards.md` — primary owner.
- `src/lib/config/campaign-config.ts` — shared contract (co-owned with Backend; Architecture
  approves type/shape changes).
- `prisma/schema.prisma` — **shared contract**; Architecture + Database review required for
  any change.

## Coding responsibilities

- Architecture documents, ADRs, contract definitions.
- Reference implementations and interface definitions for new adapter categories.

## Review responsibilities

- **Mandatory review** on: schema changes, public API changes, new module boundaries,
  changes to `src/lib/config/**`, and any cross-department change.
- Reject changes that fork the engine, break tenant isolation, or introduce breaking
  changes without a migration + version bump.

## Escalation rules

- Cross-module disputes → Architecture Council vote.
- Proposed breaking change → must produce an ADR + migration plan; Executive Office signs off.
