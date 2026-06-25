# Module Dependencies

Owner: Software Architecture. Build order and dependency graph — what must exist before what.

## Dependency graph

```
                ┌─────────────┐
                │  Data layer │  prisma/schema.prisma
                │  (Prisma)   │
                └──────┬──────┘
        ┌──────────────┼────────────────┐
        ▼              ▼                 ▼
   ┌─────────┐   ┌───────────┐    ┌───────────┐
   │  Auth/  │   │  Config   │    │  db.ts    │
   │ Session │   │ (campaign)│    │ (client)  │
   └────┬────┘   └─────┬─────┘    └─────┬─────┘
        │              ▼                │
        │       ┌─────────────┐         │
        │       │  Referral   │◄────────┘
        │       │  engine     │ codes·fraud·rewards·attribution·audit
        │       └──────┬──────┘
        ▼              ▼
   ┌─────────┐   ┌───────────┐   ┌────────────┐
   │ API-auth│   │  Adapters │   │   stats    │
   │ (keys)  │   │ payouts·… │   │ analytics  │
   └────┬────┘   └─────┬─────┘   └─────┬──────┘
        ▼              ▼               ▼
   ┌──────────────────────────────────────────┐
   │  Presentation: /api · route groups · UI   │
   └──────────────────────────────────────────┘
```

## Rules

- Dependencies point **downward only** (see [architecture standards](../standards/architecture-standards.md#boundaries)).
- The engine depends on config + data + auth context, never on UI.
- Adapters depend on interfaces, not the engine's internals.
- New work picks up its dependencies first; you cannot ship a feature whose dependency is
  not yet stable.

## Cross-version dependencies

- Durable rate limiting + Postgres (v0.2) precede marketplace scale (v0.5).
- Audit log (v0.2) underpins AI explainability and anomaly detection (v0.6).
- A/B testing UI (v0.3) precedes self-optimizing rewards (v0.6).
