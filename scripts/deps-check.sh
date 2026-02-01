#!/bin/bash
set -e

# Check that all libs/node-common dependencies are in root package.json
# This ensures pnpm hoists them for Docker runtime resolution

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ROOT_PKG="$ROOT_DIR/package.json"
NODE_COMMON_PKG="$ROOT_DIR/libs/node-common/package.json"

# Get dependencies from node-common (excluding @mprove/* workspace packages)
NODE_COMMON_DEPS=$(jq -r '(.dependencies // {}) | keys[] | select(startswith("@mprove/") | not)' "$NODE_COMMON_PKG" | sort)

# Get devDependencies from root
ROOT_DEV_DEPS=$(jq -r '(.devDependencies // {}) | keys[]' "$ROOT_PKG" | sort)

MISSING=()

for dep in $NODE_COMMON_DEPS; do
    if ! echo "$ROOT_DEV_DEPS" | grep -qx "$dep"; then
        MISSING+=("$dep")
    fi
done

if [ ${#MISSING[@]} -eq 0 ]; then
    echo "✓ All libs/node-common dependencies are in root package.json"
    exit 0
else
    echo "✗ Missing dependencies in root package.json devDependencies:"
    for dep in "${MISSING[@]}"; do
        echo "  - $dep"
    done
    echo ""
    echo "Run 'pnpm deps-write' to fix this."
    exit 1
fi
