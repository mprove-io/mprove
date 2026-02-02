#!/bin/bash
set -e

# Add all libs/node-common dependencies to root package.json devDependencies
# This ensures pnpm hoists them for Docker runtime resolution

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
ROOT_PKG="$ROOT_DIR/package.json"
NODE_COMMON_PKG="$ROOT_DIR/libs/node-common/package.json"

# Get dependencies from node-common (excluding @mprove/* workspace packages)
NODE_COMMON_DEPS=$(jq -r '(.dependencies // {}) | keys[] | select(startswith("@mprove/") | not)' "$NODE_COMMON_PKG")

# Get existing devDependencies from root
ROOT_DEV_DEPS=$(jq -r '(.devDependencies // {}) | keys[]' "$ROOT_PKG")

ADDED=()

for dep in $NODE_COMMON_DEPS; do
    if ! echo "$ROOT_DEV_DEPS" | grep -qx "$dep"; then
        echo "Adding: $dep"
        tmp=$(mktemp)
        jq --arg pkg "$dep" '.devDependencies[$pkg] = "catalog:"' "$ROOT_PKG" > "$tmp" && mv "$tmp" "$ROOT_PKG"
        ADDED+=("$dep")
    fi
done

if [ ${#ADDED[@]} -eq 0 ]; then
    echo "✓ No new dependencies to add"
else
    # Sort devDependencies alphabetically
    tmp=$(mktemp)
    jq '.devDependencies = (.devDependencies | to_entries | sort_by(.key) | from_entries)' "$ROOT_PKG" > "$tmp" && mv "$tmp" "$ROOT_PKG"

    echo ""
    echo "✓ Added ${#ADDED[@]} dependencies to root package.json"
    echo "Run 'pnpm install' to update lockfile"
fi
