# Handoff — Ai Studio Referrals

_Living handover doc. Update when state changes. Last updated: 2026-06-25._

## TL;DR
Multi-tenant referral SaaS, **live in production** on **Next.js 15.5.19 + TypeScript + Tailwind + Prisma + MySQL**.

- **Live:** https://ref.aistudiocraft.in (also the `…hostingersite.com` subdomain)
- **Repo:** https://github.com/Ai-Studio-Growth/ai-studio-referrals — public, **trunk-based on `main`**, CI-gated, **auto-deploys to Hostinger on push to `main`**
- **Demo logins** (password `Demo1234`): `super@aistudioreferrals.com` (platform), `demo@nimbus.io` (advertiser), `referrer@nimbus.io` (referrer)

## What the product is
Three roles share one `Account` table, each routed to its own area and guarded at the edge (`middleware.ts`) **and** per-page (`requireSession`/`requireWorkspace`/`requireReferrer`):

- **super_admin → `/platform`**: clients, subscriptions, integrations (no-code provider registry), notifications, all-referrers, users, platform settings, audit log.
- **advertiser → `/admin`**: overview, analytics (+CSV export), campaigns, referrers (invite), payouts, fraud review, audit log, webhooks, settings.
- **referrer → `/dashboard`**: own performance, share hub (customizable link + branded share icons), wallet, notifications.

Engine: config-driven campaigns, codes/links/QR, attribution, fraud screening, double-sided rewards, audit log; public REST API + API keys, embeddable widget, signed outbound webhooks.

## Deployment
- **Hostinger managed GitHub deploy** (Next.js preset) → builds + runs from `main`. NOTE: `server.js` and `.github/workflows/deploy.yml` exist for a Passenger/SSH approach but are **UNUSED** by the managed deploy.
- **DB:** Hostinger **MySQL** (Remote MySQL enabled, host `srv1827.hstgr.io:3306`). Prisma provider `mysql`; long/free-text fields use `@db.Text`.
- **Env vars** (Hostinger → site → Environment variables; apply only on a fresh deploy): `DATABASE_URL`, `APP_SECRET`, `NEXT_PUBLIC_APP_URL`.
- **Schema changes after launch:** the managed build runs `next build` only — run `npx prisma db push` against the live DB manually (set `DATABASE_URL` to the remote MySQL).

## Gotchas (important)
- **Hostinger 503s on statically-prerendered pages** → keep public pages `export const dynamic = 'force-dynamic'` (done for `/` and `/docs`).
- Each redeploy has **~1–2 min of 503 flapping** during restart — normal, not a failure.
- `next-themes` toggle must render its icon via CSS `dark:` variants (not a mount guard) or it looks missing on first paint.
- Branch protection requires the CI check, but **CODEOWNERS is advisory** (org on Free plan). Merge with `gh pr merge <n> --squash --admin`.
- **Prisma needs Linux `binaryTargets`** in `schema.prisma` for the managed runtime.

## Open / next tasks
1. Set **`NEXT_PUBLIC_APP_URL`** → `https://ref.aistudiocraft.in` in Hostinger + redeploy (links/QR still use the old subdomain otherwise). _Highest value, quick._
2. Re-run Hostinger's **vulnerability scan**; **close Hostinger's auto-fix PR** (superseded by the Next 15.5.19 bump).
3. **Dependabot #7/#8 — Prisma 6→7** (major): deliberate upgrade pass.
4. **Production hardening:** wipe demo data + create your own super-admin; **rotate the MySQL password + `APP_SECRET`** (both were shared in chat during setup).

## Local dev (Windows)
Node/npm + `gh` are installed via winget but **not on PATH** — prepend the node dir; use `gh` by full path. Needs a MySQL `DATABASE_URL`.
```powershell
$env:Path = "C:\Users\ADMIN\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.18.0-win-x64;" + $env:Path
npm install
npx prisma db push
npx tsx prisma/seed.ts   # optional demo data
npm run dev              # http://localhost:3000
```

## Workflow for changes (don't push to `main`)
```
git checkout main && git pull
git checkout -b feat/<thing>
# edit, then verify:
npx tsc --noEmit && npm run build
git push -u origin feat/<thing>   # open PR, CI must pass
gh pr merge <n> --squash --delete-branch --admin   # → auto-redeploys
```

## Recent PR history (context)
#1 notifications · #9 audit log · #10 webhooks · #11 payouts · #13 analytics · #14 deploy setup · #20 MySQL · #21 Prisma binaryTargets · #23 Next 15.5.19 (CVEs) · #24 force-dynamic static pages · #26 theme-toggle visibility.
