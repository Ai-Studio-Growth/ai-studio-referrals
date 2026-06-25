# Ai Studio Referrals — Universal Referral Engine

A production-grade, **multi-tenant**, **config-driven** referral platform that drops a
premium double-sided referral program into *any* business — SaaS, e-commerce, fintech,
marketplaces, mobile apps — without changing engine code. Launch a campaign, generate a
link, share it, and watch a tracked conversion turn into a reward, end to end, in minutes.

Built with **Next.js 15 (App Router) · TypeScript · Tailwind · Prisma**. SQLite for
zero-config local dev; swap the Prisma provider to **Postgres** for production.

---

## ✨ One-command setup

> Requires **Node 18+** (developed on Node 24). On Windows, restart your terminal after
> installing Node so it's on `PATH`.

```bash
npm install         # install dependencies
cp .env.example .env # (already created for you in this repo)
npm run setup        # prisma generate + db push + seed realistic demo data
npm run dev          # http://localhost:3000
```

`npm run setup` prints a **demo API key** (`rl_live_…`) once — copy it to call the public API.

### Three roles, three demo logins (password `Demo1234`)

| Role | Login | Lands on | Can do |
| --- | --- | --- | --- |
| **Platform admin** | `super@aistudioreferrals.com` | `/platform` | Manage all clients, subscriptions, integrations, notifications, users |
| **Advertiser** | `demo@nimbus.io` | `/admin` | Run campaigns, analytics, fraud review, settings for their workspace |
| **Referrer** | `referrer@nimbus.io` | `/dashboard` | View their own performance, share links, wallet & rewards |

Or create a fresh advertiser workspace at `/signup`.

Open:

| Surface | URL | Access | What you'll see |
| --- | --- | --- | --- |
| Landing | `/` | public | Marketing hero + product preview |
| Sign up / Log in | `/signup`, `/login` | public | Secure account creation & sign-in |
| **Platform console** | `/platform` | 🔒 super_admin | Cross-tenant clients, subscriptions, integrations, notifications, users |
| Referrer dashboard | `/dashboard` | 🔒 referrer | Own performance, share hub, tier progress, wallet, activity |
| Leaderboard | `/leaderboard` | 🔒 auth | Podium, tiers, badges, full rankings |
| Advertiser admin | `/admin` | 🔒 advertiser | Funnel, K-factor, CAC, campaigns, fraud queue, A/B |
| Campaign builder | `/admin/campaigns/new` | 🔒 advertiser | No-code trigger + reward configuration |
| Settings | `/settings` | 🔒 advertiser | Workspace, branding, team & API keys |
| Referee landing | `/join/<code>` | public | Frictionless invite page with the referee reward |
| Referral redirect | `/r/<code>` | public | Edge-cached 302 with async click tracking |

## 🧩 Self-service & no-code

- **Advertiser → invite referrers**: Admin → Referrers creates a referral link + a portal
  login for each invitee, and tracks their performance.
- **Super admin → manage everything**: clients & plans, **all referrers' performance**
  (`/platform/referrers`), users (roles, suspend), notifications, and a **no-code
  integration registry** + **platform settings** — add providers and config keys from the
  UI, no redeploy.
- **Functional settings**: workspace name, **multi-currency** (10 currencies), white-label
  colours, custom domain, team invites, and API-key generation — all save to the DB.
- **Profile** (`/profile`): any user updates their name, email, and password.
- **Docs/Help** (`/docs`) and a built-in **Community** feed (`/community`).
- **Light/dark theme** everywhere (toggle in every shell), **mobile-responsive**
  (collapsible drawers), and **case-insensitive** referral links.

## 👥 Roles & multi-tenancy

A single `Account` table backs three roles, routed to their own area on login and
guarded both at the edge (`middleware.ts`) and per-page:

- **super_admin** — the platform operator. The `/platform` console manages every tenant:
  clients & plans, subscription status/MRR, per-client integrations, broadcast
  notifications, and all user accounts (role changes, suspend/reactivate).
- **advertiser** — owns a workspace (`Org`). Runs campaigns, sees analytics, reviews fraud,
  manages branding/team/API keys. This is the workspace dashboard.
- **referrer** — an end user with a login linked to their `EndUser` profile. Sees only their
  own clicks/conversions/earnings, share hub, and the leaderboard.

## 🔐 Authentication & security

