#!/usr/bin/env bash
# Yayın sürümü: sesli filmi (video/out/<bolum>-seslendirme.mp4) YouTube ve Instagram için kodlar ve sesi
# −14 LUFS'e (gerçek tepe −1 dBTP) iki geçişli loudnorm ile getirir. Platformlar sesi bu düzeye çeker; böylece
# videonun sesi ne kısılır ne bozulur, bütün shortlar aynı yükseklikte çalar.
#   bash video/araclar/yayin.sh <bolum> [cikti=video/out/<bolum>-youtube.mp4]
set -e
B="$1"; R="$(cd "$(dirname "$0")/../.." && pwd)"; IN="$R/video/out/$B-seslendirme.mp4"; OUT="${2:-$R/video/out/$B-youtube.mp4}"
[ -f "$IN" ] || { echo "Yok: $IN (önce: node video/dub.mjs $B --kayit ...)"; exit 1; }
J=$(ffmpeg -hide_banner -nostats -i "$IN" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
AF="loudnorm=I=-14:TP=-1:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true"
ffmpeg -loglevel error -y -i "$IN" -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -af "$AF" -ar 48000 -c:a aac -b:a 192k -movflags +faststart "$OUT"
echo "$OUT"
ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^ +(I|Peak):" | tail -2
