# Release Strategy

Owner: VP Engineering + Product. Mechanics live in the
[release process](../standards/release-process.md); this is the strategy.

## Cadence

- **Release train every 2 weeks** — tag `vX.Y.Z` on `main` (optionally via a short-lived
  `release/X.Y.Z` stabilization branch).
- MINOR per train when there's shippable value; PATCH on demand for fixes; MAJOR only with an
  ADR-backed breaking change.
- Hotfixes ship out-of-band from `main`.

## Principles

- **Always releasable `main`.** The trunk is production-tagged; feature branches are short-lived.
- **Feature flags over long branches.** Ship dark, enable progressively.
- **Backward compatible by default.** Integrators are never surprised.
- **Gated, not gatekept.** Automated gates (CI, tests) plus a lightweight Release Council
  sign-off — fast but safe.

## Communicating releases

- Every release updates the [changelog](../releases/changelog.md) (Keep a Changelog format).
- Breaking changes get a migration note and a deprecation window announced one release ahead.

## Environments

- **Local:** SQLite, `npm run dev`, seeded demo data.
- **Staging:** Postgres, mirrors prod, runs the release branch.
- **Production:** Postgres, `prisma migrate deploy`, durable rate limiting.
