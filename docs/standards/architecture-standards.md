# Architecture Standards

Owner: Software Architecture.

## The prime directive

**Never redesign existing architecture.** The config-driven engine, multi-tenant isolation,
and adapter pattern are load-bearing. Changes to them require an
[ADR](../architecture/overview.md#architecture-decision-records-adrs) accepted by the
Architecture Council.

## Boundaries

- **Presentation → Application → Domain → Integration → Platform → Data.** Dependencies point
  downward only. A route may call a domain function; a domain function must not import a React
  component.
- **Adapters are the only place that talks to third parties.** Domain code depends on adapter
  *interfaces*, not provider SDKs.
- **Shared contracts** (DB schema, public API surface, `src/lib/config/**` types) change only
  with Architecture review.

## Config-driven rules

- New business capability = new **configuration** (campaign fields) + possibly a new
  **adapter**, never an engine fork.
- If a request seems to need an engine change, the Architecture Council must first confirm it
  cannot be expressed as config/adapter.

## Multi-tenancy

- Every persistent entity belongs to an `Org`. Every access path is `orgId`-scoped.
- Cross-tenant functionality is exclusively in the RBAC-guarded platform console.

## Backward compatibility

- Public API and DB schema are append-mostly. Removing/renaming a field is a breaking change
  requiring: ADR + deprecation window + migration + version bump.
- Maintain idempotency and existing response shapes.

## When to write an ADR

- New module boundary or dependency direction.
- Change to a shared contract (schema, API, config types).
- New adapter category.
- Any change that affects more than one department's owned modules.
- Anything that could break an integrator.

## Review authority

Architecture has mandatory review on schema, public API, module boundaries, and all
cross-department changes, and may reject changes that violate these standards.
