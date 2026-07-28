#!/usr/bin/env bash

set -euo pipefail

: "${OPENCODE_ZEN_API_KEY:?OPENCODE_ZEN_API_KEY is not set}"

curl --fail-with-body --silent --show-error \
  https://opencode.ai/zen/v1/chat/completions \
  -H "Authorization: Bearer $OPENCODE_ZEN_API_KEY" \
  -H "content-type: application/json" \
  -d '{"model":"big-pickle","max_tokens":10,"messages":[{"role":"user","content":"Reply with OK"}]}'
