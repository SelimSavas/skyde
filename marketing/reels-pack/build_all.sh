#!/usr/bin/env bash
# Rebuild every reel with its voiceover (durations from warp.json), three at a time.
cd "$(dirname "$0")"
for reel in 0*/; do
  reel="${reel%/}"
  dur=$(python3 -c "import json;print(json.load(open('$reel/warp.json'))['duration'])")
  ./build.sh "$reel" "$dur" -14 &
  while [ "$(jobs -r | wc -l)" -ge 3 ]; do sleep 2; done
done
wait
