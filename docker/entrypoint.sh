#!/bin/sh
set -e

echo "▶ Sun City — entrypoint"

# Si DATABASE_URL est définie : tenter migrate + seed avec retry sur DB pas encore prête
if [ -n "${DATABASE_URL:-}" ]; then
  echo "▶ Waiting for database…"
  i=0
  until npx prisma migrate deploy 2>/dev/null; do
    i=$((i+1))
    if [ "$i" -gt 30 ]; then
      echo "❌ Database unreachable after 30 attempts. Aborting."
      exit 1
    fi
    echo "  retry $i/30…"; sleep 2
  done
  echo "✅ Migrations applied"

  if [ "${SKIP_SEED:-0}" != "1" ]; then
    echo "▶ Seeding (idempotent)"
    npx tsx prisma/seed.ts || echo "⚠ seed failed (non-fatal)"
  else
    echo "▶ Seed skipped (SKIP_SEED=1)"
  fi
fi

echo "▶ Starting Next.js server on :${PORT:-3000}"
exec "$@"
