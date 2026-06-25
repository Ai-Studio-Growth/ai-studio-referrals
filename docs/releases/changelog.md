# Changelog

All notable changes to Ai Studio Referrals are recorded here. Format follows
[Keep a Changelog](https://keepachangelog.com/); versioning follows
[SemVer](versioning.md). Curated by Documentation; gated by the Release Council.

## [Unreleased]

### Added
- Engineering operating system under `docs/` — departments, employee directory, standards,
  workflows, roadmap (this organization setup).
- Audit-log query/reporting layer (`src/lib/audit.ts`) on branch `feat/audit-log`.

## [0.1.0] — 2026-06-25

### Added
- Config-driven, multi-tenant referral engine (codes, clicks, attribution, conversions,
  rewards, audit).
- Fraud screening (self-referral, velocity, device, disposable email).
- Double-sided + milestone reward resolution; reward holds; payouts.
- Multi-tenant auth (scrypt, hashed session tokens), RBAC for super_admin / advertiser /
  referrer, two-layer guard.
- Public REST API (referrals, conversions, campaigns, payouts, webhooks) with per-key rate
  limiting; embeddable widget.
- Platform console, advertiser admin, referrer dashboard, leaderboard, settings, community.
- Analytics (funnel, K-factor, CAC, time series); in-app notification center.
- Premium design system (bento, glass, dark/light, white-label).

[Unreleased]: #unreleased
[0.1.0]: #010--2026-06-25
