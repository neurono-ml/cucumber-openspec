#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────
# build-all.sh — Build all 3 language mdbooks into book/public/
# with language index redirect.
# ──────────────────────────────────────────────────────────

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUBLIC="$ROOT/public"
LANGS=("en" "pt-BR" "zh-CN")

echo "=== Building documentation for all languages ==="

# Clean public dir
rm -rf "$PUBLIC"
mkdir -p "$PUBLIC"

# Build each language
for lang in "${LANGS[@]}"; do
  echo "  Building $lang..."
  mdbook build "$ROOT/$lang"
  mv "$ROOT/$lang/book" "$PUBLIC/$lang"
done

# Create root index.html with language redirect
cat > "$PUBLIC/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>cucumber-openspec</title>
<script>
(function() {
  var langs = ['en', 'pt-BR', 'zh-CN'];
  var preferred = navigator.language || navigator.userLanguage || 'en';
  var lang = 'en';
  // Match primary language subtag
  var primary = preferred.split('-')[0].toLowerCase();
  if (primary === 'pt') lang = 'pt-BR';
  else if (primary === 'zh') lang = 'zh-CN';
  else if (primary === 'en') lang = 'en';
  window.location.href = lang + '/';
})();
</script>
</head>
<body>
<p>Redirecting to documentation…</p>
<ul>
  <li><a href="en/">English</a></li>
  <li><a href="pt-BR/">Português (Brasil)</a></li>
  <li><a href="zh-CN/">简体中文</a></li>
</ul>
</body>
</html>
EOF

echo ""
echo "✅ Documentation built at $PUBLIC"
echo "  ├── index.html  (language auto-redirect)"
for lang in "${LANGS[@]}"; do
  echo "  ├── $lang/"
done
echo "  └── (3 languages)"
