#!/usr/bin/env bash
set -euo pipefail

REPO="/home/rudy/Documents/Prevention_PACA/DEV/github-pages"
cd "$REPO"

echo "🔍 Vérification du dépôt…"
git add -A

if git diff --cached --quiet; then
  echo "ℹ️ Aucune modification à publier."
  exit 0
fi

git commit -m "Publication du site - $(date '+%d/%m/%Y à %H:%M:%S')"
git push origin main

echo "✅ SITE PUBLIÉ"
