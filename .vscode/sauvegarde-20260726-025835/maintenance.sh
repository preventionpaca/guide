#!/usr/bin/env bash
set -euo pipefail

REPO="/home/rudy/Documents/Prevention_PACA/DEV/github-pages"
CONFIG="$REPO/site-config.js"

cd "$REPO"

cat > "$CONFIG" <<'CONFIGEOF'
// Configuration globale du portail Prévention PACA
// false = site en ligne
// true  = page de maintenance

window.MAINTENANCE = true;
CONFIGEOF

echo "🛠 Mode maintenance activé localement."

git add site-config.js

if git diff --cached --quiet; then
  echo "ℹ️ Le site était déjà en maintenance."
  exit 0
fi

git commit -m "Activation maintenance - $(date '+%d/%m/%Y à %H:%M:%S')"
git push origin main

echo "✅ MODE MAINTENANCE PUBLIÉ"
echo "⏳ GitHub Pages peut prendre quelques instants pour se mettre à jour."
