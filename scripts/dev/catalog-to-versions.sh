#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CATALOG_FILE="$ROOT_DIR/pnpm-workspace.yaml"

# Function to get version from catalog
get_version() {
    local pkg="$1"
    # Handle both quoted and unquoted package names in YAML
    grep -E "^[[:space:]]*['\"]?${pkg}['\"]?:" "$CATALOG_FILE" | sed "s/.*:[[:space:]]*//" | sed "s/^['\"]//;s/['\"]$//"
}

# Function to update all dependencies that exist in catalog
update_package_json() {
    local file="$1"
    echo "Updating $file"

    # Get all dependency names from package.json
    local deps=$(jq -r '(.dependencies // {}) | keys[]' "$file")
    local devDeps=$(jq -r '(.devDependencies // {}) | keys[]' "$file")

    for pkg in $deps; do
        local version=$(get_version "$pkg")
        if [ -n "$version" ]; then
            echo "  $pkg -> $version"
            local tmp=$(mktemp)
            jq --arg pkg "$pkg" --arg ver "$version" '.dependencies[$pkg] = $ver' "$file" > "$tmp" && mv "$tmp" "$file"
        fi
    done

    for pkg in $devDeps; do
        local version=$(get_version "$pkg")
        if [ -n "$version" ]; then
            echo "  $pkg -> $version (dev)"
            local tmp=$(mktemp)
            jq --arg pkg "$pkg" --arg ver "$version" '.devDependencies[$pkg] = $ver' "$file" > "$tmp" && mv "$tmp" "$file"
        fi
    done
}

# Update mcli
update_package_json "$ROOT_DIR/mcli/package.json"

# Update libs/common
update_package_json "$ROOT_DIR/libs/common/package.json"

# Update libs/node-common
update_package_json "$ROOT_DIR/libs/node-common/package.json"

# Replace workspace:* with file: in node-common
echo "Updating @mprove/common reference in node-common"
tmp=$(mktemp)
jq '.dependencies["@mprove/common"] = "file:../common"' "$ROOT_DIR/libs/node-common/package.json" > "$tmp" && mv "$tmp" "$ROOT_DIR/libs/node-common/package.json"

echo "Done! Catalog versions copied to package.json files for mcli, common, node-common"
