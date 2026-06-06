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

GIT=/usr/bin/git

if [[ ! -d .git ]]; then
  $GIT init
  $GIT checkout -b "$BRANCH" 2>/dev/null || $GIT branch -M "$BRANCH"
fi

if ! $GIT rev-parse HEAD &>/dev/null; then
  $GIT add .
  $GIT commit -m "Initial commit: Skyde app + GitHub Pages privacy policy"
fi

if $GIT remote get-url origin &>/dev/null; then
  $GIT remote set-url origin "$REMOTE"
else
  $GIT remote add origin "$REMOTE"
fi

echo "→ Push: $REMOTE ($BRANCH)"
if ! $GIT push -u origin "$BRANCH"; then
  echo ""
  echo "Push başarısız. Önce GitHub'da boş repo oluşturun:"
  echo "  https://github.com/new"
  echo "  Repository name: $REPO_NAME"
  echo "  Public, README eklemeyin → Create repository"
  echo ""
  echo "Sonra tekrar: ./scripts/publish_github_pages.sh"
  exit 1
fi

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
