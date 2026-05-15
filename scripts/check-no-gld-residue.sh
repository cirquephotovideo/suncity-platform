#!/usr/bin/env bash
# check-no-gld-residue.sh — garde-fou pre-commit / CI
# Sort 1 si on détecte des résidus GLD (religion, LGBT-community-only, multi-domain, Connect, SaaS Pixeesite)
# dans les fichiers tracked. Ignore les fichiers d'archive et les binaires.
set -euo pipefail

if [[ ! -d .git ]]; then
  echo "Doit être lancé depuis la racine du repo git." >&2; exit 2
fi

# Fichiers tracked, hors binaires, hors README (qui mentionne légitimement l'origine GLD)
FILES=$(git ls-files \
  | rg -v '\.(png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|pdf|mp4|webm|mp3|wav|zip)$' \
  | rg -v '^(README\.md|PLAN_SUNCITY_2026\.md|scripts/(rebrand-suncity|check-no-gld-residue)\.sh)$' \
  || true)

if [[ -z "$FILES" ]]; then
  echo "Aucun fichier à scanner."; exit 0
fi

# Patterns interdits
PATTERNS=(
  'godlovesdiversity'
  'good ?love ?diversity'
  'god ?loves ?diversity'
  '\bGLD\b'
  '\bgld\b'
  'gldminio'
  'parislgbt'
  'francelgbt'
  'lgbtminio'
  'SITE_SCOPE'
  '\bcercle.?priere'
  '\bchamp.?priere'
  'compagnon-spirituel'
  'temoignage-ia'
  'verset-inclusif'
  'textes-sacres'
  'voice-coach'
  '\bcamino\b'
  'pelerinage'
  'connect[- ]?(profile|match|message)'
  'tinder'
  'pixeesite'
  '\bidentite-flag|identity-flag'
  'drapeau-pride'
)

EXIT=0
for p in "${PATTERNS[@]}"; do
  HITS=$(printf '%s\n' "$FILES" | xargs -r rg -l -i "$p" 2>/dev/null || true)
  if [[ -n "$HITS" ]]; then
    EXIT=1
    echo "❌ Résidu '$p' détecté dans :"
    printf '   %s\n' $HITS
  fi
done

if [[ $EXIT -eq 0 ]]; then
  echo "✅ Aucun résidu GLD détecté."
else
  echo ""
  echo "⚠️  Corrige ces résidus avant de commit. Tag d'archive disponible : archive/gld-source-pre-suncity"
fi

exit $EXIT
