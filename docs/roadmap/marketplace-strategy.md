# Marketplace Strategy

Owner: Product + Integrations. The marketplace turns our adapter and template architecture
into an ecosystem.

## What's listed

1. **Adapters** — payout, messaging, auth, e-commerce, CRM, analytics providers. Each
   conforms to a published interface and ships with a safe console fallback.
2. **Industry packs & templates** — pre-built campaign configs (see
   [industry-packs](industry-packs.md)).
3. **Recipes** — Zapier/Make automations and webhook patterns.

## Why it works

- The [adapter architecture](../architecture/overview.md#layered-view) already isolates
  providers behind interfaces — adding a listing is implementing an interface, not touching
  the engine.
- The no-code integration registry (platform console) lets admins enable listings without a
  redeploy.

## Quality bar for a listing

- Implements the published adapter interface exactly; no engine changes.
- Env-driven config; **no secrets in code**; safe fallback when unconfigured.
- Inbound webhooks verify signatures and are idempotent.
- Ships docs + a contract test. Security-reviewed if it touches auth or money.

## Phasing

- **v0.5 — Marketplace v1:** first-party adapters + industry packs, internal certification.
- **Later:** partner-submitted adapters with a review/certification pipeline (Integrations +
  Security gate), usage analytics, and revenue share.

## Governance

A new adapter **category** requires an ADR (Architecture defines the interface). Listings
within an existing category are reviewed by Integrations + Security.
