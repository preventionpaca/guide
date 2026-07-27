#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# Prévention PACA — suivi réel du déploiement GitHub Pages
# Version 1.1.0
###############################################################################

REPO_GITHUB="preventionpaca/guide"
SITE_URL="https://preventionpaca.github.io/guide"
BRAVE="/usr/bin/brave-browser"

SHA_ATTENDU="${1:-}"
MODE_ATTENDU="${2:-}"

INTERVALLE=2
MAX_ATTENTE=600

if [[ -z "$SHA_ATTENDU" ]]; then
  echo "❌ Commit Git absent."
  exit 1
fi

if [[ "$MODE_ATTENDU" != "true" && "$MODE_ATTENDU" != "false" ]]; then
  echo "❌ Mode attendu incorrect : $MODE_ATTENDU"
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "❌ GitHub CLI est introuvable."
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "❌ curl est introuvable."
  exit 1
fi

DEBUT=$(date +%s)
DERNIER_ETAT=""
CONFIRME=false

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏳ SUIVI RÉEL DU DÉPLOIEMENT GITHUB PAGES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Commit envoyé : ${SHA_ATTENDU:0:7}"

if [[ "$MODE_ATTENDU" == "true" ]]; then
  echo "État attendu : MAINTENANCE"
else
  echo "État attendu : EN LIGNE"
fi

echo

while true
do
  MAINTENANT=$(date +%s)
  ECOULE=$((MAINTENANT - DEBUT))

  if (( ECOULE >= MAX_ATTENTE )); then
    echo
    echo
    echo "❌ Délai maximal atteint après ${ECOULE} secondes."
    echo "Le push a réussi, mais le site public n'a pas confirmé le nouvel état."
    exit 1
  fi

  ###########################################################################
  # 1. Lecture de l'état GitHub Pages
  ###########################################################################

  REPONSE_API=$(
    gh api \
      -H "Accept: application/vnd.github+json" \
      "repos/$REPO_GITHUB/pages/builds/latest" \
      2>/dev/null || true
  )

  BUILD_SHA=""
  BUILD_STATUS="indisponible"

  if [[ -n "$REPONSE_API" ]]; then
    BUILD_SHA=$(
      python3 -c '
import json
import sys

try:
    data = json.load(sys.stdin)
    print(data.get("commit") or "")
except Exception:
    print("")
' <<< "$REPONSE_API"
    )

    BUILD_STATUS=$(
      python3 -c '
import json
import sys

try:
    data = json.load(sys.stdin)
    print(data.get("status") or "inconnu")
except Exception:
    print("inconnu")
' <<< "$REPONSE_API"
    )
  fi

  case "$BUILD_STATUS" in
    queued)
      ETAT_GITHUB="en file d’attente"
      ;;
    building)
      ETAT_GITHUB="construction en cours"
      ;;
    built)
      ETAT_GITHUB="build terminé"
      ;;
    errored|error|failed|failure)
      echo
      echo
      echo "❌ GitHub Pages signale un échec du déploiement."
      exit 1
      ;;
    *)
      ETAT_GITHUB="$BUILD_STATUS"
      ;;
  esac

  ###########################################################################
  # 2. Vérification réelle du fichier actuellement servi
  ###########################################################################

  CONFIG_DISTANTE=$(
    curl \
      --fail \
      --silent \
      --show-error \
      --location \
      --connect-timeout 8 \
      --max-time 15 \
      -H "Cache-Control: no-cache, no-store, must-revalidate" \
      -H "Pragma: no-cache" \
      "${SITE_URL}/site-config.js?commit=${SHA_ATTENDU}&t=${MAINTENANT}" \
      2>/dev/null || true
  )

  if grep -Eq \
    "window[.]MAINTENANCE[[:space:]]*=[[:space:]]*${MODE_ATTENDU}[[:space:]]*;" \
    <<< "$CONFIG_DISTANTE"
  then
    CONFIRME=true
  fi

  ###########################################################################
  # 3. Affichage du temps réellement écoulé
  ###########################################################################

  if [[ -n "$BUILD_SHA" ]]; then
    SHA_AFFICHE="${BUILD_SHA:0:7}"
  else
    SHA_AFFICHE="-------"
  fi

  LIGNE="⏳ ${ECOULE} s — GitHub : ${ETAT_GITHUB} — build : ${SHA_AFFICHE}"

  if [[ "$LIGNE" != "$DERNIER_ETAT" ]]; then
    printf "\r%-100s" "$LIGNE"
    DERNIER_ETAT="$LIGNE"
  fi

  ###########################################################################
  # 4. Arrêt dès que le véritable site public est à jour
  ###########################################################################

  if [[ "$CONFIRME" == true ]]; then
    echo
    echo
    break
  fi

  sleep "$INTERVALLE"
done

DUREE=$(( $(date +%s) - DEBUT ))

echo "✅ Le fichier public site-config.js confirme le nouvel état."
echo "✅ Temps réellement observé : ${DUREE} secondes."

if [[ "$MODE_ATTENDU" == "true" ]]; then
  echo "🛠 Le portail public est maintenant en maintenance."
  PARAMETRE="maintenance"
else
  echo "🌐 Le portail public est maintenant en ligne."
  PARAMETRE="production"
fi

URL_FINALE="${SITE_URL}/?${PARAMETRE}=${SHA_ATTENDU}&t=$(date +%s)"

echo
echo "🌐 Ouverture automatique dans Brave…"

if [[ -x "$BRAVE" ]]; then
  setsid -f "$BRAVE" "$URL_FINALE" >/dev/null 2>&1 || true
elif command -v brave-browser >/dev/null 2>&1; then
  setsid -f brave-browser "$URL_FINALE" >/dev/null 2>&1 || true
elif command -v brave >/dev/null 2>&1; then
  setsid -f brave "$URL_FINALE" >/dev/null 2>&1 || true
else
  echo "⚠️ Brave est introuvable."
  echo "Ouvre manuellement :"
  echo "$URL_FINALE"
fi

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ OPÉRATION TERMINÉE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
