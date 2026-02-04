#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

# Check .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found at $ENV_FILE"
    exit 1
fi

# Parse MPROVE_RELEASE_TAG from .env file
VERSION=$(grep -E "^MPROVE_RELEASE_TAG=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | tr -d "'")

# Validate version was found
if [ -z "$VERSION" ]; then
    echo "Error: MPROVE_RELEASE_TAG not found in $ENV_FILE"
    exit 1
fi

echo "Updating all package.json versions to: $VERSION"

# Function to update version in a package.json
update_version() {
    local file="$1"
    echo "  Updating $file"
    local tmp=$(mktemp)
    jq --arg ver "$VERSION" '.version = $ver' "$file" > "$tmp" && mv "$tmp" "$file"
}

# Update all package.json files
update_version "$ROOT_DIR/package.json"
update_version "$ROOT_DIR/apps/backend/package.json"
update_version "$ROOT_DIR/apps/blockml/package.json"
update_version "$ROOT_DIR/apps/disk/package.json"
update_version "$ROOT_DIR/apps/front/package.json"
update_version "$ROOT_DIR/libs/common/package.json"
update_version "$ROOT_DIR/libs/node-common/package.json"
update_version "$ROOT_DIR/mcli/package.json"

echo "Done! All package.json versions updated to $VERSION"
