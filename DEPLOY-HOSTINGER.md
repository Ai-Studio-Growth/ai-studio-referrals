# Deploying Ai Studio Referrals to Hostinger (Node.js app) + Neon Postgres

This app is a **Next.js 15 server app** (SSR, server actions, middleware, API routes).
It needs a **Node.js runtime** and a **PostgreSQL** database. On Hostinger Cloud/Business
plans we run it via the **Node.js app** feature (Phusion Passenger) and use **Neon** for
Postgres (Hostinger shared plans don't provide Postgres).

Deploys are driven by **GitHub Actions over SSH** (`.github/workflows/deploy.yml`): it
pulls `main` on the server, installs deps, pushes the schema to Neon, builds, and restarts.

---

## 1. Create the database (Neon)

1. Sign up at https://neon.tech and create a project (pick a region near your Hostinger server).
2. In the project, open **Connection Details**. Copy two connection strings:
   - **Pooled** (host contains `-pooler`) → this becomes `DATABASE_URL`.
   - **Direct** (no `-pooler`) → this becomes `DIRECT_URL`.
   Make sure both end with `?sslmode=require`.

## 2. Enable SSH on Hostinger

1. hPanel → **Advanced → SSH Access** → **Enable**.
2. Note the **IP/host, port, and username** shown there.
3. Add your CI deploy key (so GitHub Actions can connect):
   - Locally: `ssh-keygen -t ed25519 -f deploy_key -N ""` → creates `deploy_key` (private) + `deploy_key.pub` (public).
   - Paste the **public** key (`deploy_key.pub`) into hPanel → SSH Access → **Manage SSH keys → Add**.
   - Keep the **private** key for the GitHub secret in step 5.

## 3. Create the Node.js app in hPanel

1. hPanel → **Advanced → Node.js** → **Create application**.
2. **Node version:** 20 (or latest 20.x). **Application mode:** Production.
3. **Application root:** a folder, e.g. `ai-studio-referrals` (under your home dir).
4. **Application startup file:** `server.js` (included in this repo).
5. Create it. Note the **nodevenv activate path** it shows, e.g.
   `/home/uXXXXXXXX/nodevenv/ai-studio-referrals/20` — you'll need it.
6. Get the code onto the server (one-time), over SSH:
   ```bash
   cd ~ && rm -rf ai-studio-referrals
   git clone https://github.com/Ai-Studio-Growth/ai-studio-referrals.git ai-studio-referrals
   ```
7. Create the server env file `~/ai-studio-referrals/.env` from
   [.env.production.example](.env.production.example) with your real Neon URLs,
   `NEXT_PUBLIC_APP_URL` (your domain) and a strong `APP_SECRET`
   (`openssl rand -hex 32`).

## 4. First build + seed (one-time, over SSH)

```bash
source /home/uXXXX/nodevenv/ai-studio-referrals/20/bin/activate   # your path from step 3.5
cd ~/ai-studio-referrals
npm ci
npx prisma generate
npx prisma db push                 # creates all tables in Neon
npx tsx prisma/seed.ts             # OPTIONAL: demo data (skip for a clean prod)
npm run build
mkdir -p tmp && touch tmp/restart.txt   # restart Passenger
```

Point your domain/subdomain at the app in hPanel and open it. (Demo logins, if seeded:
`super@aistudioreferrals.com`, `demo@nimbus.io`, `referrer@nimbus.io` / `Demo1234` — change these.)

## 5. Wire up auto-deploy (GitHub Actions)

In the repo: **Settings → Secrets and variables → Actions → New repository secret**, add:

| Secret | Value |
| --- | --- |
| `HOSTINGER_SSH_HOST` | SSH host/IP from step 2 |
| `HOSTINGER_SSH_PORT` | SSH port (often `65002` on Hostinger) |
| `HOSTINGER_SSH_USER` | SSH username from step 2 |
| `HOSTINGER_SSH_KEY` | contents of the **private** `deploy_key` |
| `HOSTINGER_APP_DIR` | `/home/uXXXX/ai-studio-referrals` |
| `HOSTINGER_NODEVENV` | nodevenv path, e.g. `/home/uXXXX/nodevenv/ai-studio-referrals/20` |

Then run **Actions → Deploy (Hostinger) → Run workflow**. It SSHes in, pulls `main`,
`npm ci`, `prisma db push`, `npm run build`, and restarts Passenger.

To deploy automatically on every merge to `main`, uncomment the `push:` trigger at the
top of `.github/workflows/deploy.yml`.

---

## Notes & troubleshooting
- **DB only**: Neon (Postgres) is the source of truth. The app's `DATABASE_URL` should be the
  **pooled** URL; migrations/`db push` use `DIRECT_URL`.
- **Restart**: Passenger reloads when `tmp/restart.txt` is touched (the workflow does this).
- **Build memory**: `next build` needs ~1 GB RAM. If the build is killed on a small plan,
  build locally / in CI and rsync the `.next` + `node_modules` instead (ask and I'll switch
  the workflow to artifact-based deploy).
- **Prisma engine**: building on the server uses the native engine for Hostinger's OS, so no
  `binaryTargets` tuning is needed.
- **Secrets**: never commit `.env`; it's gitignored.
