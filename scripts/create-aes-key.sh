#!/usr/bin/env bash
set -euo pipefail

OUTPUT_DIR="."

# Generate 32 random bytes and encode as base64
AES_KEY_BASE64=$(openssl rand -base64 32 | tr -d '\n')

TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')

FILENAME="${OUTPUT_DIR}/.env_aes_${TIMESTAMP}.env"

mkdir -p "$OUTPUT_DIR"

printf 'BACKEND_AES_KEY="%s"\n' "$AES_KEY_BASE64" > "$FILENAME"

echo "Key written to $FILENAME"