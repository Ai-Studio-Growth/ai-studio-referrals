# Department — DevOps

## Mission

Make building, testing, deploying, and observing the platform boringly reliable. Own the
path from commit to production, environment configuration, and the Postgres production
migration path.

## Responsibilities

- Own CI/CD: build (`npm run build`), lint, test gates, and release automation.
- Own environment configuration and secret management (`.env.example` contract; no secrets
  in code).
- Own the SQLite→Postgres production path and `prisma migrate deploy`.
- Own observability: logging, metrics, and uptime; back rate limiting with Redis/edge KV in
  production.
- Maintain branch protection and the [git workflow](../workflows/git-workflow.md) automation.

## Owned modules

- Build & config: `package.json` scripts, `next.config.mjs`, `postcss.config.mjs`,
  `tsconfig.json`, `.gitattributes`.
- `.env.example` (contract; values are environment-provided).
- CI workflow files and deployment manifests (when added).
- Prisma migration operations (schema *shape* is Architecture's; migration *execution* is
  DevOps').

## Coding responsibilities

- CI pipelines, deployment scripts, infra-as-config.
- Health checks, runtime config plumbing, observability hooks.

## Review responsibilities

- Review changes to build config, scripts, and environment contracts.
- Gate releases on green build + lint + tests (Release Council member).
- Verify no secret is committed; verify adapters fall back to safe console stubs.

## Escalation rules

- Failed production deploy or migration → Sev-1, page DevOps Lead + Backend Lead.
- Secret exposure → Security incident response immediately, rotate the secret.
