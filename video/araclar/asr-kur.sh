#!/usr/bin/env bash
# Çevrimdışı Whisper ortamını kurar (npm kayıt deposu yeterli; model sts-whisper-small paketinin içinde, ~700 MB).
# bash video/araclar/asr-kur.sh [klasör=/tmp/asr]
set -e
D="${1:-/tmp/asr}"
mkdir -p "$D" && cd "$D"
[ -f package.json ] || npm init -y >/dev/null
npm i --no-audit --no-fund @huggingface/transformers sts-whisper-small
echo "ASR hazır: $D"
