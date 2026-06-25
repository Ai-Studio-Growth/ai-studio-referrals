# API Reference & Standards

Owner: Backend Engineering. The **rules** live in
[standards/api-standards.md](../standards/api-standards.md); this page is the **endpoint
reference** for the public API. Authenticate with `Authorization: Bearer <api_key>`
(`rl_live_…`), rate-limited per key.

## Endpoints

| Method | Path | Purpose | Idempotent |
| --- | --- | --- | --- |
| POST | `/api/referrals` | Generate/fetch a referral link (idempotent) | yes |
| GET | `/api/referrals?page=&pageSize=` | List referrals (paginated, indexed) | n/a |
| POST | `/api/conversions` | Record a conversion (trigger event) | via `idempotencyKey` |
| POST | `/api/campaigns` | Create a campaign (no-code config) | no |
| POST | `/api/payouts` | Request a payout | no |
| POST | `/api/webhooks/[provider]` | Inbound webhook (stripe \| shopify \| generic) | via signature + key |

## Examples

```bash
# Generate / fetch a referral link (idempotent)
curl -X POST localhost:3000/api/referrals -H "Authorization: Bearer $KEY" \
  -H 'content-type: application/json' \
  -d '{"campaignId":"...","user":{"email":"a@b.com","name":"Ada"}}'
# → { code, shortLink, landingLink, qr }

# Record a conversion (trigger event)
curl -X POST localhost:3000/api/conversions -H "Authorization: Bearer $KEY" \
  -H 'content-type: application/json' \
  -d '{"campaignId":"...","event":"subscription","code":"ADA-7Q2K",
       "refereeEmail":"c@d.com","valueCents":9900,"idempotencyKey":"evt_1"}'

# List referrals (server-side paginated)
curl "localhost:3000/api/referrals?page=1&pageSize=20" -H "Authorization: Bearer $KEY"
```

## Embeddable widget

```html
<script src="https://your-app/widget.js"
        data-campaign="cmp_123" data-email="user@acme.com" data-key="rl_live_…"></script>
```

## Contract guarantees

- Tenant is derived from the API key — never from the request body.
- List responses: `{ rows, total, page, pageSize, totalPages }`; `pageSize` clamped 1–100.
- Backward compatible: additive only without a version bump. Breaking changes need an ADR.
- See [error semantics](../standards/api-standards.md#errors) and
  [idempotency](../standards/api-standards.md#idempotency).
