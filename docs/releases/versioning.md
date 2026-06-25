# Versioning

Owner: VP Engineering. We follow **Semantic Versioning** `MAJOR.MINOR.PATCH`.

| Segment | Bump when | Requires |
| --- | --- | --- |
| **MAJOR** | Breaking change to public API, DB contract, or shared interface | ADR + migration + deprecation window + Executive sign-off |
| **MINOR** | New backward-compatible feature | Release gate |
| **PATCH** | Backward-compatible bug fix | Release gate (abbreviated) |

## Rules

- The version lives in [`package.json`](../../package.json) (`version`). Current: **0.1.0**.
- Tags are annotated: `vMAJOR.MINOR.PATCH` on `main`.
- Pre-1.0, MINOR may include larger changes, but we still avoid silent breaking changes —
  deprecate and migrate.
- The public API contract is the line we protect most carefully (see
  [api standards](../standards/api-standards.md#versioning--compatibility)).

## Tagging

```bash
git checkout main
git pull
git tag -a vX.Y.Z -m "vX.Y.Z — <theme>"
git push origin vX.Y.Z
```

DevOps then runs `prisma migrate deploy` and ships. Rollback = redeploy the previous tag
(migrations are backward compatible within a deprecation window).
