#!/usr/bin/env bash
setsid -f /usr/bin/brave-browser \
  "https://github.com/preventionpaca/guide" \
  >/dev/null 2>&1
exit 0
