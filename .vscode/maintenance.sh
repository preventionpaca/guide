#!/usr/bin/env bash
set -euo pipefail

REPO="/home/rudy/Documents/Prevention_PACA/DEV/github-pages"
SOURCE="$REPO/index-maintenance.html"
TARGET="$REPO/index.html"
PUBLISH="/home/rudy/Documents/Prevention_PACA/DEV/github-pages/.vscode/publier.sh"

[[ -f "$SOURCE" ]] || {
  echo "❌ index-maintenance.html est introuvable."
  exit 1
}

cp -- "$SOURCE" "$TARGET"

cmp -s "$SOURCE" "$TARGET" || {
  echo "❌ La copie de la page de maintenance a échoué."
  exit 1
}

echo "🛠 Page de maintenance installée."
"$PUBLISH"
