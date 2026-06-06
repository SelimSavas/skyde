#!/usr/bin/env bash
# GitHub Pages: docs/ klasöründen gizlilik politikası yayınlar.
#
# Kullanım:
#   GITHUB_USER=16savasselim REPO_NAME=skyde ./scripts/publish_github_pages.sh
#
# İlk çalıştırmada GitHub'da boş repo oluşturun (README eklemeyin):
#   https://github.com/new → skyde → Create repository
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

GITHUB_USER="${GITHUB_USER:-16savasselim}"
REPO_NAME="${REPO_NAME:-skyde}"
REMOTE="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
BRANCH="${BRANCH:-main}"

if [[ ! -d .git ]]; then
  git init -b "$BRANCH"
fi

if ! git rev-parse HEAD &>/dev/null; then
  git add .
  git commit -m "$(cat <<'EOF'
Initial commit: Skyde app + GitHub Pages privacy policy.

EOF
)"
fi

if git remote get-url origin &>/dev/null; then
  git remote set-url origin "$REMOTE"
else
  git remote add origin "$REMOTE"
fi

echo "→ Push: $REMOTE ($BRANCH)"
git push -u origin "$BRANCH"

PAGES_URL="https://${GITHUB_USER}.github.io/${REPO_NAME}/privacy-policy.html"
echo ""
echo "✓ Push tamamlandı."
echo ""
echo "GitHub Pages etkinleştirme (bir kez):"
echo "  1. https://github.com/${GITHUB_USER}/${REPO_NAME}/settings/pages"
echo "  2. Source: Deploy from a branch"
echo "  3. Branch: $BRANCH  /  Folder: /docs"
echo "  4. Save — 1-2 dk sonra yayında:"
echo ""
echo "  $PAGES_URL"
echo ""
echo "Play Console ve App Store Connect'e bu URL'yi girin."
