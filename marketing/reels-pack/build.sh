#!/usr/bin/env bash
# Usage: ./build.sh <reel-dir> <duration> <lufs>   → <reel-dir>/<reel-dir>.mp4
set -euo pipefail
cd "$(dirname "$0")"
reel="$1"; dur="$2"; lufs="${3:--16}"
tmp="$(mktemp -d)"
node shared/render.js "$reel" video "$tmp/silent.mp4" "$dur"
python3 "$reel/audio.py" "$tmp/mix.wav"
ffmpeg -v error -y -i "$tmp/silent.mp4" -i "$tmp/mix.wav" -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=${lufs}:TP=-1.5:LRA=9" -ar 48000 -c:a aac -b:a 192k -movflags +faststart -shortest \
  "$reel/skyde-$reel.mp4"
rm -rf "$tmp"
echo "built $reel/skyde-$reel.mp4"
