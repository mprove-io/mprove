#!/usr/bin/env bash

set -euo pipefail

: "${OPENCODE_ZEN_API_KEY:?OPENCODE_ZEN_API_KEY is not set}"

# curl --fail-with-body --silent --show-error \
curl \
  https://opencode.ai/zen/v1/chat/completions \
  -H "Authorization: Bearer $OPENCODE_ZEN_API_KEY" \
  -d '{"model":"deepseek-v4-flash","messages":[{"role":"user","content":"Hello"}]}'
