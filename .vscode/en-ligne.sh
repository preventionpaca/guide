#!/usr/bin/env bash
set -euo pipefail

REPO="/home/rudy/Documents/Prevention_PACA/DEV/github-pages"
CONFIG="$REPO/site-config.js"

cd "$REPO"

cat > "$CONFIG" <<'CONFIGEOF'
// Configuration globale du portail Prévention PACA
// false = site en ligne
// true  = page de maintenance

window.MAINTENANCE = false;
CONFIGEOF

echo "✅ Mode production activé localement."

git add site-config.js

if git diff --cached --quiet; then
  echo "ℹ️ Le site était déjà en ligne."
  exit 0
fi

git commit -m "Remise en ligne - $(date '+%d/%m/%Y à %H:%M:%S')"
git push origin main

echo "✅ SITE REMIS EN LIGNE"
echo "⏳ GitHub Pages peut prendre quelques instants pour se mettre à jour."
