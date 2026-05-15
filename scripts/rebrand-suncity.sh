#!/usr/bin/env bash
# rebrand-suncity.sh — Phase 1 du rebrand GLD → Sun City Paris
# Idempotent. À lancer depuis la racine du repo.
set -euo pipefail

if [[ ! -d .git ]]; then
  echo "❌ Doit être lancé depuis la racine du repo git." >&2; exit 1
fi

echo "▶ Tag d'archive (idempotent)"
git tag archive/gld-source-pre-suncity 2>/dev/null || true

echo "▶ Suppression docs hors-scope"
git rm -rf --quiet --ignore-unmatch \
  EVALUATION_ET_PLAN_IA_LOCALE_*.md \
  IDEES_SPIRITUEL_VIRTUEL.md \
  PLAN_LIEUX_SAINTS_FETES_RELIGIEUSES.md \
  PLAN_LEADS_SCRAPER*.md \
  PLAN_SITE_BUILDER_SAAS.md \
  RAPPORT_AUDIT_GLD_*.md \
  RAPPORT_GLD_*.pdf \
  SCREENSHOTS_LIBRARY_*.md \
  SESSION_RECAP_*.md \
  .gitpush.sh \
  || true

echo "▶ Suppression routes [locale] hors-scope (religion + community-LGBT-only + SaaS pro)"
LOCALE_DIR='src/app/[locale]'
for r in \
  aide-juridique argumentaire calendrier-religieux camino cercles-priere \
  champ-de-priere compagnon-spirituel crowdfunding demo-parallax-photo don \
  espace-pro forum gld-local hebergement inscription journal marketplace \
  meetups membre-plus mentor merci message mode-calculatrice mon-espace \
  newsletters officiants p panier parrainage partager participer photo \
  signalement sos temoignage-ia temoignages textes-sacres verset-inclusif \
  voice-coach voyage-safe webcams-live wrapped boutique commande coming-soon ; do
  git rm -rf --quiet --ignore-unmatch "$LOCALE_DIR/$r" 2>/dev/null || true
done

echo "▶ Suppression routes admin/ hors-scope"
ADM='src/app/admin'
for r in \
  ai-autopilot avatar-studio claude-cli claude-workspace connect donate \
  establishments feature-chat features forum home import leads manuals map \
  menu menu-permissions news page-builder posters pro shop ; do
  git rm -rf --quiet --ignore-unmatch "$ADM/$r" 2>/dev/null || true
done

echo "▶ Suppression routes api/ hors-scope"
API='src/app/api'
for r in \
  camino chat connect donate emergency forum manuals menu menu-data mobile \
  officiants orders peer-help podcast prayer-candles prayer-chat \
  prayer-intentions prayer-presence prayers products research \
  sacred-annotations soul spiritual-companion submissions telegram \
  testimonies checkout avatar branding me ; do
  git rm -rf --quiet --ignore-unmatch "$API/$r" 2>/dev/null || true
done

echo "▶ Suppression top-level apps/ (mobile + ios-native + pixeesite SaaS)"
git rm -rf --quiet --ignore-unmatch apps 2>/dev/null || true

echo "▶ Suppression embed/widget/admin2access/connect (root) hors-scope"
git rm -rf --quiet --ignore-unmatch \
  src/app/connect \
  src/app/embed \
  src/app/admin2access \
  src/app/widget.js \
  2>/dev/null || true

echo "▶ Suppression src/lib hors-scope (religion + connect + identity-flags + scope multi-domain)"
for f in \
  src/lib/identity-flags.ts \
  src/lib/scope.ts \
  src/lib/scope.tsx \
  src/lib/prayer.ts \
  src/lib/spiritual.ts \
  src/lib/religion.ts \
  src/lib/connect.ts ; do
  git rm -rf --quiet --ignore-unmatch "$f" 2>/dev/null || true
done

# Suppression dynamique fichiers lib qui matchent religion/connect dans leur nom
git ls-files src/lib | rg -i 'priere|prayer|spiritu|religi|connect|identity-flag|scope' \
  | xargs -r git rm --quiet --ignore-unmatch 2>/dev/null || true

echo "▶ Suppression composants hors-scope par nom de fichier"
git ls-files src/components | rg -i 'priere|prayer|spiritu|religi|connect|identity|drapeau|pride|saint|verset|texte.?sacr|camino|pelerin' \
  | xargs -r git rm --quiet --ignore-unmatch 2>/dev/null || true

echo "▶ Suppression messages i18n religieux/lgbt strings (à régénérer en P3)"
# On garde les fichiers messages mais on les videra en P3. Pour l'instant on les laisse.

echo "▶ Suppression docker/ et docs/ historiques (à régénérer)"
git rm -rf --quiet --ignore-unmatch docker docs data 2>/dev/null || true

echo "▶ Renommages globaux package.json / DB / MinIO / branding"
# On ne touche au sed que sur les fichiers texte tracked, pas les binaires
TEXT_FILES=$(git ls-files | rg -v '\.(png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|pdf|mp4|webm|mp3|wav|zip)$')

# Note: macOS sed needs -i '', GNU sed needs -i. On utilise GNU (Linux sandbox).
echo "$TEXT_FILES" | xargs -r sed -i \
  -e 's/godlovesdiversity/suncity-platform/g' \
  -e 's/parislgbt-platform/suncity-platform/g' \
  -e 's/parislgbt/suncity/g' \
  -e 's/francelgbt/suncity/g' \
  -e 's/lgbtminio/suncityminio/g' \
  -e 's/lgbt-pixeeplay/sun-pixeeplay/g'

echo "▶ Renommage DB user/name dans docker-compose et .env.example"
for f in docker-compose.yml docker-compose.dev.yml .env.example ; do
  [[ -f $f ]] || continue
  sed -i \
    -e 's/POSTGRES_DB: parislgbt/POSTGRES_DB: suncity/g' \
    -e 's/POSTGRES_DB: godlovesdiversity/POSTGRES_DB: suncity/g' \
    -e 's/POSTGRES_USER: gld/POSTGRES_USER: suncity/g' \
    -e 's/POSTGRES_PASSWORD: gld/POSTGRES_PASSWORD: suncity/g' \
    -e 's|/parislgbt|/suncity|g' \
    -e 's|/godlovesdiversity|/suncity|g' \
    -e 's|MINIO_ROOT_USER:.*|MINIO_ROOT_USER: suncityminio|g' \
    -e 's|MINIO_ROOT_PASSWORD:.*|MINIO_ROOT_PASSWORD: suncityminio-secret|g' \
    -e 's|local/parislgbt|local/suncity|g' \
    -e 's|local/godlovesdiversity|local/suncity|g' \
    -e 's|bucket parislgbt|bucket suncity|g' \
    -e 's|bucket godlovesdiversity|bucket suncity|g' \
    "$f"
done

echo "✅ Strip terminé. Prochaine étape : régénération README + package.json + next.config.mjs."
