#!/usr/bin/env bash
# Stage deployable copies of the three Netlify sites (strips QA/scratch/source-only folders).
# usage: scripts/stage.sh [outdir]   (default: /tmp/cd-dist)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-/tmp/cd-dist}"
EXCL=(--exclude='_qa' --exclude='_src' --exclude='_gen' --exclude='_build' --exclude='node_modules' --exclude='frames-*' --exclude='*.psd' --exclude='READY' --exclude='*.log' --exclude='.DS_Store' --exclude='./scripts')
for pair in "sites/bazaar:bazaar" "sites/royal:royal" "hub:hub"; do
  src="$ROOT/${pair%%:*}"; dst="$OUT/${pair##*:}"
  rm -rf "$dst"; mkdir -p "$dst"
  tar -C "$src" "${EXCL[@]}" -cf - . | tar -C "$dst" -xf -
  printf '%-7s %6s files  %s\n' "${pair##*:}" "$(find "$dst" -type f | wc -l)" "$(du -sh "$dst" | cut -f1)"
done
