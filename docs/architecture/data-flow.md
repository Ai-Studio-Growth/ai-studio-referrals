# Data Flow & Lifecycles

## Conversion lifecycle (authoritative)

```
1. CLICK
   GET /r/[code]
   → 302 redirect (edge-cached: s-maxage + stale-while-revalidate)
   → async write Click row + set attribution cookie  (sub-100ms target)

2. EVENT
   POST /api/conversions  (API key)   — or inbound webhook /api/webhooks/[provider]
   → validate body (zod) + API-key auth + rate limit
   → match trigger event (signup | first_purchase | subscription | kyc_complete | custom_event)
   → idempotency: dedupe on idempotencyKey

3. ATTRIBUTION
   → explicit code wins; else device/IP within attribution window (first_touch | last_touch)

4. FRAUD SCREEN  (src/lib/referral/fraud.ts)
   → self-referral, IP/device velocity, disposable email, phone validation
   → high  → reject
   → medium → FraudFlag + manual review queue
   → clean → approve

5. REWARD RESOLUTION  (src/lib/referral/rewards.ts)
   → base + milestone/tier bonus + referee (double-sided)
   → create Reward(s) in HOLD state (reward hold period)

6. AUDIT
   → every step writes an AuditLog row (actor, action, entity, metadata, orgId)

7. MATURATION
   hold matures → reward cleared → wallet credited
   → POST /api/payouts → payout requested → adapter pays → paid
```

## Tenant scoping invariant

Every read/write carries `orgId`. The only cross-tenant reads are explicit super_admin
console views (`src/app/(platform)/**`), which are RBAC-guarded and audited.

## Idempotency

Conversions and webhook deliveries carry an idempotency key. Replays return the original
result without double-rewarding. This is a correctness invariant owned by Backend.

## Attribution model

- `first_touch` — first click within the window owns the conversion.
- `last_touch` — most recent click within the window owns the conversion.
- Window is configurable per campaign (days). Explicit referral code always overrides
  cookie-based attribution.

## Money lifecycle

`Reward (hold) → cleared → wallet balance → Payout (requested) → Payout (paid)`. All money
mutations are audited and reversible-by-compensation, never by silent edit.
