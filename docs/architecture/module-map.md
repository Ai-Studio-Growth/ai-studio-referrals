# Module Map

Path-level map of the system with the owning department. Authoritative for review routing;
see the full [code-ownership map](../employees/README.md#code-ownership-map).

## Domain — referral engine

| Path | Purpose | Owner |
| --- | --- | --- |
| `src/lib/referral/engine.ts` | Codes, clicks, attribution, conversions, audit orchestration | Backend (ENG-001) |
| `src/lib/referral/codes.ts` | Code + short-link + QR generation, PII hashing | Backend / Security |
| `src/lib/referral/fraud.ts` | Self-referral, velocity, device, email/phone screening | AI + Backend |
| `src/lib/referral/rewards.ts` | Reward resolution (base + milestones + double-sided) | Backend (ENG-003) |
| `src/lib/config/campaign-config.ts` | Trigger/reward/eligibility types + tier ladder (zod) | Architecture + Backend |

## Domain — supporting

| Path | Purpose | Owner |
| --- | --- | --- |
| `src/lib/stats.ts` | Referrer + org analytics (funnel, K-factor, CAC, time series) | Backend / Performance |
| `src/lib/money.ts` | Currency + money math | Backend |
| `src/lib/notifications.ts` | In-app notification center | Backend |
| `src/lib/audit.ts` | Audit-log query/reporting | Backend / Security |

## Integration — adapters

| Path | Purpose | Owner |
| --- | --- | --- |
| `src/lib/adapters/payouts.ts` | console · stripe · paypal · razorpay · wise · tremendous | Integrations |
| `src/lib/adapters/messaging.ts` | email · SMS · Slack/Discord · webhooks | Integrations |
| `src/lib/adapters/auth.ts` | credentials · magic-link · OAuth · SAML SSO | Integrations / Security |

## Platform — security & data

| Path | Purpose | Owner |
| --- | --- | --- |
| `src/lib/auth.ts`, `auth-actions.ts` | Session-backed auth, login/signup/logout actions | Security |
| `src/lib/password.ts` | scrypt hashing, strength policy | Security |
| `src/lib/session.ts` | Session resolver | Security |
| `src/middleware.ts` | Edge cookie-presence guard | Security |
| `src/lib/api-auth.ts` | API-key auth + token-bucket rate limiting | Backend / Security |
| `src/lib/db.ts` | Prisma client | Backend |
| `prisma/schema.prisma` | Multi-tenant schema | Architecture |

## Presentation — route groups

| Path | Surface | Access | Owner |
| --- | --- | --- | --- |
| `src/app/(marketing)/**` | Landing, docs | public | Frontend / Product |
| `src/app/(auth)/**` | Login, signup | public | Frontend / Security |
| `src/app/(app)/**` | dashboard, admin, leaderboard, settings, notifications | role-gated | Frontend |
| `src/app/(platform)/**` | platform console | super_admin | Frontend (FE-002) |
| `src/app/join/[code]/**` | Referee landing | public | Frontend / CSE |
| `src/app/r/[code]/route.ts` | Fast referral redirect | public | Backend / Performance |
| `src/app/api/**` | Public REST API + webhooks | API key | Backend / Integrations |
| `src/app/widget.js/route.ts` | Embeddable JS SDK | public | Backend |
| `src/app/community/**` | Community feed | auth | CSE / Frontend |

## Presentation — components

| Path | Purpose | Owner |
| --- | --- | --- |
| `src/components/ui.tsx` | Primitive kit | UI/UX |
| `src/app/globals.css`, `tailwind.config.ts` | Design tokens | UI/UX |
| `src/components/*-shell.tsx`, `providers.tsx` | App shells, providers | Frontend |
| `src/components/**` (features) | Share hub, charts, forms, bells, etc. | Frontend / UI/UX |