The app pages live behind a real session. Public marketing, the referee landing, and the
referral redirect stay open; everything under `/platform`, `/admin`, `/dashboard`,
`/leaderboard` and `/settings` requires login, and each role can only reach its own area.

- **Passwords** hashed with **scrypt** (memory-hard, per-user random salt, constant-time
  verification) — never stored or logged in plaintext. Server-side strength policy.
- **Sessions**: a 256-bit random token in an **httpOnly, SameSite=Lax, Secure** (in prod)
  cookie; only the **SHA-256 hash** of the token is persisted, so a DB leak can't be replayed.
- **Two-layer guard**: edge `middleware.ts` does a fast cookie-presence check; the app layout
  then does full cryptographic validation via `requireSession()` (defense in depth).
- **Brute-force protection**: per-IP+email sliding-window lockout on login, generic
  "invalid email or password" errors, and constant-time verify even for unknown emails.
- **Server actions** for login/signup/logout (same-origin enforced by Next.js).
- Each signup provisions an isolated **workspace (Org)** + owner account + a starter campaign.

See [src/lib/password.ts](src/lib/password.ts), [src/lib/auth.ts](src/lib/auth.ts),
[src/lib/auth-actions.ts](src/lib/auth-actions.ts) and [src/middleware.ts](src/middleware.ts).

Useful scripts: `npm run db:studio` (Prisma Studio), `npm run db:reset` (wipe + reseed),
`npm run build`, `npm start`.

---

## 🧠 How the engine is config-driven

A business launches a program by creating a **Campaign** — never by editing code. Each
campaign carries its own:

- **Trigger event** — `signup · first_purchase · subscription · kyc_complete · custom_event`.
- **Reward config** (`referrerReward` / `refereeReward` JSON, validated by zod in
  [`src/lib/config/campaign-config.ts`](src/lib/config/campaign-config.ts)):
  cash · credit · % or flat discount · free months · points · gift, **one-time or recurring**,
  with **milestone/tier** bonuses and **double-sided** (referrer + referee) rewards.
- **Attribution** — `first_touch` / `last_touch` with a configurable window (days).
- **Caps & eligibility** — max rewards/user, total budget, new-users-only, allowed
  countries, disposable-email blocking, **reward hold period**.
- **A/B testing** — variants share an `abTestKey` and split traffic by `abWeight`.

The engine ([`src/lib/referral/engine.ts`](src/lib/referral/engine.ts)) reads all of this
at runtime — adding a new business or offer requires **zero engine changes**.

### Conversion lifecycle

```
click  →  /r/[code] 302 (async click write + attribution cookie)
event  →  POST /api/conversions  (or inbound webhook)
          ├─ match trigger event & idempotency key
          ├─ attribute (explicit code → device/IP within window)
          ├─ fraud screen (self-referral, IP/device velocity, disposable email)
          │     high → reject · medium → manual review · clean → approve
          ├─ resolve rewards (base + milestone + referee), put on hold
          └─ audit log every step
hold matures → reward cleared → wallet credited → payout requested → paid
```

---

## 🗂️ Project structure (organized by feature)

```
prisma/
  schema.prisma        Multi-tenant schema (Org, Membership, ApiKey, Campaign,
                       EndUser, Referral, Click, Conversion, Reward, Payout,
                       FraudFlag, AuditLog)
  seed.ts              2 orgs, 3 campaigns, ~140 users, 460+ clicks, 100+ conversions
src/
  lib/
    config/campaign-config.ts   Trigger/reward/eligibility types + tier ladder (zod)
    referral/
      engine.ts        Codes, clicks, attribution, conversions, rewards, audit
      codes.ts         Code + short-link + QR generation, PII hashing
      fraud.ts         Self-referral, velocity, device, email/phone validation
      rewards.ts       Reward resolution (base + milestones + double-sided)
    adapters/          Swappable integrations (interface + provider selection)
      payouts.ts       console | stripe | paypal | razorpay | wise | tremendous
      messaging.ts     email (resend/sendgrid) · SMS (twilio) · Slack/Discord · webhooks
      auth.ts          credentials | magic-link | google/apple/github | SAML SSO
    stats.ts           Referrer + org analytics (funnel, K-factor, CAC, time series)
    api-auth.ts        API-key auth + token-bucket rate limiting
    db.ts / session.ts Prisma client + demo session resolver
  app/
    page.tsx                     Landing
    dashboard/                   Referrer dashboard (+ skeleton loading)
    leaderboard/                 Gamified leaderboard
    admin/                       Analytics + campaigns + fraud queue + builder
    join/[code]/                 Referee landing
    r/[code]/route.ts            Fast referral redirect
    api/                         referrals · conversions · campaigns · payouts · webhooks
    widget.js/route.ts           Embeddable JS SDK (drop-in "Refer & earn" launcher)
    actions.ts                   Server actions backing the in-app UI
  components/                    Premium UI kit (bento, glass, counters, share hub, charts)
```

