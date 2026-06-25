#!/bin/bash
# SessionStart hook for Claude Code on the web.
# Prepares the project so the agent can build / typecheck / run scripts.
# Idempotent and non-interactive.
set -euo pipefail

# Only run in the remote (web) environment; local dev manages its own setup.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# Install dependencies. Use `install` (not `ci`) so the cached container layer
# is reused on later runs. `--ignore-scripts` avoids the @prisma/engines
# postinstall, which downloads engine binaries from a host that the current
# network policy resets; deps still populate fully.
npm install --no-audit --no-fund --ignore-scripts

# Best-effort Prisma client generation. Requires the engine binary download,
# which is currently blocked by the network policy — tolerate failure so the
# session still starts with node_modules ready.
if npx prisma generate >/tmp/prisma-generate.log 2>&1; then
  echo "session-start: deps installed, Prisma client generated."
else
  echo "session-start: deps installed. WARNING: 'prisma generate' failed" \
       "(engine binary download blocked by network policy). Code that needs" \
       "the generated Prisma client (build/typecheck) may not run until the" \
       "policy allows binaries.prisma.sh or a PRISMA_ENGINES_MIRROR is set."
fi
