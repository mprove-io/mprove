#!/usr/bin/env bash
set -euo pipefail

FILE="$1"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

# Get path relative to project root
REL="${FILE#"$ROOT/"}"

if [[ "$REL" == mcli/* ]]; then
  # Strip mcli/ prefix to get path relative to mcli/
  MCLI_REL="${REL#mcli/}"
  cd "$ROOT/mcli"
  exec dotenv -e ../.env -- bun test --timeout 150000 "$MCLI_REL"

elif [[ "$REL" == apps/disk/* ]]; then
  SRC_REL="${REL#apps/disk/}"
  COMPILED="dist-test/${SRC_REL%.ts}.js"
  cd "$ROOT/apps/disk"
  node compile-test.mjs
  exec dotenv -e ../../.env -v IS_TELEMETRY_ENABLED=FALSE -- \
    npx ava --config ava.compiled.config.js "$COMPILED"

elif [[ "$REL" == apps/blockml/* ]]; then
  SRC_REL="${REL#apps/blockml/}"
  COMPILED="dist-test/${SRC_REL%.ts}.js"
  cd "$ROOT/apps/blockml"
  node compile-test.mjs
  exec dotenv -e ../../.env -v BLOCKML_LOG_IO=TRUE -v IS_TELEMETRY_ENABLED=FALSE -- \
    npx ava --config ava.compiled.config.js "$COMPILED"

elif [[ "$REL" == apps/backend/* ]]; then
  SRC_REL="${REL#apps/backend/}"
  COMPILED="dist-e2e/${SRC_REL%.ts}.js"
  cd "$ROOT/apps/backend"
  node compile-e2e.mjs
  exec dotenv -e ../../.env -v IS_TELEMETRY_ENABLED=FALSE -- \
    npx ava --config ava.e2e.compiled.config.js "$COMPILED"

else
  echo "Unknown app for file: $REL"
  exit 1
fi
