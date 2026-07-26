#!/usr/bin/env bash
set -euo pipefail

cd "/home/rudy/Documents/Prevention_PACA/DEV/github-pages"

echo
echo "===== 15 DERNIÈRES PUBLICATIONS ====="
git log -15 \
  --date=format:'%d/%m/%Y %H:%M' \
  --pretty=format:'%C(yellow)%h%Creset  %ad  %s'
echo
echo
