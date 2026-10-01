#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
PATCH_DIR="$ROOT_DIR/pnpm-patches/mcp-nest"

cd "$ROOT_DIR"

# pnpm applies the registered patch while extracting the full package. It
# refuses a non-empty directory, preserving any existing manual edits.
pnpm patch @rekog/mcp-nest@2.0.7 --edit-dir "$PATCH_DIR"
