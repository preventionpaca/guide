#!/usr/bin/env bash
set -euo pipefail

REPO="/home/rudy/Documents/Prevention_PACA/DEV/github-pages"
CONFIG="$REPO/site-config.js"
INDEX="$REPO/index.html"
INDEX_PRODUCTION="$REPO/index-production.html"
ATTENDRE="$REPO/.vscode/attendre-github-pages.sh"

cd "$REPO"

TOKEN_CACHE="$(date +%Y%m%d%H%M%S)"

cat > "$CONFIG" <<'CONFIGEOF'
// Configuration globale du portail Prévention PACA
// false = site en ligne
// true  = page de maintenance

window.MAINTENANCE = true;
CONFIGEOF

# Renouvelle le numéro de version du script pour éviter un ancien cache navigateur
python3 - "$INDEX" "$INDEX_PRODUCTION" "$TOKEN_CACHE" <<'PYEOF'
import re
import sys
from pathlib import Path

token = sys.argv[3]

for filename in sys.argv[1:3]:
    path = Path(filename)

    if not path.exists():
        continue

    content = path.read_text(encoding="utf-8")

    content, count = re.subn(
        r'site-config\.js(?:\?v=[^"\']*)?',
        f'site-config.js?v={token}',
        content
    )

    if count:
        path.write_text(content, encoding="utf-8")
PYEOF

git add site-config.js index.html

if [[ -f "$INDEX_PRODUCTION" ]]; then
  git add index-production.html
fi

if git diff --cached --quiet; then
  echo "ℹ️ Le site est déjà configuré en maintenance."
  SHA="$(git rev-parse HEAD)"
else
  git commit -m "Activation maintenance - $(date '+%d/%m/%Y à %H:%M:%S')"
  git push origin main
  SHA="$(git rev-parse HEAD)"
fi

echo
echo "🛠 Mode maintenance envoyé sur GitHub."
"$ATTENDRE" "$SHA" true
