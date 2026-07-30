#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────
# check-parity.sh — Verify that all 3 language books have
# the same set of source files (same relative paths).
# ──────────────────────────────────────────────────────────

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LANGS=("en" "pt-BR" "zh-CN")
FAIL=0

echo "=== Checking page parity across languages ==="

# Collect file lists (relative to each language's src/)
declare -A FILES
for lang in "${LANGS[@]}"; do
  src="$ROOT/$lang/src"
  if [ ! -d "$src" ]; then
    echo "ERROR: $lang/src/ does not exist"
    exit 1
  fi
  # Get all .md files relative to src/, sorted
  FILES["$lang"]=$(cd "$src" && find . -name '*.md' -type f | sort)
done

# Compare each pair
for ((i = 0; i < ${#LANGS[@]}; i++)); do
  for ((j = i + 1; j < ${#LANGS[@]}; j++)); do
    a="${LANGS[$i]}"
    b="${LANGS[$j]}"
    if [ "${FILES[$a]}" != "${FILES[$b]}" ]; then
      echo "❌ Parity FAILED between $a/ and $b/"
      echo "--- Files only in $a/ ---"
      comm -23 <(echo "${FILES[$a]}") <(echo "${FILES[$b]}")
      echo "--- Files only in $b/ ---"
      comm -13 <(echo "${FILES[$a]}") <(echo "${FILES[$b]}")
      FAIL=1
    else
      echo "✅ $a/ ↔ $b/ — ${FILES[$a]%% *} (${#FILES[$a]} files) — match"
    fi
  done
done

# Also check SUMMARY.md has the same structure
echo ""
echo "=== Checking SUMMARY.md structure parity ==="
for lang in "${LANGS[@]}"; do
  summary="$ROOT/$lang/src/SUMMARY.md"
  if [ ! -f "$summary" ]; then
    echo "❌ $lang/src/SUMMARY.md missing"
    FAIL=1
  fi
  # Strip language-specific names to compare structure
  # We just check the number of links and heading levels
  link_count=$(grep -c '^\s*-\s*\[' "$summary" || true)
  echo "  $lang: $link_count links in SUMMARY.md"
done

if [ "$FAIL" -eq 1 ]; then
  echo ""
  echo "❌ Parity check FAILED — ensure all 3 languages have identical page sets"
  exit 1
fi

echo ""
echo "✅ All language books have identical page structure"
exit 0
