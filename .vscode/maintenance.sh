#!/usr/bin/env bash
set -euo pipefail

REPO="/home/rudy/Documents/Prevention_PACA/DEV/github-pages"
SOURCE="$REPO/index-maintenance.html"
TARGET="$REPO/index.html"
PUBLISH="$REPO/.vscode/publier.sh"
SITE_URL="https://preventionpaca.github.io/guide"

[[ -f "$SOURCE" ]] || {
  echo "❌ index-maintenance.html est introuvable."
  exit 1
}

cp -- "$SOURCE" "$TARGET"

cmp -s "$SOURCE" "$TARGET" || {
  echo "❌ La copie de la page de maintenance a échoué."
  exit 1
}

echo "🛠 Page de maintenance installée localement."

"$PUBLISH"

echo
echo "⏳ GitHub Pages déploie la nouvelle page."
echo "   Attente de 45 secondes avant ouverture…"

sleep 45

setsid -f /usr/bin/brave-browser \
  "${SITE_URL}/?maintenance=$(date +%s)" \
  >/dev/null 2>&1 || true

echo
echo "✅ Site ouvert. Si l’ancienne page apparaît encore,"
echo "   patienter une minute puis cliquer sur SITE."
