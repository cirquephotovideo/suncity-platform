#!/bin/sh
set -e

echo "▶ Sun City — entrypoint"

if [ -n "${DATABASE_URL:-}" ]; then
  echo "▶ Waiting for database…"
  i=0
  until npx prisma db push --accept-data-loss --skip-generate --schema prisma/schema.prisma 2>&1; do
    EC=$?
    i=$((i+1))
    if [ "$i" -gt 30 ]; then
      echo "❌ Database push failed after 30 attempts. Aborting."
      exit 1
    fi
    echo "  retry $i/30 (last exit code: $EC)…"; sleep 2
  done
  echo "✅ Database schema synced"

  if [ "${SKIP_SEED:-0}" != "1" ]; then
    echo "▶ Seeding (idempotent)"
    npx tsx prisma/seed.ts 2>&1 || echo "⚠ seed failed (non-fatal)"
  else
    echo "▶ Seed skipped (SKIP_SEED=1)"
  fi
fi

echo "▶ Starting Next.js server on :${PORT:-3000}"
exec "$@"