---

## 🔌 Public API

Authenticate with `Authorization: Bearer <api_key>`. Rate-limited per key (token bucket).

```bash
# Generate / fetch a referral link (idempotent)
curl -X POST localhost:3000/api/referrals -H "Authorization: Bearer $KEY" \
  -H 'content-type: application/json' \
  -d '{"campaignId":"...","user":{"email":"a@b.com","name":"Ada"}}'
# → { code, shortLink, landingLink, qr (data URL) }

# Record a conversion (trigger event)
curl -X POST localhost:3000/api/conversions -H "Authorization: Bearer $KEY" \
  -H 'content-type: application/json' \
  -d '{"campaignId":"...","event":"subscription","code":"ADA-7Q2K","refereeEmail":"c@d.com","valueCents":9900,"idempotencyKey":"evt_1"}'

# List referrals (server-side paginated, indexed)
curl "localhost:3000/api/referrals?page=1&pageSize=20" -H "Authorization: Bearer $KEY"

# Create a campaign (no-code config)         → POST /api/campaigns
# Request a payout                           → POST /api/payouts
# Inbound webhooks (stripe|shopify|generic)  → POST /api/webhooks/[provider]
```

### Embeddable widget

```html
<script src="https://your-app/widget.js"
        data-campaign="cmp_123" data-email="user@acme.com" data-key="rl_live_…"></script>
```

---

## 🎨 Design system

Design tokens (color, radius, depth) live as CSS variables in
[`globals.css`](src/app/globals.css) and [`tailwind.config.ts`](tailwind.config.ts):
bento-grid layout, soft glassmorphism, tasteful gradients, rounded geometry, full
**dark/light** mode, **WCAG-minded** contrast, and `prefers-reduced-motion` support.
Micro-interactions: count-up animated stats, confetti on copy/convert, hover states,
skeleton loaders.

White-label per org: `Org.logoUrl`, `brandColor`, `accentColor`, `customDomain`.

---

## ⚙️ Configuration & integrations

Every integration is environment-driven (see [`.env.example`](.env.example)) — no secrets
in code. Unconfigured adapters fall back to safe **console stubs** so the app always runs.

| Category | Providers (adapter-ready) |
| --- | --- |
| Auth | email/password, magic link, Google/Apple/GitHub, SAML SSO |
| Payouts | Stripe, PayPal, Razorpay, Wise, Tremendous (gift cards) |
| Messaging | Resend/SendGrid, Twilio, Slack/Discord alerts |
| E-commerce | Shopify, WooCommerce, Stripe Billing (webhooks) |
| CRM/analytics | HubSpot, Salesforce, Segment, GA4, Mixpanel, PostHog |
| Automation | Zapier/Make, inbound + outbound webhooks |

---

## 🚀 Production notes

- **Deploy:** see **[DEPLOY-HOSTINGER.md](DEPLOY-HOSTINGER.md)** — step-by-step for Hostinger
  (Node.js app) + Neon Postgres, with GitHub Actions auto-deploy over SSH.
- **Postgres**: the Prisma datasource is `postgresql` (with `DATABASE_URL` pooled +
  `DIRECT_URL` direct for migrations). Local dev needs a Postgres URL too (a free Neon branch
  works); run `npx prisma db push` then `npx tsx prisma/seed.ts`.
- **Edge**: `/r/[code]` is cache-friendly (`s-maxage` + `stale-while-revalidate`) and writes
  clicks asynchronously for sub-100ms redirects.
- **Rate limiting** uses an in-memory token bucket for the demo — back it with Redis/edge KV
  in production.
- Replace the demo session resolver ([`session.ts`](src/lib/session.ts)) with your auth
  adapter's real session.

---

## ✅ Acceptance criteria — met

A new business can **sign up an org → launch a configured campaign → a referrer generates a
link → shares it → and a tracked conversion produces a reward**, end to end, with a premium
UI. Verified locally: build passes, all routes serve, API auth + pagination + redirect +
attribution + idempotent conversions + double-sided/milestone rewards + fraud queue all work.
