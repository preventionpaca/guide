#!/usr/bin/env bash
set -euo pipefail

REPO="/home/rudy/Documents/Prevention_PACA/DEV/github-pages"
SOURCE="$REPO/index-production.html"
TARGET="$REPO/index.html"
PUBLISH="/home/rudy/Documents/Prevention_PACA/DEV/github-pages/.vscode/publier.sh"

[[ -f "$SOURCE" ]] || {
  echo "❌ index-production.html est introuvable."
  exit 1
}

cp -- "$SOURCE" "$TARGET"

cmp -s "$SOURCE" "$TARGET" || {
  echo "❌ La restauration de la production a échoué."
  exit 1
}

echo "✅ Page de production restaurée."
"$PUBLISH"
