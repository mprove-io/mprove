#!/usr/bin/env bash

# ──────────────────────────────────────────────────────────────────────────────
# Extension/high-CPU process monitor for devcontainer troubleshooting
# Logs to timestamped file in current project folder
# Runs in foreground → Ctrl+C stops it cleanly
# ──────────────────────────────────────────────────────────────────────────────

# Use Bash-compatible strict mode (pipefail skipped if not supported)
set -eu
if set -o pipefail 2>/dev/null; then
  set -o pipefail
fi

LOGFILE="${PWD}/ext-monitor-log_$(date +%Y%m%d-%H%M%S).log"

echo "Extension process monitor started at $(date)" | tee "$LOGFILE"
echo "Project dir: $PWD"                        | tee -a "$LOGFILE"
echo "Press Ctrl+C to stop logging cleanly"     | tee -a "$LOGFILE"
echo ""                                         | tee -a "$LOGFILE"

# Clean exit message on Ctrl+C
trap 'echo "Ctrl+C received - stopping monitor at $(date)" | tee -a "$LOGFILE"; exit 0' INT

while true; do
  echo "=== $(date '+%Y-%m-%d %H:%M:%S') ===" | tee -a "$LOGFILE"
  
  # Capture top CPU consumers — searching for claude-related processes
  ps aux --sort=-%cpu \
    | grep -Ei 'claude|Code Helper|extension-host|node.*claude|mcp|anthropic' \
    | grep -v grep \
    | head -40 \
    | tee -a "$LOGFILE" || true
  
  echo "" | tee -a "$LOGFILE"
  
  # Count and list claude-related processes (detect accumulation/orphans)
  echo "Count of claude-related processes: $(pgrep -f claude | wc -l)" | tee -a "$LOGFILE"
  
  pgrep -f claude \
    | xargs -r ps -o pid,ppid,stat,%cpu,%mem,cmd --no-headers \
    | tee -a "$LOGFILE" 2>/dev/null \
    || echo "No claude-related PIDs found" | tee -a "$LOGFILE"
  
  # Process tree view (helps spot orphaned processes with PPID 1)
  if command -v pstree >/dev/null 2>&1; then
    pstree -p \
      | grep -Ei 'claude|Code|node' \
      | tee -a "$LOGFILE" 2>/dev/null || true
  fi
  
  echo "----------------------------------------" | tee -a "$LOGFILE"
  
  sleep 8   # logging interval — increase to 15–30 if file grows too fast
done