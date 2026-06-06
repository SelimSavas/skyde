#!/usr/bin/env bash
# GitHub Pages: docs/ klasöründen gizlilik politikası yayınlar.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
GIT=/usr/bin/git

# Komut satırı öncelikli; yoksa scripts/github_pages.local
CLI_USER="${GITHUB_USER:-}"
LOCAL_CFG="$ROOT/scripts/github_pages.local"
if [[ -f "$LOCAL_CFG" ]]; then
  # shellcheck disable=SC1090
  source "$LOCAL_CFG"
fi
if [[ -n "$CLI_USER" ]]; then
  GITHUB_USER="$CLI_USER"
fi
GITHUB_USER="${GITHUB_USER:-}"
REPO_NAME="${REPO_NAME:-skyde}"
BRANCH="${BRANCH:-main}"

if [[ -z "$GITHUB_USER" || "$GITHUB_USER" == "KULLANICI_ADINIZ" ]]; then
  echo "GitHub kullanıcı adınızı belirtin."
  echo ""
  echo "  1. https://github.com → giriş yapın"
  echo "  2. Sağ üst profil → profil sayfanızın URL'si:"
  echo "     https://github.com/KULLANICI_ADINIZ  ← bu kısım"
  echo ""
  echo "Sonra şunlardan birini yapın:"
  echo "  cp scripts/github_pages.local.example scripts/github_pages.local"
  echo "  # github_pages.local içinde GITHUB_USER=... doldurun"
  echo ""
  echo "  veya tek seferlik:"
  echo "  GITHUB_USER=KULLANICI_ADINIZ ./scripts/publish_github_pages.sh"
  exit 1
fi

REMOTE="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo "→ Kontrol: https://github.com/${GITHUB_USER}/${REPO_NAME}"
HTTP_CODE="$(curl -s -o /dev/null -w '%{http_code}' "https://github.com/${GITHUB_USER}/${REPO_NAME}" || true)"
if [[ "$HTTP_CODE" == "404" ]]; then
  echo ""
  echo "Repo henüz yok (404). Önce GitHub'da oluşturun:"
  echo "  https://github.com/new"
  echo "  Repository name: $REPO_NAME"
  echo "  Public — README / .gitignore EKLEMEYİN"
  echo "  Create repository"
  echo ""
  echo "Profil 404 ise kullanıcı adı yanlış: https://github.com/${GITHUB_USER}"
  exit 1
fi

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
if ! PUSH_OUT="$($GIT push -u origin "$BRANCH" 2>&1)"; then
  echo "$PUSH_OUT"
  echo ""
  if echo "$PUSH_OUT" | grep -q 'workflow scope'; then
    echo "Token'da 'workflow' izni eksik (.github/workflows/ci.yml için)."
    echo "  GitHub → Settings → Developer settings → Personal access tokens"
    echo "  Token'ı düzenleyin veya yenisini oluşturun:"
    echo "    ✓ repo"
    echo "    ✓ workflow"
    echo "  Sonra tekrar: ./scripts/publish_github_pages.sh"
  else
    echo "Push reddedildi. Olası nedenler:"
    echo "  • Personal Access Token: repo (+ workflow) izni"
    echo "  • Repo sahibi siz değilsiniz veya private"
  fi
  exit 1
fi

PAGES_URL="https://${GITHUB_USER}.github.io/${REPO_NAME}/privacy-policy.html"
echo ""
echo "✓ Push tamamlandı."
echo ""
echo "Pages açın (bir kez):"
echo "  https://github.com/${GITHUB_USER}/${REPO_NAME}/settings/pages"
echo "  Branch: $BRANCH  /  Folder: /docs  → Save"
echo ""
echo "  $PAGES_URL"
