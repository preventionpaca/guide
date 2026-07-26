#!/usr/bin/env bash
set -euo pipefail

REPO="/home/rudy/Documents/Prevention_PACA/DEV/github-pages"
SOURCE="$REPO/index-production.html"
TARGET="$REPO/index.html"
PUBLISH="$REPO/.vscode/publier.sh"
SITE_URL="https://preventionpaca.github.io/guide"

[[ -f "$SOURCE" ]] || {
  echo "❌ index-production.html est introuvable."
  exit 1
}

cp -- "$SOURCE" "$TARGET"

cmp -s "$SOURCE" "$TARGET" || {
  echo "❌ La restauration de la production a échoué."
  exit 1
}

echo "✅ Page de production restaurée localement."

"$PUBLISH"

echo
echo "⏳ GitHub Pages déploie le portail."
echo "   Attente de 45 secondes avant ouverture…"

sleep 45

setsid -f /usr/bin/brave-browser \
  "${SITE_URL}/?production=$(date +%s)" \
  >/dev/null 2>&1 || true

echo
echo "✅ Site ouvert. Si la maintenance apparaît encore,"
echo "   patienter une minute puis cliquer sur SITE."
