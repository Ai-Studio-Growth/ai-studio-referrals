# Department — Integrations

## Mission

Make the platform connect to everything. Own the adapter layer — payouts, messaging, auth
providers, e-commerce, CRM, analytics — behind clean interfaces with safe console fallbacks,
plus inbound/outbound webhooks.

## Responsibilities

- Own the adapter interfaces and provider implementations.
- Own inbound webhooks (`/api/webhooks/[provider]`) and outbound webhook delivery.
- Own the no-code integration registry surfaced in the platform console.
- Ensure every adapter is environment-driven and falls back to a safe console stub.

## Owned modules

- `src/lib/adapters/**` — `payouts.ts`, `messaging.ts`, `auth.ts` (primary owner).
  > Note: the auth *adapter* (provider selection) is Integrations'; the auth *core*
  > (sessions, password, RBAC) is Security's. Coordinate on the boundary.
- `src/app/api/webhooks/[provider]/route.ts` — primary owner (with Backend for engine calls).
- `src/app/(platform)/platform/integrations/page.tsx`,
  `src/app/(platform)/platform/settings/page.tsx` — integration registry UI (with Frontend).

## Coding responsibilities

- Adapter interfaces and provider implementations (Stripe, PayPal, Razorpay, Wise,
  Tremendous; Resend/SendGrid, Twilio, Slack/Discord; Shopify/WooCommerce; HubSpot,
  Salesforce, Segment, GA4, Mixpanel, PostHog; Zapier/Make).
- Webhook signature verification and idempotent inbound handling.

## Review responsibilities

- Review all changes under `src/lib/adapters/**` and webhook routes.
- Verify no secrets in code; verify safe fallback when a provider is unconfigured.
- Verify inbound webhooks verify signatures and are idempotent.

## Escalation rules

- Adapter touches auth/session → Security review required.
- Adapter moves money (payouts) → Backend + Security co-review; must be auditable.
- New adapter *category* → Architecture defines the interface first (ADR).
