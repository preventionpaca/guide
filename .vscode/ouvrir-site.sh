#!/usr/bin/env bash
setsid -f /usr/bin/brave-browser \
  "https://preventionpaca.github.io/guide/?v=$(date +%s)" \
  >/dev/null 2>&1
exit 0
