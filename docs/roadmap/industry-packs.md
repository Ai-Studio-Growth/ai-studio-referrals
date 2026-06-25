# Industry Packs

Owner: Product. Industry packs are **pre-configured campaign templates** for a vertical —
shipped as config + adapter selections, never as engine forks. They prove the config-driven
thesis: a new vertical is data, not code.

## What a pack contains

- Default **campaign config**: trigger events, reward types, eligibility, attribution window,
  fraud sensitivity tuned for the vertical.
- Recommended **adapters**: payout + messaging + e-commerce/CRM defaults.
- **Copy & branding** defaults for the referee landing and widget.
- **Analytics presets**: the KPIs that matter for the vertical.

## Planned packs (v0.4)

| Pack | Trigger focus | Reward defaults | Key integrations |
| --- | --- | --- | --- |
| **SaaS** | `subscription`, `signup` | free months, account credit, recurring | Stripe Billing, Slack, HubSpot |
| **E-commerce** | `first_purchase` | % / flat discount, store credit | Shopify, WooCommerce, Klaviyo |
| **Fintech** | `kyc_complete`, `first_purchase` | cash, gift cards (Tremendous) | Wise, Stripe, Segment |
| **Marketplace** | `custom_event` (first transaction) | double-sided cash + credit | Stripe Connect, webhooks |
| **Mobile app** | `signup`, `custom_event` | points, in-app credit | deep links, GA4, Mixpanel |

## Rules

- A pack is **config**. If a pack needs an engine change, that's an Architecture Council
  decision (likely a missing config primitive, not a fork).
- Packs are versioned and live alongside templates in the
  [marketplace](marketplace-strategy.md).
- Each pack ships with docs and at least one acceptance test proving end-to-end flow.
