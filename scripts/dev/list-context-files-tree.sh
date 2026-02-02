#!/bin/bash
# Lists files and folders for CONTEXT.md files tree
# Usage: ./scripts/dev/list-context-files-tree.sh [directory...]
# Sorting: folders first, then by symbol order (_, ., a-z) case-insensitive

list_tree() {
  local dir="$1"
  (
    cd "$dir" || exit 1
    ls -1a | grep -v '^\.\.$' | grep -v '^\.$' | while read f; do
      if [ -d "$f" ]; then
        prefix="0"
        name="$f/"
      else
        prefix="1"
        name="$f"
      fi
      first_char="${f:0:1}"
      if [ "$first_char" = "_" ]; then
        order="0"
      elif [ "$first_char" = "." ]; then
        order="1"
      else
        order="2"
      fi
      echo "${prefix}|${order}|${f}|${name}"
    done | sort -f -t'|' -k1,1 -k2,2 -k3,3 | cut -d'|' -f4
  )
}

if [ $# -eq 0 ]; then
  list_tree "."
elif [ $# -eq 1 ]; then
  list_tree "$1"
else
  for dir in "$@"; do
    echo "=== $dir ==="
    list_tree "$dir"
    echo ""
  done
fi