#!/usr/bin/env bash
set -euo pipefail

CLAUDE_DIR="${HOME}/.claude"

if [ ! -d "$CLAUDE_DIR" ]; then
  echo "No ~/.claude directory found"
  exit 0
fi

DIRS=(
  debug
  file-history
  todos
  shell-snapshots
  telemetry
  plugins
  session-env
  statsig
  ide
  backups
  plans
)

FILES=(
  stats-cache.json
  history.jsonl
)

for dir in "${DIRS[@]}"; do
  target="${CLAUDE_DIR}/${dir}"
  if [ -d "$target" ]; then
    rm -rf "$target"
    echo "Removed ${target}"
  fi
done

for file in "${FILES[@]}"; do
  target="${CLAUDE_DIR}/${file}"
  if [ -f "$target" ]; then
    rm -f "$target"
    echo "Removed ${target}"
  fi
done

echo "Done. Auth and settings preserved."
